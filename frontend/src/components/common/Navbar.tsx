import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const { notifications, fetchNotifications, markAsRead } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  const toggleNotifications = () => setShowNotifications(prev => !prev);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        Youto
      </Link>

      <div className="navbar-actions">
        <button onClick={toggleTheme} className="btn btn-ghost btn-sm" style={{ padding: '6px' }} title="Toggle Theme">
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          )}
        </button>

        {isAuthenticated ? (
          <>
            <div style={{ position: 'relative' }}>
              <button onClick={toggleNotifications} className="btn btn-ghost btn-sm" style={{ padding: '6px', position: 'relative' }} title="Notifications">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {notifications.length > 0 && (
                  <span style={{ position: 'absolute', top: '2px', right: '4px', background: 'var(--danger)', width: '8px', height: '8px', borderRadius: '50%' }}></span>
                )}
              </button>
              {showNotifications && (
                <div style={{ position: 'absolute', top: '100%', right: '0', width: '300px', background: 'var(--bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '8px', zIndex: 100, boxShadow: 'var(--shadow-md)' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '14px', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px' }}>Notifications</h4>
                  {notifications.length === 0 ? (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No unread notifications</div>
                  ) : (
                    <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {notifications.map(n => (
                        <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', background: 'var(--bg-elevated)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
                          <div>
                            <div>{n.message}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(n.created_at).toLocaleDateString()}</div>
                          </div>
                          <button onClick={() => { markAsRead(n.id); if (n.course_id) navigate(`/course/${n.course_id}`); }} className="btn btn-sm" style={{ padding: '2px 6px' }}>View</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/discover" className="nav-link">Discover</Link>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm">
              Sign out
            </button>
            <Link to="/profile" className="avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Sign in</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
