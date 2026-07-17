import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Trophy, Zap, Lightbulb, PlayCircle, Search } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import { recommendationService, type Recommendation } from '../services/recommendationService';
import { uploadService } from '../services/uploadService';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const TOPIC_SUGGESTIONS = [
  'Python', 'JavaScript', 'React', 'Machine Learning', 'Data Science',
  'Web Development', 'Rust', 'Go', 'Docker', 'Kubernetes', 'SQL', 'Deep Learning',
];

export default function DiscoverPage() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setIsLoading(true);
    setError('');
    setRecommendation(null);
    try {
      const rec = await recommendationService.getRecommendation(topic.trim(), level);
      setRecommendation(rec);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not fetch a recommendation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!recommendation?.playlist_url) return;
    setIsImporting(true);
    try {
      const course = await uploadService.extractPlaylist(recommendation.playlist_url);
      navigate(`/course/${course.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to import this playlist. Try pasting the URL directly.');
      setIsImporting(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <main className="container discover-main">
        {/* Hero */}
        <header className="discover-hero">
          <div className="discover-hero-icon"><Search className="w-8 h-8" /></div>
          <h1 className="page-title">Discover the Best Course</h1>
          <p className="page-subtitle">
            Enter a topic and skill level — we'll cross-reference Reddit community sentiment
            with YouTube playlists and use AI to surface the absolute best course for you.
          </p>
        </header>

        {/* Search Form */}
        <form id="discover-form" onSubmit={handleSearch} className="discover-form">
          <div className="discover-form-row">
            <div className="field-group" style={{ flex: 1 }}>
              <label className="field-label" htmlFor="discover-topic">Topic</label>
              <input
                id="discover-topic"
                type="text"
                className="field-input"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Python, React, Machine Learning…"
                required
                disabled={isLoading}
              />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="discover-level">Level</label>
              <select
                id="discover-level"
                className="field-input"
                value={level}
                onChange={e => setLevel(e.target.value)}
                disabled={isLoading}
              >
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Topic suggestions */}
          <div className="topic-chips">
            {TOPIC_SUGGESTIONS.map(t => (
              <button
                key={t}
                type="button"
                className={`chip ${topic === t ? 'chip-active' : ''}`}
                onClick={() => setTopic(t)}
                disabled={isLoading}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            id="discover-search-btn"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={isLoading || !topic.trim()}
          >
            {isLoading ? (
              <><span className="spinner-sm" /> Searching for the best courses…</>
            ) : (
              <><Sparkles className="w-4 h-4 inline-block mr-2" /> Find Best Course</>
            )}
          </button>
        </form>

        {/* Error */}
        {error && <div className="error-banner">{error}</div>}

        {/* Loading state */}
        {isLoading && (
          <div
            className="discover-loading flex items-center justify-center p-8"
            role="status"
            aria-live="polite"
          >
            <span className="spinner-md" aria-hidden="true" />
            <span className="ml-3 text-[var(--text-muted)] animate-pulse">Analyzing community sentiment...</span>
          </div>
        )}

        {/* Result */}
        {recommendation && !isLoading && (
          <div className="recommendation-card">
            <div className={`recommendation-badge ${recommendation._no_gemini ? 'recommendation-badge-fallback' : ''}`}>
              {recommendation._no_gemini ? <><PlayCircle className="w-4 h-4 inline mr-1" /> Top YouTube Result</> : <><Trophy className="w-4 h-4 inline mr-1" /> AI Recommendation</>}
            </div>

            <div className="recommendation-body">
              {recommendation.thumbnail && (
                <img
                  src={recommendation.thumbnail}
                  alt={recommendation.title}
                  className="recommendation-thumb"
                />
              )}
              <div className="recommendation-info">
                <h2 className="recommendation-title">{recommendation.title}</h2>
                <p className="recommendation-channel">by {recommendation.channel}</p>
                {/* Only show justification when Gemini actually reasoned — not the fallback message */}
                {!recommendation._no_gemini && (
                  <p className="recommendation-justification">{recommendation.justification}</p>
                )}
                {recommendation._no_gemini && (
                  <p className="no-gemini-notice"><Zap className="w-4 h-4 inline mr-1" /> Add a <code>GEMINI_API_KEY</code> to get AI-powered reasoning that cross-references community votes.</p>
                )}

                {recommendation.reddit_signals && recommendation.reddit_signals.length > 0 && (
                  <div className="reddit-signals">
                    <span className="reddit-signals-label"><Lightbulb className="w-4 h-4 inline mr-1" /> Community Insights:</span>
                    <ul>
                      {recommendation.reddit_signals.map((sig, i) => (
                        <li key={i}>{sig}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {recommendation._cached && (
                  <span className="cache-badge"><Zap className="w-3 h-3 inline mr-1" /> Cached result</span>
                )}

                <div className="recommendation-actions">
                  <button
                    id="import-recommendation-btn"
                    className="btn btn-primary"
                    onClick={handleImport}
                    disabled={isImporting}
                  >
                    {isImporting ? <><span className="spinner-sm" /> Importing…</> : '📥 Import as Course'}
                  </button>
                  <a
                    href={recommendation.playlist_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost"
                  >
                    View on YouTube →
                  </a>
                </div>
              </div>
            </div>

            {/* Alternative options */}
            {recommendation._youtube_options && recommendation._youtube_options.length > 1 && (
              <div className="alternatives">
                <h3 className="alternatives-title">Other Options Found</h3>
                <div className="alternatives-grid">
                  {recommendation._youtube_options.slice(0, 3).map(opt => (
                    <a
                      key={opt.playlist_id}
                      href={opt.playlist_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="alternative-card"
                    >
                      {opt.thumbnail && <img src={opt.thumbnail} alt={opt.title} />}
                      <div className="alternative-info">
                        <p className="alternative-title">{opt.title}</p>
                        <p className="alternative-channel">{opt.channel}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
