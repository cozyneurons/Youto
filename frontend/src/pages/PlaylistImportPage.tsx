import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { uploadService } from '../services/uploadService';

export default function PlaylistImportPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const listId = searchParams.get('list');
  const hasRun = useRef<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (listId && hasRun.current === listId) return;
    if (listId) hasRun.current = listId;

    let timerId: ReturnType<typeof setTimeout> | undefined;

    if (!listId) {
      hasRun.current = null;
      setErrorMsg('No playlist ID found in URL.');
      timerId = setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
      return () => { if (timerId) clearTimeout(timerId); };
    }

    setErrorMsg(null);

    const abortController = new AbortController();
    let isActive = true;

    const importPlaylist = async () => {
      try {
        const youtubeUrl = new URL('https://www.youtube.com/playlist');
        youtubeUrl.searchParams.set('list', listId);
        const course = await uploadService.extractPlaylist(youtubeUrl.toString(), { signal: abortController.signal });
        if (isActive) {
          navigate(`/course/${course.id}`, { replace: true });
        }
      } catch (err: any) {
        if (isActive && err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          const detail = err.response?.data?.detail;
          let errorMessage = 'Failed to import playlist.';
          if (typeof detail === 'string') {
            errorMessage = detail;
          } else if (Array.isArray(detail)) {
            errorMessage = detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
          } else if (detail) {
            errorMessage = JSON.stringify(detail);
          }
          setErrorMsg(errorMessage);
          timerId = setTimeout(() => navigate('/dashboard', { replace: true }), 3000);
        }
      }
    };

    importPlaylist();

    return () => {
      isActive = false;
      abortController.abort();
      if (timerId) clearTimeout(timerId);
    };
  }, [listId, navigate]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <div className="card text-center max-w-md p-10 animate-fade-in flex flex-col items-center">
          {errorMsg ? (
            <>
              <div className="w-16 h-16 border-4 border-red-500 text-red-500 rounded-full flex items-center justify-center text-2xl mb-6">!</div>
              <h1 className="text-2xl font-bold mb-4 text-red-600">Import Failed</h1>
              <p className="text-gray-600">{errorMsg}</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 border-4 border-yellow border-t-ink rounded-full animate-spin mb-6"></div>
              <h1 className="text-2xl font-bold mb-4">Loading Playlist...</h1>
              <p className="text-gray-600">Building your structured course. This will just take a second...</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
