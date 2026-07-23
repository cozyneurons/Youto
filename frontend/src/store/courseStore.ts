import { create } from 'zustand';
import type { Course, Lesson } from '../types';
import { courseService } from '../services/courseService';

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  lessons: Lesson[];
  isLoading: boolean;
  error: string | null;

  fetchCourses: () => Promise<void>;
  fetchCourse: (id: number) => Promise<void>;
  fetchLessons: (courseId: number) => Promise<void>;
  setCurrentCourse: (course: Course) => void;
  clearCurrent: () => void;
  renameCourse: (id: number, newTitle: string) => Promise<void>;
  deleteCourse: (id: number) => Promise<void>;
  updateCourseDeadline: (id: number, deadline: string | null) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  currentCourse: null,
  lessons: [],
  isLoading: false,
  error: null,

  fetchCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const courses = await courseService.getCourses();
      set({ courses });
    } catch (e: any) {
      set({ error: e.response?.data?.detail || 'Failed to fetch courses' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCourse: async (id) => {
    const isAlreadyLoaded = get().currentCourse?.id === id;
    set({ isLoading: !isAlreadyLoaded, error: null });
    try {
      const course = await courseService.getCourse(id);
      set({ currentCourse: course, lessons: course.lessons ?? [] });
    } catch (e: any) {
      set({ error: e.response?.data?.detail || 'Failed to fetch course' });
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentCourse: (course) => set({ currentCourse: course, lessons: course.lessons ?? [], isLoading: false, error: null }),

  fetchLessons: async (courseId) => {
    const lessons = await courseService.getLessons(courseId);
    set({ lessons });
  },

  clearCurrent: () => set({ currentCourse: null, lessons: [] }),

  renameCourse: async (id, newTitle) => {
    try {
      const updated = await courseService.updateCourse(id, { title: newTitle });
      set((state) => ({
        courses: state.courses.map((c) => (c.id === id ? { ...c, title: updated.title } : c)),
        currentCourse: state.currentCourse?.id === id ? { ...state.currentCourse, title: updated.title } : state.currentCourse,
      }));
    } catch (e: any) {
      console.error("Rename failed", e);
    }
  },

  deleteCourse: async (id) => {
    try {
      await courseService.deleteCourse(id);
      set((state) => ({
        courses: state.courses.filter((c) => c.id !== id),
        currentCourse: state.currentCourse?.id === id ? null : state.currentCourse,
      }));
    } catch (e: any) {
      console.error("Delete failed", e);
    }
  },

  updateCourseDeadline: async (id, deadline) => {
    try {
      const updated = await courseService.updateCourse(id, { deadline });
      set((state) => ({
        courses: state.courses.map((c) => (c.id === id ? { ...c, deadline: updated.deadline } : c)),
        currentCourse: state.currentCourse?.id === id ? { ...state.currentCourse, deadline: updated.deadline } : state.currentCourse,
      }));
    } catch (e: any) {
      console.error("Update deadline failed", e);
    }
  },
}));
