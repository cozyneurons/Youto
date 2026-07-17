import { useEffect } from 'react';
import { useCourseStore } from '../store/courseStore';

export function useCourse(id: number) {
  const { currentCourse, lessons, isLoading, error, fetchCourse } = useCourseStore();

  useEffect(() => {
    if (id) fetchCourse(id);
  }, [id]);

  return { course: currentCourse, lessons, isLoading, error };
}
