export default function Loading({ text = 'Loading…' }: { text?: string }) {
  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p className="loading-text">{text}</p>
    </div>
  );
}
