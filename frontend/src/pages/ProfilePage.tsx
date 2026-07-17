import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

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

          <button id="profile-save" type="submit" className="btn btn-primary">
            Save changes
          </button>
        </form>
      </main>
    </div>
  );
}
