import Navbar from '../components/common/Navbar';
import LoginForm from '../components/auth/LoginForm';
import GoogleAuth from '../components/auth/GoogleAuth';

export default function LoginPage() {
  return (
    <div className="page auth-page">
      <Navbar />
      <main className="auth-container">
        <LoginForm />
        <div className="auth-divider"><span>or</span></div>
        <GoogleAuth />
      </main>
    </div>
  );
}
