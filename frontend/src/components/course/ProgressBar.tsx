/* ── Neo-Brutalist course progress bar ──────────────────────────────────────
   Replaces the old plain progress bar with the "Journey Efficiency Audit"
   style from the home page: striped track, hard shadow card, mono labels. */

interface Props {
  completed: number; // number of lessons the user has completed
  total: number;     // total lessons in the course
}

export default function ProgressBar({ completed, total }: Props) {
  // Calculate percentage; guard against division by zero when total is 0
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    /* Outer card — neo-brutalist bordered box matching the homepage aesthetic */
    <section className="neo-audit-card">

      {/* Header row: title on the left */}
      <div className="neo-audit-head">
        <h2>Course Progress</h2>
      </div>

      {/* Striped progress track — the inner <span> width is driven by pct */}
      <div className="neo-meter" role="progressbar" aria-label="Course progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <span style={{ width: `${pct}%` }} />
      </div>

      {/* Footer row: human-readable lesson count on the left, numeric % on the right */}
      <div className="neo-audit-result">
        <p>{completed} / {total} lessons completed</p>
        <span>{pct}%</span>
      </div>
    </section>
  );
}
