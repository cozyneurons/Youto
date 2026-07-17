import { useEffect } from 'react';
import { useProgressStore } from '../store/progressStore';
import { useAuthStore } from '../store/authStore';

export function useProgress(courseId: number) {
  const user = useAuthStore(s => s.user);
  const { courseProgress, completedLessons, isLoading, fetchProgress, markComplete } =
    useProgressStore();

  useEffect(() => {
    if (user && courseId) fetchProgress(user.id, courseId);
  }, [user?.id, courseId]);

  return { courseProgress, completedLessons, isLoading, markComplete };
}
