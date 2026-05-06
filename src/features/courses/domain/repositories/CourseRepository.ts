import { Activity, NewActivity } from '../entities/Activity';
import { Course, NewCourse } from '../entities/Course';
import { EvaluationGrades, EvaluationResult, StudentAverage } from '../entities/Evaluation';
import { Group, MyGroupSummary } from '../entities/Group';

export interface CourseRepository {
  // Courses
  getCoursesByUser(userId: string, rol: string): Promise<Course[]>;
  createCourse(course: NewCourse): Promise<void>;
  getActivitiesCountByCourse(courseId: string): Promise<number>;

  // Activities
  getActivitiesByCourse(courseId: string): Promise<Activity[]>;
  createActivity(activity: NewActivity): Promise<void>;

  // Groups
  getGroupsByActivity(activityId: string): Promise<Group[]>;
  getMyGroupInActivity(activityId: string, userId: string): Promise<Group | null>;
  getAllMyGroupsInCourse(courseId: string, userId: string): Promise<MyGroupSummary[]>;

  // Evaluations
  hasEvaluated(activityId: string, evaluatorId: string): Promise<boolean>;
  submitEvaluation(activityId: string, groupId: string, evaluatorId: string, grades: EvaluationGrades): Promise<void>;
  getMySubmittedGrades(activityId: string, evaluatorId: string): Promise<EvaluationGrades>;
  getEvaluationResults(activityId: string, userId: string): Promise<EvaluationResult[]>;
  getGlobalAverage(activityId: string): Promise<number>;
  getCourseGlobalAverages(courseId: string): Promise<StudentAverage[]>;
}