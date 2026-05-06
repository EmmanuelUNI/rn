import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';

import { useDI } from '@/src/core/di/DIProvider';
import { TOKENS } from '@/src/core/di/tokens';
import { LocalPreferencesAsyncStorage } from '@/src/core/LocalPreferencesAsyncStorage';
import { Activity } from '../../domain/entities/Activity';
import { Course, NewCourse } from '../../domain/entities/Course';
import { EvaluationGrades, EvaluationResult, StudentAverage } from '../../domain/entities/Evaluation';
import { Group, MyGroupSummary } from '../../domain/entities/Group';
import { CourseRepository } from '../../domain/repositories/CourseRepository';

export type CourseContextType = {

  courses: (Course & { activities: number })[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;


  refreshCourses: () => Promise<void>;
  createCourse: (name: string, nrc: string) => Promise<void>;


  getActivitiesByCourse: (courseId: string) => Promise<Activity[]>;


  getGroupsByActivity: (activityId: string) => Promise<Group[]>;
  getMyGroupInActivity: (activityId: string, userId: string) => Promise<Group | null>;
  getAllMyGroupsInCourse: (courseId: string, userId: string) => Promise<MyGroupSummary[]>;


  hasEvaluated: (activityId: string, evaluatorId: string) => Promise<boolean>;
  submitEvaluation: (activityId: string, groupId: string, evaluatorId: string, grades: EvaluationGrades) => Promise<void>;
  getMySubmittedGrades: (activityId: string, evaluatorId: string) => Promise<EvaluationGrades>;
  getEvaluationResults: (activityId: string, userId: string) => Promise<EvaluationResult[]>;
  getCourseGlobalAverages: (courseId: string) => Promise<StudentAverage[]>;
};

export const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
  const di = useDI();
  const repo = useMemo(() => di.resolve<CourseRepository>(TOKENS.CourseRepo), [di]);
  const prefs = LocalPreferencesAsyncStorage.getInstance();

  const [courses, setCourses] = useState<(Course & { activities: number })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  async function refreshCourses() {
    try {
      setIsLoading(true);
      clearError();
      const userId = await prefs.retrieveData<string>('userId');
      const rol    = await prefs.retrieveData<string>('rol');
      if (!userId || !rol) return;
      const data = await repo.getCoursesByUser(userId, rol);
      const enriched = await Promise.all(
        data.map(async course => ({
          ...course,
          activities: await repo.getActivitiesCountByCourse(course._id),
        })),
      );
      setCourses(enriched);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar cursos');
    } finally {
      setIsLoading(false);
    }
  }

  async function createCourse(name: string, nrc: string) {
    const userId = await prefs.retrieveData<string>('userId');
    if (!userId) throw new Error('Usuario no encontrado');
    await repo.createCourse({ name, nrc, profesor_id: userId });
    await refreshCourses();
  }

  async function getActivitiesByCourse(courseId: string): Promise<Activity[]> {
    return repo.getActivitiesByCourse(courseId);
  }

  async function getGroupsByActivity(activityId: string): Promise<Group[]> {
    return repo.getGroupsByActivity(activityId);
  }

  async function getMyGroupInActivity(activityId: string, userId: string): Promise<Group | null> {
    return repo.getMyGroupInActivity(activityId, userId);
  }

  async function getAllMyGroupsInCourse(courseId: string, userId: string): Promise<MyGroupSummary[]> {
    return repo.getAllMyGroupsInCourse(courseId, userId);
  }

  async function hasEvaluated(activityId: string, evaluatorId: string): Promise<boolean> {
    return repo.hasEvaluated(activityId, evaluatorId);
  }

  async function submitEvaluation(activityId: string, groupId: string, evaluatorId: string, grades: EvaluationGrades): Promise<void> {
    return repo.submitEvaluation(activityId, groupId, evaluatorId, grades);
  }

  async function getMySubmittedGrades(activityId: string, evaluatorId: string): Promise<EvaluationGrades> {
    return repo.getMySubmittedGrades(activityId, evaluatorId);
  }

  async function getEvaluationResults(activityId: string, userId: string): Promise<EvaluationResult[]> {
    return repo.getEvaluationResults(activityId, userId);
  }

  async function getCourseGlobalAverages(courseId: string): Promise<StudentAverage[]> {
    return repo.getCourseGlobalAverages(courseId);
  }

  return (
    <CourseContext.Provider value={{
      courses, isLoading, error, clearError,
      refreshCourses, createCourse,
      getActivitiesByCourse,
      getGroupsByActivity, getMyGroupInActivity, getAllMyGroupsInCourse,
      hasEvaluated, submitEvaluation, getMySubmittedGrades,
      getEvaluationResults, getCourseGlobalAverages,
    }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourses must be used inside CourseProvider');
  return ctx;
}