// src/services/courseService.js
import { DB_URL } from '../config/api';
import StorageService from './storageService';

async function authHeader() {
  const token = await StorageService.get('token');
  return { Authorization: `Bearer ${token}` };
}

async function dbGet(params) {
  const headers = await authHeader();
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${DB_URL}/read?${query}`, { headers });
  if (response.status !== 200) throw new Error('Error al consultar datos');
  return response.json();
}

async function dbInsert(tableName, records) {
  const headers = { ...(await authHeader()), 'Content-Type': 'application/json' };
  const response = await fetch(`${DB_URL}/insert`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ tableName, records }),
  });
  if (response.status !== 201) throw new Error('Error al insertar datos');
  return response.json();
}

function generateId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const CourseService = {
  
  async getCoursesByUser() {
    const userId = await StorageService.get('userId');
    const rol = await StorageService.get('rol');

    if (rol === 'profesor') {
      return dbGet({ tableName: 'course', profesor_id: userId });
    }

    const memberships = await dbGet({ tableName: 'course_members', estudiante_id: userId });
    if (!memberships.length) return [];

    const courses = [];
    for (const m of memberships) {
      try {
        const result = await dbGet({ tableName: 'course', _id: m.course_id });
        if (result.length) courses.push(result[0]);
      } catch {}
    }
    return courses;
  },

  async createCourse(name, nrc, profesorId) {
    return dbInsert('course', [{ name, nrc, profesor_id: profesorId }]);
  },

  // ─── ACTIVITIES ─────────────────────────────────────────────────────────────
  async getActivitiesByCourse(courseId) {
    return dbGet({ tableName: 'activity', course_id: courseId });
  },

  async getActivitiesCountByCourse(courseId) {
    try {
      const activities = await dbGet({ tableName: 'activity', course_id: courseId });
      const now = new Date();
      return activities.filter(a => {
        const start = new Date(a.start_date);
        const end = new Date(a.end_date);
        return now > start && now < end;
      }).length;
    } catch {
      return 0;
    }
  },

  async createActivity(courseId, name, categoryId, startDate, endDate, isPublic) {
    const id = generateId();
    return dbInsert('activity', [{
      _id: id,
      name,
      course_id: courseId,
      category_id: categoryId,
      start_date: startDate,
      end_date: endDate,
      is_public: isPublic,
    }]);
  },

  // ─── CATEGORIES ─────────────────────────────────────────────────────────────
  async getCategoriesByCourse(courseId) {
    return dbGet({ tableName: 'category', course_id: courseId });
  },

  // ─── GROUPS (TEACHER VIEW) ──────────────────────────────────────────────────
  async getGroupsByActivity(activityId) {
    const actData = await dbGet({ tableName: 'activity', _id: activityId });
    if (!actData.length) return [];
    const categoryId = actData[0].category_id;

    const groups = await dbGet({ tableName: 'groups', category_id: categoryId });

    const userCache = {};
    const result = [];

    for (const group of groups) {
      const membersData = await dbGet({ tableName: 'group_members', group_id: group._id });
      const members = [];

      for (const m of membersData) {
        const uid = m.estudiante_id;
        if (!userCache[uid]) {
          try {
            const userData = await dbGet({ tableName: 'Users', userId: uid });
            if (userData.length) userCache[uid] = userData[0];
          } catch {}
        }
        if (userCache[uid]) members.push(userCache[uid]);
      }

      result.push({ ...group, members });
    }

    return result;
  },

  
  async getMyGroupInActivity(activityId, userId) {
    const actData = await dbGet({ tableName: 'activity', _id: activityId });
    if (!actData.length) return null;
    const categoryId = actData[0].category_id;

    const memberships = await dbGet({ tableName: 'group_members', estudiante_id: userId });

    for (const m of memberships) {
      const groupData = await dbGet({ tableName: 'groups', _id: m.group_id });
      if (!groupData.length) continue;
      if (groupData[0].category_id !== categoryId) continue;

      const membersData = await dbGet({ tableName: 'group_members', group_id: m.group_id });
      const members = [];

      for (const member of membersData) {
        if (member.estudiante_id === userId) continue;
        try {
          const userData = await dbGet({ tableName: 'Users', userId: member.estudiante_id });
          if (userData.length) members.push(userData[0]);
        } catch {}
      }

      return { ...groupData[0], members };
    }

    return null;
  },

  async getAllMyGroupsInCourse(courseId, userId) {
    const memberships = await dbGet({ tableName: 'group_members', estudiante_id: userId });
    const result = [];

    for (const m of memberships) {
      try {
        const groupData = await dbGet({ tableName: 'groups', _id: m.group_id });
        if (!groupData.length) continue;
        const categoryData = await dbGet({ tableName: 'category', _id: groupData[0].category_id });
        if (!categoryData.length) continue;
        if (categoryData[0].course_id !== courseId) continue;
        const members = await dbGet({ tableName: 'group_members', group_id: m.group_id });
        result.push({
          categoryName: categoryData[0].name,
          groupName: groupData[0].name,
          membersCount: members.length,
        });
      } catch {}
    }

    return result;
  },

  // ─── EVALUATIONS ────────────────────────────────────────────────────────────
  async hasEvaluated(activityId, evaluatorId) {
    const data = await dbGet({
      tableName: 'evaluation',
      activity_id: activityId,
      evaluator_id: evaluatorId,
    });
    return data.length > 0;
  },

  async submitEvaluation(activityId, groupId, evaluatorId, grades) {
    const headers = { ...(await authHeader()), 'Content-Type': 'application/json' };

    for (const [evaluatedId, scores] of Object.entries(grades)) {
      const evalId = generateId();

      const evalRes = await fetch(`${DB_URL}/insert`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tableName: 'evaluation',
          records: [{
            _id: evalId,
            activity_id: activityId,
            group_id: groupId,
            evaluator_id: evaluatorId,
            evaluated_id: evaluatedId,
          }],
        }),
      });
      if (evalRes.status !== 201) throw new Error('Error al crear evaluación');

      const scoreRecords = Object.entries(scores).map(([criterion, score]) => ({
        evaluation_id: evalId,
        criterion,
        score,
      }));

      const scoreRes = await fetch(`${DB_URL}/insert`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ tableName: 'evaluation_scores', records: scoreRecords }),
      });
      if (scoreRes.status !== 201) throw new Error('Error al guardar calificaciones');
    }
  },

  async getMySubmittedGrades(activityId, evaluatorId) {
    const evaluations = await dbGet({
      tableName: 'evaluation',
      activity_id: activityId,
      evaluator_id: evaluatorId,
    });

    const result = {};
    for (const ev of evaluations) {
      const scores = await dbGet({ tableName: 'evaluation_scores', evaluation_id: ev._id });
      result[ev.evaluated_id] = {};
      for (const s of scores) {
        result[ev.evaluated_id][s.criterion] = parseFloat(s.score);
      }
    }
    return result;
  },

  
  async getEvaluationResults(activityId, userId) {
    const evaluations = await dbGet({
      tableName: 'evaluation',
      activity_id: activityId,
      evaluated_id: userId,
    });

    const results = [];
    const userCache = {};

    for (const ev of evaluations) {
      const scores = await dbGet({ tableName: 'evaluation_scores', evaluation_id: ev._id });

      const uid = ev.evaluator_id;
      if (!userCache[uid]) {
        try {
          const userData = await dbGet({ tableName: 'Users', userId: uid });
          if (userData.length) userCache[uid] = userData[0];
        } catch {}
      }

      const scoresByCriterion = {};
      for (const s of scores) {
        if (!scoresByCriterion[s.criterion]) scoresByCriterion[s.criterion] = [];
        scoresByCriterion[s.criterion].push(parseFloat(s.score));
      }

      results.push({
        evaluatorId: uid,
        evaluatorName: userCache[uid]?.name || 'Desconocido',
        scoresByCriterion,
      });
    }

    return results;
  },

  
  async getGlobalAverage(activityId) {
    const evaluations = await dbGet({ tableName: 'evaluation', activity_id: activityId });
    if (!evaluations.length) return 0;

    let allScores = [];
    for (const ev of evaluations) {
      const scores = await dbGet({ tableName: 'evaluation_scores', evaluation_id: ev._id });
      for (const s of scores) allScores.push(parseFloat(s.score));
    }

    if (!allScores.length) return 0;
    return allScores.reduce((a, b) => a + b, 0) / allScores.length;
  },

  
  async getCourseGlobalAverages(courseId) {
    const activities = await dbGet({ tableName: 'activity', course_id: courseId });
    if (!activities.length) return [];

    const allEvaluations = [];
    for (const act of activities) {
      const evs = await dbGet({ tableName: 'evaluation', activity_id: act._id });
      allEvaluations.push(...evs);
    }
    if (!allEvaluations.length) return [];

    const studentScores = {};
    for (const ev of allEvaluations) {
      const scores = await dbGet({ tableName: 'evaluation_scores', evaluation_id: ev._id });
      if (!studentScores[ev.evaluated_id]) studentScores[ev.evaluated_id] = [];
      for (const s of scores) studentScores[ev.evaluated_id].push(parseFloat(s.score));
    }

    const userCache = {};
    const result = [];

    for (const [studentId, scores] of Object.entries(studentScores)) {
      if (!userCache[studentId]) {
        try {
          const userData = await dbGet({ tableName: 'Users', userId: studentId });
          if (userData.length) userCache[studentId] = userData[0];
        } catch {}
      }
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      result.push({
        studentId,
        studentName: userCache[studentId]?.name || 'Desconocido',
        average: avg,
      });
    }

    result.sort((a, b) => b.average - a.average);
    return result;
  },

  async getGroupsGlobalAverage(courseId) {
    const activities = await dbGet({ tableName: 'activity', course_id: courseId });
    const result = [];

    for (const act of activities) {
      const groups = await dbGet({ tableName: 'groups', category_id: act.category_id });
      const evaluations = await dbGet({ tableName: 'evaluation', activity_id: act._id });

      const evalsByGroup = {};
      for (const ev of evaluations) {
        if (!evalsByGroup[ev.group_id]) evalsByGroup[ev.group_id] = [];
        evalsByGroup[ev.group_id].push(ev);
      }

      const groupAverages = [];
      for (const group of groups) {
        const groupEvs = evalsByGroup[group._id] || [];
        let allScores = [];
        for (const ev of groupEvs) {
          const scores = await dbGet({ tableName: 'evaluation_scores', evaluation_id: ev._id });
          for (const s of scores) allScores.push(parseFloat(s.score));
        }
        const avg = allScores.length
          ? allScores.reduce((a, b) => a + b, 0) / allScores.length
          : null;
        groupAverages.push({ groupId: group._id, groupName: group.name, average: avg });
      }

      result.push({ activityName: act.name, groups: groupAverages });
    }

    return result;
  },
};

export default CourseService;