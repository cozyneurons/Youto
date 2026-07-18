export interface Progress {
  id: number;
  user_id: number;
  lesson_id: number;
  completed: boolean;
  completion_date: string | null;
  time_spent: number;
  watched_percentage: number;
  notes: string | null;
}

export interface CourseProgress {
  completed: number;
  total: number;
  percentage: number;
  completed_lesson_ids: number[];
}
