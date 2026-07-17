import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import VideoPlayer from '../components/video/VideoPlayer';
import NotesPanel from '../components/video/NotesPanel';
import Loading from '../components/common/Loading';
import { courseService } from '../services/courseService';
import { useProgressStore } from '../store/progressStore';
import type { Lesson } from '../types';
import { formatDuration } from '../utils/formatters';

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { markComplete, completedLessons } = useProgressStore();
  const isCompleted = lesson ? !!completedLessons[lesson.id] : false;

  useEffect(() => {
    if (!lessonId) return;
    setIsLoading(true);
    courseService.getLesson(Number(lessonId))
      .then(setLesson)
      .finally(() => setIsLoading(false));
  }, [lessonId]);

  if (isLoading) return <><Navbar /><Loading text="Loading lesson…" /></>;
  if (!lesson) return <><Navbar /><div className="error-screen"><p>Lesson not found.</p></div></>;

  return (
    <div className="page lesson-page">
      <Navbar />
      <div className="lesson-header">
        <Link to={`/course/${courseId}`} className="back-link">← Back to course</Link>
        <h2 className="lesson-title">{lesson.title}</h2>
        <div className="lesson-meta">
          {lesson.duration && <span>{formatDuration(lesson.duration)}</span>}
          <button
            id="mark-complete-btn"
            className={`btn btn-sm ${isCompleted ? 'btn-success' : 'btn-primary'}`}
            onClick={() => !isCompleted && markComplete(lesson.id)}
            disabled={isCompleted}
          >
            {isCompleted ? '✓ Completed' : 'Mark complete'}
          </button>
        </div>
      </div>

      <div className="lesson-body">
        <div className="lesson-video">
          <VideoPlayer videoUrl={lesson.video_url} title={lesson.title} />
        </div>
        <div className="lesson-notes">
          <NotesPanel lessonId={lesson.id} summary={lesson.summary} />
        </div>
      </div>
    </div>
  );
}
