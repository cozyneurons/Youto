import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import LeetcodeHeatmap from '../components/profile/LeetcodeHeatmap';
import Loading from '../components/common/Loading';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [activity, setActivity] = useState<{ heatmap: Record<string, number>, current_streak: number, longest_streak: number } | null>(null);
  const [activityError, setActivityError] = useState(false);
  const [activityLoading, setActivityLoading] = useState(true);

  const fetchActivity = () => {
    setActivityLoading(true);
    setActivityError(false);
    api.get('/api/users/activity')
      .then(res => setActivity(res.data))
      .catch(err => {
        console.error(err);
        setActivityError(true);
      })
      .finally(() => setActivityLoading(false));
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.put('/api/users/profile', { name });
      setUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Failed to update profile');
    }
  };

  return (
    <div className="page">
      <Navbar />
      <main className="container profile-main">
        <h1 className="page-title">Profile</h1>

        <form id="profile-form" className="profile-form" onSubmit={handleSave}>
          {error && <div className="error-banner">{error}</div>}
          {saved && <div className="success-banner">Profile updated!</div>}

          <label className="field-label" htmlFor="profile-email">Email</label>
          <input
            id="profile-email"
            type="email"
            className="field-input"
            value={user?.email || ''}
            disabled
          />

          <label className="field-label" htmlFor="profile-name">Name</label>
          <input
            id="profile-name"
            type="text"
            className="field-input"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button id="profile-save" type="submit" className="btn btn-primary">
              Save changes
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                useAuthStore.getState().logout();
                window.location.href = '/login';
              }}
            >
              Sign out
            </button>
          </div>
        </form>

        {activityLoading && (
          <div className="profile-activity" style={{ marginTop: '48px' }}>
            <h2 className="page-title" style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Activity</h2>
            <Loading text="Loading activity..." />
          </div>
        )}

        {!activityLoading && activityError && (
          <div className="profile-activity" style={{ marginTop: '48px' }}>
            <h2 className="page-title" style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Activity</h2>
            <div className="error-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Failed to load activity data.</span>
              <button onClick={fetchActivity} className="btn btn-sm" style={{ background: 'transparent', border: '1px solid currentColor', color: 'inherit' }}>
                Retry
              </button>
            </div>
          </div>
        )}

        {!activityLoading && activity && !activityError && (
          <div className="profile-activity" style={{ marginTop: '48px' }}>
            <h2 className="page-title" style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Activity</h2>

            <LeetcodeHeatmap
              data={activity.heatmap}
              longestStreak={activity.longest_streak}
            />
          </div>
        )}
      </main>
    </div>
  );
}
