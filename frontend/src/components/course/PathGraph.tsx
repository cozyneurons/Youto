import type { Lesson } from '../../types';
import VideoNode from './VideoNode';

interface Props {
  lessons: Lesson[];
  courseId: number;
  completedLessons: Record<number, boolean>;
}

/**
 * PathGraph renders a sinusoidal SVG path with VideoNode items
 * alternating left and right along the path — like a winding road.
 */
export default function PathGraph({ lessons, courseId, completedLessons }: Props) {
  const NODE_HEIGHT = 160;
  const SECTION_GAP = 180;
  const SVG_WIDTH = 600;
  const cx = SVG_WIDTH / 2;
  const amp = 180; // horizontal amplitude

  const sectionSize = Math.max(1, Math.ceil(lessons.length / 3));

  const pts = lessons.map((_, i) => {
    const sectionIndex = Math.floor(i / sectionSize);
    return {
      x: i % 2 === 0 ? cx - amp : cx + amp,
      y: 100 + i * NODE_HEIGHT + sectionIndex * SECTION_GAP,
      sectionIndex,
    };
  });

  const totalHeight = pts.length > 0 ? pts[pts.length - 1].y + 100 : 0;

  const dividers = [];
  if (lessons.length > 0) {
    dividers.push({ id: 0, y: 0, label: "Phase 1" });
    if (lessons.length > sectionSize) {
      const idx2 = sectionSize;
      if (idx2 < pts.length) {
        dividers.push({ id: 1, y: (pts[idx2 - 1].y + pts[idx2].y) / 2, label: "Phase 2" });
      }
      const idx3 = sectionSize * 2;
      if (idx3 < pts.length) {
        dividers.push({ id: 2, y: (pts[idx3 - 1].y + pts[idx3].y) / 2, label: "Phase 3" });
      }
    }
  }

  // Build SVG cubic bezier path through all node y positions
  const buildPath = () => {
    if (pts.length === 0) return '';
    let d = `M ${cx} 0`;
    pts.forEach((pt, i) => {
      const prevY = i === 0 ? 0 : pts[i - 1].y;
      const cp1y = prevY + (pt.y - prevY) * 0.4;
      const cp2y = pt.y - (pt.y - prevY) * 0.4;
      const prevX = i === 0 ? cx : pts[i - 1].x;
      d += ` C ${prevX} ${cp1y}, ${pt.x} ${cp2y}, ${pt.x} ${pt.y}`;
    });
    return d;
  };

  return (
    <div className="path-graph-container" style={{ position: 'relative', minHeight: totalHeight }}>
      {/* SVG path */}
      <svg
        className="path-svg"
        width={SVG_WIDTH}
        height={totalHeight}
        viewBox={`0 0 ${SVG_WIDTH} ${totalHeight}`}
        preserveAspectRatio="xMidYMin meet"
      >
        <path
          d={buildPath()}
          stroke="var(--color-path)"
          strokeWidth="3"
          fill="none"
          strokeDasharray="8 6"
          strokeLinecap="round"
        />
      </svg>

      {/* Nodes overlaid on SVG */}
      <div className="path-nodes" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: SVG_WIDTH, height: totalHeight }}>
        {dividers.map(div => (
          <div
            key={`div-${div.id}`}
            className="section-badge"
            style={{ position: 'absolute', left: cx, top: div.y, transform: 'translate(-50%, -50%)', zIndex: 5 }}
          >
            {div.label}
          </div>
        ))}
        {lessons.map((lesson, i) => (
          <div key={lesson.id} style={{ position: 'absolute', left: pts[i].x, top: pts[i].y, transform: 'translate(-50%, -50%)', zIndex: 10 }}>
            <VideoNode
              lesson={lesson}
              courseId={courseId}
              completed={!!completedLessons[lesson.id]}
              side={i % 2 === 0 ? 'left' : 'right'}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
