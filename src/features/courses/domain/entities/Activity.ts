export type Activity = {
  _id: string;
  name: string;
  course_id: string;
  category_id: string;
  start_date: string;
  end_date: string;
  is_public: boolean;
};

export type NewActivity = Omit<Activity, '_id'>;