import { Activity, NewActivity } from '../../domain/entities/Activity';
import { Course, NewCourse } from '../../domain/entities/Course';
import { EvaluationGrades, EvaluationResult, StudentAverage } from '../../domain/entities/Evaluation';
import { Group, MyGroupSummary } from '../../domain/entities/Group';
import { CourseRepository } from '../../domain/repositories/CourseRepository';
import { CourseRemoteDataSource } from '../datasources/CourseRemoteDataSource';

export class CourseRepositoryImpl implements CourseRepository {
  constructor(private readonly ds: CourseRemoteDataSource) {}

  getCoursesByUser(userId: string, rol: string): Promise<Course[]> {
    return this.ds.getCoursesByUser(userId, rol);
  }
  createCourse(course: NewCourse): Promise<void> {
    return this.ds.createCourse(course);
  }
  async getActivitiesCountByCourse(courseId: string): Promise<number> {
    try {
      const activities = await this.ds.getActivitiesByCourse(courseId);
      const now = new Date();
      return activities.filter(a => {
        const start = new Date(a.start_date);
        const end   = new Date(a.end_date);
        return now > start && now < end;
      }).length;
    } catch { return 0; }
  }
  getActivitiesByCourse(courseId: string): Promise<Activity[]> {
    return this.ds.getActivitiesByCourse(courseId);
  }
  createActivity(activity: NewActivity): Promise<void> {
    return this.ds.createActivity(activity);
  }
  getGroupsByActivity(activityId: string): Promise<Group[]> {
    return this.ds.getGroupsByActivity(activityId);
  }
  getMyGroupInActivity(activityId: string, userId: string): Promise<Group | null> {
    return this.ds.getMyGroupInActivity(activityId, userId);
  }
  getAllMyGroupsInCourse(courseId: string, userId: string): Promise<MyGroupSummary[]> {
    return this.ds.getAllMyGroupsInCourse(courseId, userId);
  }
  hasEvaluated(activityId: string, evaluatorId: string): Promise<boolean> {
    return this.ds.hasEvaluated(activityId, evaluatorId);
  }
  submitEvaluation(activityId: string, groupId: string, evaluatorId: string, grades: EvaluationGrades): Promise<void> {
    return this.ds.submitEvaluation(activityId, groupId, evaluatorId, grades);
  }
  getMySubmittedGrades(activityId: string, evaluatorId: string): Promise<EvaluationGrades> {
    return this.ds.getMySubmittedGrades(activityId, evaluatorId);
  }
  getEvaluationResults(activityId: string, userId: string): Promise<EvaluationResult[]> {
    return this.ds.getEvaluationResults(activityId, userId);
  }
  getGlobalAverage(activityId: string): Promise<number> {
    return this.ds.getGlobalAverage(activityId);
  }
  getCourseGlobalAverages(courseId: string): Promise<StudentAverage[]> {
    return this.ds.getCourseGlobalAverages(courseId);
  }
}