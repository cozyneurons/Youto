import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import PathGraph from '../components/course/PathGraph';
import ProgressBar from '../components/course/ProgressBar';
import Loading from '../components/common/Loading';
import { useCourse } from '../hooks/useCourse';
import { useProgress } from '../hooks/useProgress';

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const { course, lessons, isLoading } = useCourse(courseId);
  const { courseProgress, completedLessons } = useProgress(courseId);

  if (isLoading) return <><Navbar /><Loading text="Loading course…" /></>;
  if (!course) return <><Navbar /><div className="error-screen"><p>Course not found.</p></div></>;

  return (
    <div className="page">
      <Navbar />
      <main className="container course-main">
        <header className="course-header">
          <Link to="/dashboard" className="back-link" style={{ display: 'block', marginBottom: '12px' }}>← Back to Dashboard</Link>
          <h1 className="page-title">{course.title}</h1>
          {courseProgress && (
            <ProgressBar
              completed={courseProgress.completed}
              total={courseProgress.total}
            />
          )}
        </header>

        {lessons.length > 0 ? (
          <PathGraph
            lessons={lessons}
            courseId={courseId}
            completedLessons={completedLessons}
          />
        ) : (
          <p className="empty-state">No lessons found for this course.</p>
        )}
      </main>
    </div>
  );
}
