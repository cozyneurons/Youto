export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  UPLOAD: '/upload',
  COURSE: (id: number | string) => `/course/${id}`,
  LESSON: (courseId: number | string, lessonId: number | string) =>
    `/course/${courseId}/lesson/${lessonId}`,
  PROFILE: '/profile',
} as const;

export const NOTES_AUTOSAVE_DELAY_MS = 1200;
export const MAX_PLAYLIST_VIDEOS = 300;
