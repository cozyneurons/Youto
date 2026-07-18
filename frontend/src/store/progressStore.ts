import { create } from 'zustand';
import type { CourseProgress } from '../types';
import { progressService } from '../services/progressService';

interface ProgressState {
  // keyed by lesson_id
  completedLessons: Record<number, boolean>;
  courseProgress: CourseProgress | null;
  isLoading: boolean;

  fetchProgress: (userId: number, courseId: number) => Promise<void>;
  markComplete: (lessonId: number) => Promise<void>;
  setCompleted: (lessonId: number, value: boolean) => void;
  clearProgress: () => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  completedLessons: {},
  courseProgress: null,
  isLoading: false,

  fetchProgress: async (userId, courseId) => {
    set({ isLoading: true });
    try {
      const progress = await progressService.getCourseProgress(userId, courseId);
      const newCompleted: Record<number, boolean> = {};
      progress.completed_lesson_ids.forEach(id => {
        newCompleted[id] = true;
      });
      set({ 
        courseProgress: progress,
        completedLessons: newCompleted
      });
    } finally {
      set({ isLoading: false });
    }
  },

  markComplete: async (lessonId) => {
    await progressService.markComplete(lessonId);
    set(state => ({
      completedLessons: { ...state.completedLessons, [lessonId]: true },
      courseProgress: state.courseProgress
        ? {
            ...state.courseProgress,
            completed: state.courseProgress.completed + 1,
            percentage: Math.round(
              ((state.courseProgress.completed + 1) / state.courseProgress.total) * 100 * 10,
            ) / 10,
          }
        : null,
    }));
  },

  setCompleted: (lessonId, value) => {
    set(state => ({
      completedLessons: { ...state.completedLessons, [lessonId]: value },
    }));
  },

  clearProgress: () => {
    set({ completedLessons: {}, courseProgress: null });
  },
}));
