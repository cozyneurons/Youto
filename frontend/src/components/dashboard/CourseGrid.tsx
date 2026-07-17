import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';
import type { Course } from '../../types';
import { formatDuration } from '../../utils/formatters';
import { useCourseStore } from '../../store/courseStore';

interface Props {
  courses: Course[];
}

function CourseCard({ course }: { course: Course }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { renameCourse, deleteCourse } = useCourseStore();

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(!menuOpen);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    const newName = window.prompt("Enter new playlist name:", course.title);
    if (newName && newName.trim() !== "") {
      renameCourse(course.id, newName.trim());
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    if (window.confirm(`Are you sure you want to delete "${course.title}"?`)) {
      deleteCourse(course.id);
    }
  };

  return (
    <Link to={`/course/${course.id}`} className="course-card" id={`course-card-${course.id}`} style={{ position: 'relative' }}>
      <button 
        className="course-card-menu-btn" 
        onClick={handleMenuClick}
        aria-label="Options"
      >
        ⋮
      </button>
      
      {menuOpen && (
        <div className="course-card-dropdown" onClick={(e) => e.preventDefault()}>
          <button onClick={handleRename}>Rename</button>
          <button onClick={handleDelete} className="text-danger">Delete</button>
        </div>
      )}

      <div className="course-card-thumb">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} loading="lazy" />
        ) : (
          <div className="course-card-thumb-placeholder"><PlayCircle className="w-10 h-10 text-[var(--accent)] opacity-50" /></div>
        )}
      </div>
      <div className="course-card-body">
        <h3 className="course-card-title">{course.title}</h3>
        {course.total_duration && (
          <span className="course-card-meta">{formatDuration(course.total_duration)}</span>
        )}
      </div>
    </Link>
  );
}

export default function CourseGrid({ courses }: Props) {
  if (courses.length === 0) {
    return (
      <div className="empty-state">
        <p>No courses yet.</p>
        <Link to="/upload" className="btn btn-primary btn-sm">Add your first course →</Link>
      </div>
    );
  }

  return (
    <div className="course-grid">
      {courses.map(c => <CourseCard key={c.id} course={c} />)}
    </div>
  );
}
