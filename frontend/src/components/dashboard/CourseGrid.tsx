import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Course } from '../../types';
import { formatDuration } from '../../utils/formatters';
import { useCourseStore } from '../../store/courseStore';

interface Props {
  courses: Course[];
}

function CourseCard({ course }: { course: Course }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const { renameCourse, deleteCourse, updateCourseDeadline } = useCourseStore();

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

  const handleCalendarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (dateInputRef.current) {
      if ('showPicker' in HTMLInputElement.prototype) {
        try {
          dateInputRef.current.showPicker();
        } catch {
          dateInputRef.current.focus();
        }
      } else {
        dateInputRef.current.click();
      }
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDeadline = e.target.value;
    updateCourseDeadline(course.id, newDeadline ? new Date(newDeadline).toISOString() : null);
  };

  const isOverdue = course.deadline && new Date(course.deadline) < new Date();

  return (
    <Link to={`/course/${course.id}`} className="course-card" id={`course-card-${course.id}`} style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, display: 'flex', gap: '4px' }}>
        <button
          className="course-card-menu-btn"
          style={{ position: 'static' }}
          onClick={handleCalendarClick}
          aria-label="Set Deadline"
          title="Set Deadline"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </button>
        <button 
          className="course-card-menu-btn" 
          style={{ position: 'static' }}
          onClick={handleMenuClick}
          aria-label="Options"
        >
          ⋮
        </button>
      </div>

      <input 
        type="date" 
        ref={dateInputRef} 
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }} 
        onChange={handleDateChange}
        value={course.deadline ? new Date(course.deadline).toISOString().split('T')[0] : ''}
      />
      
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
          <div className="course-card-thumb-placeholder">Course</div>
        )}
      </div>
      <div className="course-card-body">
        <h3 className="course-card-title">{course.title}</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {course.total_duration && (
            <span className="course-card-meta">{formatDuration(course.total_duration)}</span>
          )}
          {course.deadline && (
            <span className="course-card-meta" style={isOverdue ? { fontWeight: 'bold', color: 'var(--danger)' } : {}}>
              Due: {new Date(course.deadline).toLocaleDateString()} {isOverdue && '(Overdue)'}
            </span>
          )}
        </div>
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
