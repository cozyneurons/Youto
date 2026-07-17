import { useEffect } from 'react';
import { useCourseStore } from '../store/courseStore';

export function useLessons(courseId: number) {
  const { lessons, isLoading, fetchLessons } = useCourseStore();

  useEffect(() => {
    if (courseId) fetchLessons(courseId);
  }, [courseId]);

  return { lessons, isLoading };
}
