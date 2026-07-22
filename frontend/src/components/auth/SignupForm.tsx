import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuthStore();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    try {
      await signup(email, password, name);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Sign up failed. Try again.');
    }
  };

  return (
    <form id="signup-form" className="auth-form" onSubmit={handleSubmit}>
      <h1 className="auth-title">Create account</h1>
      <p className="auth-subtitle">Start learning from YouTube</p>

      {error && <div className="error-banner">{error}</div>}

      <label className="field-label" htmlFor="signup-name">Name</label>
      <input
        id="signup-name"
        type="text"
        className="field-input"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Your name"
        autoComplete="name"
      />

      <label className="field-label" htmlFor="signup-email">Email</label>
      <input
        id="signup-email"
        type="email"
        className="field-input"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        autoComplete="email"
      />

      <label className="field-label" htmlFor="signup-password">Password</label>
      <input
        id="signup-password"
        type="password"
        className="field-input"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Min 8 characters"
        required
        autoComplete="new-password"
        minLength={8}
      />

      <button id="signup-submit" type="submit" className="btn btn-primary w-full" disabled={isLoading}>
        {isLoading ? 'Creating account…' : 'Create account'}
      </button>

      <p className="auth-footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </form>
  );
}
