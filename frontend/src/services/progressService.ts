import api from './api';
import type { CourseProgress } from '../types';

export const progressService = {
  getCourseProgress: async (userId: number, courseId: number): Promise<CourseProgress> => {
    const { data } = await api.get<CourseProgress>(
      `/api/progress/user/${userId}/course/${courseId}`,
    );
    return data;
  },

  markComplete: async (lessonId: number): Promise<{ completed: boolean }> => {
    const { data } = await api.post<{ completed: boolean }>(
      `/api/progress/lesson/${lessonId}/complete`,
    );
    return data;
  },

  updateWatchTime: async (
    lessonId: number,
    timeSpent: number,
    watchedPercentage: number,
  ): Promise<void> => {
    await api.post('/api/progress/watch-time', {
      lesson_id: lessonId,
      time_spent: timeSpent,
      watched_percentage: watchedPercentage,
    });
  },

  getUserStats: async (): Promise<{ total_courses_completed: number; achievements: string[] }> => {
    const { data } = await api.get('/api/progress/user/stats');
    return data;
  },
};
