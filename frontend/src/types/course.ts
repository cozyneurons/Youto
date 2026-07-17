export interface Course {
  id: number;
  title: string;
  description: string | null;
  youtube_url: string | null;
  thumbnail_url: string | null;
  total_duration: number | null;
  created_by: number | null;
  created_at: string | null;
  lessons?: Lesson[];
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  order_index: number;
  video_url: string | null;
  duration: number | null;
  summary: string | null;
  phase: string | null;
  created_at: string | null;
}
