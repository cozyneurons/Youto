import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import VideoPlayer from '../components/video/VideoPlayer';
import NotesPanel from '../components/video/NotesPanel';
import Loading from '../components/common/Loading';
import { courseService } from '../services/courseService';
import { useProgressStore } from '../store/progressStore';
import type { Lesson, Course } from '../types';
import { formatDuration } from '../utils/formatters';

function LinkifiedText({ text }: { text: string }) {
  if (!text) return null;
  // Match standard URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return (
    <>
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          // Remove trailing punctuation like periods, commas, or parentheses
          const match = part.match(/^(.*?)([\.,!\)?\]]*)$/);
          const cleanUrl = match ? match[1] : part;
          const trailing = match ? match[2] : '';

          return (
            <span key={i}>
              <a href={cleanUrl} target="_blank" rel="noopener noreferrer" className="description-link">
                {cleanUrl}
              </a>
              {trailing}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'playlist' | 'notes'>('playlist');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { markComplete, completedLessons } = useProgressStore();
  const isCompleted = lesson ? !!completedLessons[lesson.id] : false;

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError(null);
    setLesson(null);
    setCourse(null);

    if (!lessonId || !courseId) {
      setIsLoading(false);
      return;
    }

    const parsedLessonId = Number(lessonId);
    const parsedCourseId = Number(courseId);
    if (
      !Number.isInteger(parsedLessonId) || parsedLessonId <= 0 ||
      !Number.isInteger(parsedCourseId) || parsedCourseId <= 0
    ) {
      setError('Invalid course or lesson.');
      setIsLoading(false);
      return;
    }

    Promise.all([
      courseService.getLesson(parsedLessonId),
      courseService.getCourse(parsedCourseId)
    ])
      .then(([lessonData, courseData]) => {
        if (isActive) {
          const belongsToCourse = courseData.lessons?.some(
            courseLesson => courseLesson.id === lessonData.id
          );
          if (!belongsToCourse) {
            setError('This lesson does not belong to the requested course.');
            return;
          }
          setLesson(lessonData);
          setCourse(courseData);
        }
      })
      .catch(() => {
        if (isActive) {
          setError("Failed to load lesson data. Please try again.");
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => { isActive = false; };
  }, [lessonId, courseId]);

  if (isLoading) return <><Navbar /><Loading text="Loading lesson…" /></>;
  if (error) return <><Navbar /><div className="error-screen"><p>{error}</p></div></>;
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
        <div className="lesson-main-col">
          <div className="lesson-video-wrapper">
            <VideoPlayer videoUrl={lesson.video_url} title={lesson.title} />
          </div>
          <div className="lesson-description">
            <h3 className="description-title">Description</h3>
            <p className="description-content">
              {lesson.description ? <LinkifiedText text={lesson.description} /> : <i>No description available for this video.</i>}
            </p>
          </div>
        </div>
        <div className="lesson-sidebar">
          <div className="sidebar-tabs">
            <button
              className={`sidebar-tab ${activeTab === 'playlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('playlist')}
            >
              Playlist
            </button>
            <button
              className={`sidebar-tab ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              Notes
            </button>
          </div>

          <div className="sidebar-content">
            {activeTab === 'playlist' && course && course.lessons && course.lessons.length > 0 && (
              <div className="lesson-playlist-container">
                <div className="playlist-list">
                  {course.lessons.map((l, index) => {
                    const isCurrent = l.id === lesson.id;
                    const isDone = !!completedLessons[l.id];
                    return (
                      <Link
                        key={l.id}
                        to={`/course/${course.id}/lesson/${l.id}`}
                        className={`playlist-item ${isCurrent ? 'active' : ''}`}
                      >
                        <div className="playlist-item-index">
                          {isCurrent ? (
                            <span style={{ color: 'var(--primary)' }}>▶</span>
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="playlist-item-details">
                          <h4 className="playlist-item-title">{l.title}</h4>
                          <div className="playlist-item-meta">
                            {l.duration && <span>{formatDuration(l.duration)}</span>}
                            {isDone && <span style={{ color: 'var(--success)' }}>✓</span>}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="lesson-notes-container">
                <NotesPanel lessonId={lesson.id} summary={lesson.summary} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
