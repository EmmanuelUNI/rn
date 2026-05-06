export type EvaluationGrades = Record<string, Record<string, number>>;

export type EvaluationResult = {
  evaluatorId: string;
  evaluatorName: string;
  scoresByCriterion: Record<string, number[]>;
};

export type StudentAverage = {
  studentId: string;
  studentName: string;
  average: number;
};