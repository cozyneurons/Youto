import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { uploadService } from '../services/uploadService';
import toast from 'react-hot-toast';

export default function PlaylistImportPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const listId = searchParams.get('list');
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (!listId) {
      toast.error('No playlist ID found in URL.');
      navigate('/dashboard', { replace: true });
      return;
    }

    const importPlaylist = async () => {
      try {
        const youtubeUrl = `https://www.youtube.com/playlist?list=${listId}`;
        const course = await uploadService.extractPlaylist(youtubeUrl);
        toast.success('Course created! Fetching content in the background...');
        navigate(`/course/${course.id}`, { replace: true });
      } catch (err: any) {
        toast.error(err.response?.data?.detail || 'Failed to import playlist.');
        navigate('/dashboard', { replace: true });
      }
    };

    importPlaylist();
  }, [listId, navigate]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <div className="card text-center max-w-md p-10 animate-fade-in flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-yellow border-t-ink rounded-full animate-spin mb-6"></div>
          <h1 className="text-2xl font-bold mb-4">Magic Import in Progress!</h1>
          <p className="text-gray-600 mb-2">We caught your playlist ID: <span className="font-mono bg-gray-200 px-2 rounded">{listId}</span></p>
          <p className="text-gray-600">Building your structured course. This will just take a second...</p>
        </div>
      </div>
    </>
  );
}
