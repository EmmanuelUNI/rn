export type Course = {
  _id: string;
  name: string;
  nrc: string;
  profesor_id: string;
  activities?: number;
};

export type NewCourse = {
  name: string;
  nrc: string;
  profesor_id: string;
};