import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { uploadService } from '../services/uploadService';
import { isValidYouTubeUrl } from '../utils/validators';

export default function UploadPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (navigationTimer.current) clearTimeout(navigationTimer.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSuccess(false);

    if (!isValidYouTubeUrl(url)) {
      setError('Please enter a valid YouTube playlist or video URL');
      return;
    }

    setIsLoading(true);
    try {
      const course = await uploadService.extractPlaylist(url);
      setIsSuccess(true);
      navigationTimer.current = setTimeout(() => navigate(`/course/${course.id}`), 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to extract playlist. Try a different URL.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <main className="container upload-main">
        <div className="upload-card">
          <Link to="/dashboard" className="back-link" style={{ display: 'block', marginBottom: '12px' }}>← Back to Dashboard</Link>
          <h1 className="page-title">New Course</h1>
          <p className="page-subtitle">
            Paste a YouTube playlist URL and we'll build your course instantly.
          </p>

          <form id="upload-form" onSubmit={handleSubmit} className="upload-form">
            {error && <div className="error-banner">{error}</div>}

            <label className="field-label" htmlFor="playlist-url">YouTube Playlist URL</label>
            <input
              id="playlist-url"
              type="url"
              className="field-input field-input-lg"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/playlist?list=..."
              required
              disabled={isLoading || isSuccess}
            />

            <button
              id="extract-btn"
              type="submit"
              className={`btn btn-lg w-full ${isSuccess ? 'btn-success' : 'btn-primary'}`}
              disabled={isLoading || !url || isSuccess}
              style={isSuccess ? { background: 'var(--success)', color: 'var(--ink)' } : {}}
            >
              {isLoading ? (
                <><span className="spinner-sm" /> Extracting playlist…</>
              ) : isSuccess ? (
                'Playlist Imported Successfully!'
              ) : (
                'Build Course →'
              )}
            </button>
          </form>

          {isLoading && (
            <p className="upload-hint">
              This may take a moment for large playlists. Please wait…
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
