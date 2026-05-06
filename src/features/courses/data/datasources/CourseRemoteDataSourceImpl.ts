import { DB_URL } from '@/src/config/constants';
import { LocalPreferencesAsyncStorage } from '@/src/core/LocalPreferencesAsyncStorage';
import { AuthRemoteDataSourceImpl } from '@/src/features/auth/data/datasources/AuthRemoteDataSourceImpl';
import { Activity, NewActivity } from '../../domain/entities/Activity';
import { Course, NewCourse } from '../../domain/entities/Course';
import { EvaluationGrades, EvaluationResult, StudentAverage } from '../../domain/entities/Evaluation';
import { Group, MyGroupSummary } from '../../domain/entities/Group';
import { CourseRemoteDataSource } from './CourseRemoteDataSource';

function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export class CourseRemoteDataSourceImpl implements CourseRemoteDataSource {
  private readonly prefs = LocalPreferencesAsyncStorage.getInstance();

  constructor(private readonly authDS: AuthRemoteDataSourceImpl) {}

  private async authHeader(): Promise<Record<string, string>> {
    const token = await this.prefs.retrieveData<string>('token');
    return { Authorization: `Bearer ${token}` };
  }

  private async dbGet<T>(params: Record<string, string>): Promise<T[]> {
    const headers = await this.authHeader();
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${DB_URL}/read?${query}`, { headers });
    if (res.status !== 200) throw new Error('Error al consultar datos');
    return res.json() as Promise<T[]>;
  }

  private async dbInsert(tableName: string, records: unknown[]): Promise<void> {
    const headers = { ...(await this.authHeader()), 'Content-Type': 'application/json' };
    const res = await fetch(`${DB_URL}/insert`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ tableName, records }),
    });
    if (res.status !== 201) throw new Error('Error al insertar datos');
  }

  // ─── COURSES ────────────────────────────────────────────────────────────────
  async getCoursesByUser(userId: string, rol: string): Promise<Course[]> {
    if (rol === 'profesor') {
      return this.dbGet<Course>({ tableName: 'course', profesor_id: userId });
    }
    const memberships = await this.dbGet<{ course_id: string }>(
      { tableName: 'course_members', estudiante_id: userId },
    );
    if (!memberships.length) return [];
    const courses: Course[] = [];
    for (const m of memberships) {
      try {
        const result = await this.dbGet<Course>({ tableName: 'course', _id: m.course_id });
        if (result.length) courses.push(result[0]);
      } catch {}
    }
    return courses;
  }

  async createCourse(course: NewCourse): Promise<void> {
    await this.dbInsert('course', [course]);
  }

  // ─── ACTIVITIES ─────────────────────────────────────────────────────────────
  async getActivitiesByCourse(courseId: string): Promise<Activity[]> {
    return this.dbGet<Activity>({ tableName: 'activity', course_id: courseId });
  }

  async createActivity(activity: NewActivity): Promise<void> {
    await this.dbInsert('activity', [{ _id: generateId(), ...activity }]);
  }

  // ─── GROUPS ─────────────────────────────────────────────────────────────────
  async getGroupsByActivity(activityId: string): Promise<Group[]> {
    const actData = await this.dbGet<Activity>({ tableName: 'activity', _id: activityId });
    if (!actData.length) return [];
    const groups = await this.dbGet<{ _id: string; name: string; category_id: string }>(
      { tableName: 'groups', category_id: actData[0].category_id },
    );
    const userCache: Record<string, { userId: string; name: string }> = {};
    const result: Group[] = [];
    for (const group of groups) {
      const membersData = await this.dbGet<{ estudiante_id: string }>(
        { tableName: 'group_members', group_id: group._id },
      );
      const members = [];
      for (const m of membersData) {
        const uid = m.estudiante_id;
        if (!userCache[uid]) {
          try {
            const userData = await this.dbGet<{ userId: string; name: string }>(
              { tableName: 'Users', userId: uid },
            );
            if (userData.length) userCache[uid] = userData[0];
          } catch {}
        }
        if (userCache[uid]) members.push(userCache[uid]);
      }
      result.push({ ...group, members });
    }
    return result;
  }

  async getMyGroupInActivity(activityId: string, userId: string): Promise<Group | null> {
    const actData = await this.dbGet<Activity>({ tableName: 'activity', _id: activityId });
    if (!actData.length) return null;
    const categoryId = actData[0].category_id;
    const memberships = await this.dbGet<{ group_id: string }>(
      { tableName: 'group_members', estudiante_id: userId },
    );
    for (const m of memberships) {
      const groupData = await this.dbGet<{ _id: string; name: string; category_id: string }>(
        { tableName: 'groups', _id: m.group_id },
      );
      if (!groupData.length || groupData[0].category_id !== categoryId) continue;
      const membersData = await this.dbGet<{ estudiante_id: string }>(
        { tableName: 'group_members', group_id: m.group_id },
      );
      const members = [];
      for (const member of membersData) {
        if (member.estudiante_id === userId) continue;
        try {
          const ud = await this.dbGet<{ userId: string; name: string }>(
            { tableName: 'Users', userId: member.estudiante_id },
          );
          if (ud.length) members.push(ud[0]);
        } catch {}
      }
      return { ...groupData[0], members };
    }
    return null;
  }

  async getAllMyGroupsInCourse(courseId: string, userId: string): Promise<MyGroupSummary[]> {
    const memberships = await this.dbGet<{ group_id: string }>(
      { tableName: 'group_members', estudiante_id: userId },
    );
    const result: MyGroupSummary[] = [];
    for (const m of memberships) {
      try {
        const groupData = await this.dbGet<{ _id: string; name: string; category_id: string }>(
          { tableName: 'groups', _id: m.group_id },
        );
        if (!groupData.length) continue;
        const categoryData = await this.dbGet<{ _id: string; name: string; course_id: string }>(
          { tableName: 'category', _id: groupData[0].category_id },
        );
        if (!categoryData.length || categoryData[0].course_id !== courseId) continue;
        const members = await this.dbGet<unknown>({ tableName: 'group_members', group_id: m.group_id });
        result.push({
          categoryName: categoryData[0].name,
          groupName: groupData[0].name,
          membersCount: members.length,
        });
      } catch {}
    }
    return result;
  }

  // ─── EVALUATIONS ────────────────────────────────────────────────────────────
  async hasEvaluated(activityId: string, evaluatorId: string): Promise<boolean> {
    const data = await this.dbGet<unknown>({
      tableName: 'evaluation',
      activity_id: activityId,
      evaluator_id: evaluatorId,
    });
    return data.length > 0;
  }

  async submitEvaluation(
    activityId: string,
    groupId: string,
    evaluatorId: string,
    grades: EvaluationGrades,
  ): Promise<void> {
    const headers = { ...(await this.authHeader()), 'Content-Type': 'application/json' };
    for (const [evaluatedId, scores] of Object.entries(grades)) {
      const evalId = generateId();
      const evalRes = await fetch(`${DB_URL}/insert`, {
        method: 'POST', headers,
        body: JSON.stringify({
          tableName: 'evaluation',
          records: [{ _id: evalId, activity_id: activityId, group_id: groupId, evaluator_id: evaluatorId, evaluated_id: evaluatedId }],
        }),
      });
      if (evalRes.status !== 201) throw new Error('Error al crear evaluación');
      const scoreRecords = Object.entries(scores).map(([criterion, score]) => ({
        evaluation_id: evalId, criterion, score,
      }));
      const scoreRes = await fetch(`${DB_URL}/insert`, {
        method: 'POST', headers,
        body: JSON.stringify({ tableName: 'evaluation_scores', records: scoreRecords }),
      });
      if (scoreRes.status !== 201) throw new Error('Error al guardar calificaciones');
    }
  }

  async getMySubmittedGrades(activityId: string, evaluatorId: string): Promise<EvaluationGrades> {
    const evaluations = await this.dbGet<{ _id: string; evaluated_id: string }>(
      { tableName: 'evaluation', activity_id: activityId, evaluator_id: evaluatorId },
    );
    const result: EvaluationGrades = {};
    for (const ev of evaluations) {
      const scores = await this.dbGet<{ criterion: string; score: string }>(
        { tableName: 'evaluation_scores', evaluation_id: ev._id },
      );
      result[ev.evaluated_id] = {};
      for (const s of scores) result[ev.evaluated_id][s.criterion] = parseFloat(s.score);
    }
    return result;
  }

  async getEvaluationResults(activityId: string, userId: string): Promise<EvaluationResult[]> {
    const evaluations = await this.dbGet<{ _id: string; evaluator_id: string }>(
      { tableName: 'evaluation', activity_id: activityId, evaluated_id: userId },
    );
    const results: EvaluationResult[] = [];
    const userCache: Record<string, { name: string }> = {};
    for (const ev of evaluations) {
      const scores = await this.dbGet<{ criterion: string; score: string }>(
        { tableName: 'evaluation_scores', evaluation_id: ev._id },
      );
      const uid = ev.evaluator_id;
      if (!userCache[uid]) {
        try {
          const ud = await this.dbGet<{ name: string }>({ tableName: 'Users', userId: uid });
          if (ud.length) userCache[uid] = ud[0];
        } catch {}
      }
      const scoresByCriterion: Record<string, number[]> = {};
      for (const s of scores) {
        if (!scoresByCriterion[s.criterion]) scoresByCriterion[s.criterion] = [];
        scoresByCriterion[s.criterion].push(parseFloat(s.score));
      }
      results.push({ evaluatorId: uid, evaluatorName: userCache[uid]?.name ?? 'Desconocido', scoresByCriterion });
    }
    return results;
  }

  async getGlobalAverage(activityId: string): Promise<number> {
    const evaluations = await this.dbGet<{ _id: string }>(
      { tableName: 'evaluation', activity_id: activityId },
    );
    if (!evaluations.length) return 0;
    const allScores: number[] = [];
    for (const ev of evaluations) {
      const scores = await this.dbGet<{ score: string }>(
        { tableName: 'evaluation_scores', evaluation_id: ev._id },
      );
      for (const s of scores) allScores.push(parseFloat(s.score));
    }
    if (!allScores.length) return 0;
    return allScores.reduce((a, b) => a + b, 0) / allScores.length;
  }

  async getCourseGlobalAverages(courseId: string): Promise<StudentAverage[]> {
    const activities = await this.dbGet<{ _id: string }>(
      { tableName: 'activity', course_id: courseId },
    );
    if (!activities.length) return [];
    const allEvaluations: { _id: string; evaluated_id: string }[] = [];
    for (const act of activities) {
      const evs = await this.dbGet<{ _id: string; evaluated_id: string }>(
        { tableName: 'evaluation', activity_id: act._id },
      );
      allEvaluations.push(...evs);
    }
    if (!allEvaluations.length) return [];
    const studentScores: Record<string, number[]> = {};
    for (const ev of allEvaluations) {
      const scores = await this.dbGet<{ score: string }>(
        { tableName: 'evaluation_scores', evaluation_id: ev._id },
      );
      if (!studentScores[ev.evaluated_id]) studentScores[ev.evaluated_id] = [];
      for (const s of scores) studentScores[ev.evaluated_id].push(parseFloat(s.score));
    }
    const userCache: Record<string, { name: string }> = {};
    const result: StudentAverage[] = [];
    for (const [studentId, scores] of Object.entries(studentScores)) {
      if (!userCache[studentId]) {
        try {
          const ud = await this.dbGet<{ name: string }>({ tableName: 'Users', userId: studentId });
          if (ud.length) userCache[studentId] = ud[0];
        } catch {}
      }
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      result.push({ studentId, studentName: userCache[studentId]?.name ?? 'Desconocido', average: avg });
    }
    result.sort((a, b) => b.average - a.average);
    return result;
  }
}