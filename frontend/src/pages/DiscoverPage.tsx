import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [url, setUrl] = useState('');
  const [isImportingUrl, setIsImportingUrl] = useState(false);
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

  const handleImportUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setError('');

    if (!url.includes('youtube.com/playlist') && !url.includes('youtube.com/watch') && !url.includes('youtu.be/')) {
      setError('Please enter a valid YouTube playlist or video URL');
      return;
    }

    setIsImportingUrl(true);
    try {
      const course = await uploadService.extractPlaylist(url.trim());
      navigate(`/course/${course.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to extract playlist. Try a different URL.');
    } finally {
      setIsImportingUrl(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <main className="container discover-main">


        <h1 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 800, marginBottom: '32px', color: 'var(--ink)' }}>
          Discover the best course
        </h1>

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
                placeholder="e.g. DSA Graph, Operating System"
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
              'Find Best Course'
            )}
          </button>
        </form>

        {(!recommendation && !isLoading) && (
          <>
            <div style={{ textAlign: 'center', margin: '32px 0', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem', letterSpacing: '0.05em' }}>
              — OR —
            </div>

            {/* Direct URL Import Form */}
            <form onSubmit={handleImportUrl} className="discover-form" style={{ marginTop: 0 }}>
              <div className="field-group">
                <label className="field-label" htmlFor="playlist-url">Have a YouTube Playlist URL?</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    id="playlist-url"
                    type="url"
                    className="field-input"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/playlist?list=..."
                    disabled={isImportingUrl}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    disabled={isImportingUrl || !url}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {isImportingUrl ? 'Importing…' : 'Import →'}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}

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
              {recommendation._no_gemini ? 'Top YouTube Result' : 'AI Recommendation'}
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
                  <p className="no-gemini-notice">Add a <code>GEMINI_API_KEY</code> to get AI-powered reasoning that cross-references community votes.</p>
                )}

                {recommendation.reddit_signals && recommendation.reddit_signals.length > 0 && (
                  <div className="reddit-signals">
                    <span className="reddit-signals-label">Community Insights:</span>
                    <ul>
                      {recommendation.reddit_signals.map((sig, i) => (
                        <li key={i}>{sig}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {recommendation._cached && (
                  <span className="cache-badge">Cached result</span>
                )}

                <div className="recommendation-actions">
                  <button
                    id="import-recommendation-btn"
                    className="btn btn-primary"
                    onClick={handleImport}
                    disabled={isImporting}
                  >
                    {isImporting ? <><span className="spinner-sm" /> Importing…</> : 'Import as Course'}
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
