import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Map, NotepadText, Bot, CheckCircle, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return (
    <div className="page home-page">
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
              Convert a Playlist <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link to="/signup" id="hero-cta-signup" className="btn btn-primary btn-lg">
                Get started free
              </Link>
              <Link to="/login" className="btn btn-ghost btn-lg">Sign in</Link>
            </>
          )}
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <span className="feature-icon"><Map className="w-8 h-8 text-[var(--accent)]" /></span>
          <h3>Visual Course Path</h3>
          <p>Every video becomes a node on a winding path. See your entire course at a glance.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon"><NotepadText className="w-8 h-8 text-[var(--accent)]" /></span>
          <h3>Per-lesson Notes</h3>
          <p>Write notes alongside each video. Auto-saved as you type.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon"><Bot className="w-8 h-8 text-[var(--accent)]" /></span>
          <h3>AI Summaries</h3>
          <p>Gemini summarizes each video transcript so you know what you're about to learn.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon"><CheckCircle className="w-8 h-8 text-[var(--accent)]" /></span>
          <h3>Track Progress</h3>
          <p>Mark lessons complete. Your progress is saved and shown on the path.</p>
        </div>
      </section>
    </div>
  );
}
