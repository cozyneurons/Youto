import type { Course } from '../../types';
import { Link } from 'react-router-dom';

interface Props {
  courses: Course[];
}

export default function RecentActivity({ courses }: Props) {
  const recent = courses.slice(0, 5);
  if (recent.length === 0) return null;

  return (
    <div className="recent-activity">
      <h2 className="section-title">Continue Learning</h2>
      <ul className="activity-list">
        {recent.map(c => (
          <li key={c.id} className="activity-item">
            <Link to={`/course/${c.id}`} id={`recent-${c.id}`}>
              <span className="activity-icon">▶</span>
              <span className="activity-title">{c.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
