import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import PathGraph from '../components/course/PathGraph';
import ProgressBar from '../components/course/ProgressBar';
import Loading from '../components/common/Loading';
import { useCourse } from '../hooks/useCourse';
import { useProgress } from '../hooks/useProgress';
import api from '../services/api';
import { API_BASE_URL } from '../utils/constants';
import { useAuthStore } from '../store/authStore';

export interface FriendProgress {
  user_id: number;
  name: string;
  avatar_url: string | null;
  active_index: number;
}

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const { course, lessons, isLoading } = useCourse(courseId);
  const { courseProgress, completedLessons } = useProgress(courseId);
  const { user } = useAuthStore();

  const [friends, setFriends] = useState<FriendProgress[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const shareMessageTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (shareMessageTimeoutRef.current !== null) {
        window.clearTimeout(shareMessageTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Fetch friends initially
    const fetchFriends = async () => {
      try {
        const res = await api.get(`/api/courses/${courseId}/friends`);
        setFriends(res.data);
      } catch (e) {
        console.error("Failed to fetch friends", e);
      }
    };
    if (user) fetchFriends();
  }, [courseId, user]);

  useEffect(() => {
    if (!user) return;

    let ws: WebSocket | null = null;
    let isSubscribed = true;
    let retryTimeout: number | null = null;
    let retryCount = 0;
    let stabilityTimeout: number | null = null;

    const connectWs = async () => {
      const scheduleRetry = () => {
        if (!isSubscribed || retryCount >= 10) return;
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
        retryCount++;
        retryTimeout = window.setTimeout(connectWs, delay);
      };

      try {
        const ticketRes = await api.post('/api/ws/ticket');
        if (!isSubscribed) return;

        const ticket = ticketRes.data.ticket;
        const wsUrl = API_BASE_URL.replace('http', 'ws') + `/api/ws/courses/${courseId}/ws?ticket=${ticket}`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('WebSocket connected');
          stabilityTimeout = window.setTimeout(() => {
            retryCount = 0;
            stabilityTimeout = null;
          }, 3000);
        };

        ws.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'PROGRESS_UPDATE' && data.completed) {
              if (data.user_id !== user.id) {
                // Refetch friends
                api.get(`/api/courses/${courseId}/friends`)
                  .then(res => {
                    if (isSubscribed) setFriends(res.data);
                  })
                  .catch(console.error);
              }
            }
          } catch (e) {
            console.error("Error parsing WS message", e);
          }
        };

        ws.onclose = (event) => {
          if (stabilityTimeout !== null) {
            window.clearTimeout(stabilityTimeout);
            stabilityTimeout = null;
          }
          if (event.code === 1008 || event.code === 401 || event.code === 403) return;
          scheduleRetry();
        };

        ws.onerror = () => {
          if (ws) ws.close();
        };

      } catch (err: any) {
        console.error("Failed to connect to WebSocket", err);
        if (!isSubscribed) return;

        if (err.response?.status === 401 || err.response?.status === 403) {
          return;
        }

        scheduleRetry();
      }
    };

    connectWs();

    return () => {
      isSubscribed = false;
      if (retryTimeout !== null) {
        window.clearTimeout(retryTimeout);
      }
      if (stabilityTimeout !== null) {
        window.clearTimeout(stabilityTimeout);
      }
      if (ws) {
        ws.onclose = null;
        ws.onerror = null;
        ws.close();
      }
    };
  }, [courseId, user]);

  const handleShare = async () => {
    if (shareMessageTimeoutRef.current !== null) {
      window.clearTimeout(shareMessageTimeoutRef.current);
      shareMessageTimeoutRef.current = null;
    }
    setIsSharing(true);
    setShareMessage('');
    
    let isSuccess = false;
    try {
      const res = await api.post(`/api/courses/${courseId}/share`);
      const token = res.data.token;
      const joinUrl = `${window.location.origin}/join/${token}`;
      try {
        await navigator.clipboard.writeText(joinUrl);
        setShareMessage('Copied!');
        isSuccess = true;
      } catch (clipErr) {
        setShareMessage(`Invite link generated: ${joinUrl} (copy manually)`);
      }
    } catch (e: any) {
      setShareMessage(e.response?.data?.detail || 'Failed to share course.');
    } finally {
      setIsSharing(false);
      shareMessageTimeoutRef.current = window.setTimeout(() => {
        setShareMessage('');
        shareMessageTimeoutRef.current = null;
      }, isSuccess ? 2000 : 10000);
    }
  };

  if (isLoading) return <><Navbar /><Loading text="Loading course…" /></>;
  if (!course) return <><Navbar /><div className="error-screen"><p>Course not found.</p></div></>;

  return (
    <div className="page">
      <Navbar />
      <main className="container course-main">
        <header className="course-header">
          <Link to="/dashboard" className="back-link" style={{ display: 'block', marginBottom: '12px' }}>← Back to Dashboard</Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="page-title" style={{ margin: 0 }}>{course.title}</h1>

            <div style={{ position: 'relative' }}>
              <button
                onClick={handleShare}
                disabled={isSharing || shareMessage === 'Copied!'}
                className={`btn ${shareMessage === 'Copied!' ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {shareMessage === 'Copied!' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                )}
                {isSharing ? 'Generating...' : shareMessage === 'Copied!' ? 'Copied Link' : 'Share Path'}
              </button>
              {shareMessage && shareMessage !== 'Copied!' && (
                <div style={{
                  position: 'absolute', top: '100%', right: '0', marginTop: '8px',
                  padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)', fontSize: '12px', whiteSpace: 'nowrap', zIndex: 10
                }}>
                  {shareMessage}
                </div>
              )}
            </div>
          </div>

          {courseProgress && (
            <div style={{ marginTop: '16px' }}>
              <ProgressBar
                completed={courseProgress.completed}
                total={courseProgress.total}
              />
            </div>
          )}

          {friends.length > 0 && (
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <span>Shared with {friends.length} friend{friends.length !== 1 ? 's' : ''}:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {friends.map(f => (
                  <div key={f.user_id} title={f.name} style={{
                    width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold'
                  }}>
                    {f.avatar_url ? <img src={f.avatar_url} alt={f.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : f.name.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </header>

        {lessons.length > 0 ? (
          <PathGraph
            lessons={lessons}
            courseId={courseId}
            completedLessons={completedLessons}
            friends={friends}
            currentUser={{
              user_id: user?.id || 0,
              name: user?.name || 'You',
              avatar_url: user?.avatar_url || null,
              active_index: lessons.findIndex(l => !completedLessons[l.id]) === -1 ? lessons.length : lessons.findIndex(l => !completedLessons[l.id])
            }}
          />
        ) : (
          <p className="empty-state">No lessons found for this course.</p>
        )}
      </main>
    </div>
  );
}
