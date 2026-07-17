import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.');
    }
  };

  return (
    <form id="login-form" className="auth-form" onSubmit={handleSubmit}>
      <h1 className="auth-title">Sign in</h1>
      <p className="auth-subtitle">Welcome back to Youto</p>

      {error && <div className="error-banner">{error}</div>}

      <label className="field-label" htmlFor="login-email">Email</label>
      <input
        id="login-email"
        type="email"
        className="field-input"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        autoComplete="email"
      />

      <label className="field-label" htmlFor="login-password">Password</label>
      <input
        id="login-password"
        type="password"
        className="field-input"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="••••••••"
        required
        autoComplete="current-password"
      />

      <button id="login-submit" type="submit" className="btn btn-primary w-full" disabled={isLoading}>
        {isLoading ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="auth-footer">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </form>
  );
}
