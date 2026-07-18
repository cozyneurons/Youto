import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function JoinCoursePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: `/join/${token}` } });
      return;
    }

    const joinCourse = async () => {
      try {
        const res = await api.post(`/api/courses/join/${token}`);
        if (res.data.course_id) {
          navigate(`/course/${res.data.course_id}`);
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to join course. The link might be invalid or expired.");
      }
    };

    joinCourse();
  }, [token, isAuthenticated, navigate]);

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center" style={{ marginTop: '20vh' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>Cannot Join Course</h1>
        <p style={{ color: 'var(--danger)', marginBottom: '24px' }}>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">Go to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 text-center" style={{ marginTop: '20vh' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Joining Course Path...</h1>
      <div className="spinner" style={{ margin: '0 auto' }}></div>
    </div>
  );
}
