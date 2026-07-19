import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/common/Navbar';

export default function HomePage() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return (
    <div className="page home-page">
      <Navbar />
      <section className="hero">
        <div className="hero-badge">YouTube → Structured Course</div>
        <h1 className="hero-title">
          Learn from YouTube,<br />
          <span className="hero-accent">Actually finish it.</span>
        </h1>
        <p className="hero-subtitle">
          Paste a YouTube playlist URL. Get a structured course with a visual path,
          AI-generated summaries, and per-lesson notes — in seconds.
        </p>
        <div className="hero-cta">
          {isAuthenticated ? (
            <Link to="/upload" id="hero-cta-upload" className="btn btn-primary btn-lg flex items-center gap-2">
              Convert a Playlist
            </Link>
          ) : (
            <>
              <Link to="/signup" id="hero-cta-signup" className="btn btn-primary btn-lg">
                Get started free
              </Link>
              <Link to="/login" className="btn btn-ghost btn-lg">Sign in</Link>
            </>
          )}
          <button
            id="click-me-btn"
            onClick={() => alert('You clicked me! 🎉')}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #a855f7, #6366f1)',
              color: '#fff',
              border: 'none',
              borderRadius: '999px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(168,85,247,0.4)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 28px rgba(168,85,247,0.6)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(168,85,247,0.4)';
            }}
          >
            ✨ Click Me
          </button>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <span className="feature-icon"></span>
          <h3>Visual Course Path</h3>
          <p>Every video becomes a node on a winding path. See your entire course at a glance.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon"></span>
          <h3>Per-lesson Notes</h3>
          <p>Write notes alongside each video. Auto-saved as you type.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon"></span>
          <h3>AI Summaries</h3>
          <p>Gemini summarizes each video transcript so you know what you're about to learn.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon"></span>
          <h3>Track Progress</h3>
          <p>Mark lessons complete. Your progress is saved and shown on the path.</p>
        </div>
      </section>
    </div>
  );
}
