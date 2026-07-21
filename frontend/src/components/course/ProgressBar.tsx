interface Props {
  completed: number;
  total: number;
}

export default function ProgressBar({ completed, total }: Props) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="neo-audit-card">
      <div className="neo-audit-head">
        <h2>Course Progress</h2>
      </div>
      <div className="neo-meter" role="progressbar" aria-label="Course progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="neo-audit-result">
        <p>{completed} / {total} lessons completed</p>
        <span>{pct}%</span>
      </div>
    </section>
  );
}
