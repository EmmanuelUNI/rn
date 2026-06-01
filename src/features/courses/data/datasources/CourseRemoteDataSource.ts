import { Activity, NewActivity } from '../../domain/entities/Activity';
import { Category } from '../../domain/entities/Category';
import { Course, NewCourse } from '../../domain/entities/Course';
import { EvaluationGrades, EvaluationResult, StudentAverage, GroupActivityAverage } from '../../domain/entities/Evaluation';
import { Group, MyGroupSummary } from '../../domain/entities/Group';

export interface CourseRemoteDataSource {
  getCoursesByUser(userId: string, rol: string): Promise<Course[]>;
  createCourse(course: NewCourse): Promise<void>;
  getActivitiesByCourse(courseId: string): Promise<Activity[]>;
  createActivity(activity: NewActivity): Promise<void>;
  getCategoriesByCourse(courseId: string): Promise<Category[]>;
  getGroupsByActivity(activityId: string): Promise<Group[]>;
  getMyGroupInActivity(activityId: string, userId: string): Promise<Group | null>;
  getAllMyGroupsInCourse(courseId: string, userId: string): Promise<MyGroupSummary[]>;
  hasEvaluated(activityId: string, evaluatorId: string): Promise<boolean>;
  submitEvaluation(activityId: string, groupId: string, evaluatorId: string, grades: EvaluationGrades): Promise<void>;
  getMySubmittedGrades(activityId: string, evaluatorId: string): Promise<EvaluationGrades>;
  getEvaluationResults(activityId: string, userId: string): Promise<EvaluationResult[]>;
  getGlobalAverage(activityId: string): Promise<number>;
  getCourseGlobalAverages(courseId: string): Promise<StudentAverage[]>;
  getGroupsGlobalAverage(courseId: string): Promise<GroupActivityAverage[]>;
}