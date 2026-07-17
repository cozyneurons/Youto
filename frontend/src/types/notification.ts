export interface Notification {
  id: number;
  user_id: number;
  course_id?: number;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}
