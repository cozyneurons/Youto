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
  const NODE_HEIGHT = 200;
  const SECTION_GAP = 180;
  const SVG_WIDTH = 600;
  const cx = SVG_WIDTH / 2;
  const amp = 140; // horizontal amplitude

  let currentSectionIndex = 0;
  let currentPhase = "Phase 1";
  
  if (lessons.length > 0) {
    const firstValid = lessons.find(l => l.phase && l.phase.trim() !== "");
    if (firstValid) {
      currentPhase = firstValid.phase!.trim();
    }
  }

  const pts = lessons.map((lesson, i) => {
    const rawPhase = lesson.phase?.trim();
    const phaseName = (rawPhase && rawPhase !== "") ? rawPhase : currentPhase;
    
    // If phase changes, we increment section index
    if (i > 0 && phaseName !== currentPhase) {
      currentSectionIndex++;
      currentPhase = phaseName;
    }
    
    return {
      x: i % 2 === 0 ? cx - amp : cx + amp,
      y: 100 + i * NODE_HEIGHT + currentSectionIndex * SECTION_GAP,
      sectionIndex: currentSectionIndex,
      phaseName: currentPhase,
    };
  });

  const totalHeight = pts.length > 0 ? pts[pts.length - 1].y + 100 : 0;

  // Build the dividers array based on where section transitions happen
  const dividers = [];
  if (pts.length > 0) {
    // First divider is always at the top
    dividers.push({ id: 0, y: 0, label: pts[0].phaseName });
    
    // Find where section index changes
    let lastSection = 0;
    for (let i = 1; i < pts.length; i++) {
      if (pts[i].sectionIndex > lastSection) {
        // Place divider halfway between previous node and current node
        const yPos = (pts[i - 1].y + pts[i].y) / 2;
        dividers.push({ id: pts[i].sectionIndex, y: yPos, label: pts[i].phaseName });
        lastSection = pts[i].sectionIndex;
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
