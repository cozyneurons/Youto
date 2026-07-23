import api from './api';
import type { Course, Lesson } from '../types';

export const courseService = {
  getCourses: async (): Promise<Course[]> => {
    const { data } = await api.get<Course[]>('/api/courses/');
    return Array.isArray(data) ? data : [];
  },

  getCourse: async (id: number): Promise<Course> => {
    const { data } = await api.get<Course>(`/api/courses/${id}`);
    return data;
  },

  getLessons: async (courseId: number): Promise<Lesson[]> => {
    const { data } = await api.get<Lesson[]>(`/api/lessons/course/${courseId}`);
    return Array.isArray(data) ? data : [];
  },

  getLesson: async (lessonId: number): Promise<Lesson> => {
    const { data } = await api.get<Lesson>(`/api/lessons/${lessonId}`);
    return data;
  },

  deleteCourse: async (id: number): Promise<void> => {
    await api.delete(`/api/courses/${id}`);
  },

  updateCourse: async (id: number, payload: Partial<Course>): Promise<Course> => {
    const { data } = await api.put<Course>(`/api/courses/${id}`, payload);
    return data;
  },

  generateSummary: async (lessonId: number): Promise<{ summary: string }> => {
    const { data } = await api.post<{ summary: string }>(`/api/lessons/${lessonId}/generate-summary`);
    return data;
  },
};
