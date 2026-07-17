import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Course } from '../../types';
import { formatDuration } from '../../utils/formatters';
import { useCourseStore } from '../../store/courseStore';
import { DatePicker } from '../common/date-picker';
import { parseDate } from '@internationalized/date';
import type { DateValue } from 'react-aria-components';

interface Props {
  courses: Course[];
}

function CourseCard({ course }: { course: Course }) {
  const [menuOpen, setMenuOpen] = useState(false);
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

  const handleDateChange = (date: DateValue | null) => {
    updateCourseDeadline(course.id, date ? date.toString() : null);
  };

  const now = new Date();
  const todayStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  const isOverdue = course.deadline && course.deadline < todayStr;

  return (
    <div className="course-card" id={`course-card-${course.id}`} style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
        <button
          className="course-card-menu-btn"
          style={{ position: 'static' }}
          onClick={handleMenuClick}
          aria-label="Options"
        >
          ⋮
        </button>
      </div>

      {menuOpen && (
        <div className="course-card-dropdown" onClick={(e) => e.preventDefault()}>
          <button onClick={handleRename}>Rename</button>
          <button onClick={handleDelete} className="text-danger">Delete</button>
        </div>
      )}

      <Link to={`/course/${course.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div className="course-card-thumb">
          {course.thumbnail_url ? (
            <img src={course.thumbnail_url} alt={course.title} loading="lazy" />
          ) : (
            <div className="course-card-thumb-placeholder">Course</div>
          )}
        </div>
        <div className="course-card-body" style={{ paddingBottom: '12px' }}>
          <h3 className="course-card-title">{course.title}</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {course.total_duration && (
              <span className="course-card-meta">{formatDuration(course.total_duration)}</span>
            )}
            {course.deadline && isOverdue && (
              <span className="course-card-meta" style={{ fontWeight: 'bold', color: 'var(--danger)' }}>
                (Overdue)
              </span>
            )}
          </div>
        </div>
      </Link>

      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: 'var(--bg-surface)' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
          {course.deadline ? 'Deadline:' : 'Add Deadline:'}
        </span>
        <DatePicker 
          aria-label="Set Deadline"
          value={course.deadline ? parseDate(course.deadline.split('T')[0]) : null}
          onChange={handleDateChange}
        />
      </div>
    </div>
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
