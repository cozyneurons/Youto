import { useNavigate } from 'react-router-dom';
import type { Lesson } from '../../types';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { formatDuration, extractVideoId } from '../../utils/formatters';

interface Props {
  lesson: Lesson;
  courseId: number;
  completed: boolean;
  side: 'left' | 'right';
}

export default function VideoNode({ lesson, courseId, completed, side }: Props) {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollReveal();
  const videoId = extractVideoId(lesson.video_url);
  const thumbnail = videoId
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : null;



  return (
    <div
      ref={ref}
      className={`video-node ${side} ${isVisible ? 'visible' : ''} ${completed ? 'completed' : ''}`}
      onClick={() => navigate(`/course/${courseId}/lesson/${lesson.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/course/${courseId}/lesson/${lesson.id}`)}
    >
      {/* Always-visible label */}
      <div className="node-label">
        <span className="node-label-title">{lesson.title}</span>
        {lesson.duration && (
          <span className="node-label-duration">{formatDuration(lesson.duration)}</span>
        )}
      </div>

      {/* The glowing dot */}
      <div className="node-dot">
        {completed ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <span className="node-index">{lesson.order_index + 1}</span>
        )}
      </div>

      {/* Hover-only thumbnail card */}
      <div className="node-card">
        {thumbnail && (
          <div className="node-thumbnail-wrapper">
            <img src={thumbnail} alt={lesson.title} className="node-thumbnail" loading="lazy" />
          </div>
        )}
        <div className="node-info">
          <p className="node-title">{lesson.title}</p>
          {lesson.duration && (
            <span className="node-duration">{formatDuration(lesson.duration)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
