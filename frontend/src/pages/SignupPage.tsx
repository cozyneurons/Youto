import Navbar from '../components/common/Navbar';
import SignupForm from '../components/auth/SignupForm';
import GoogleAuth from '../components/auth/GoogleAuth';

export default function SignupPage() {
  return (
    <div className="page auth-page">
      <Navbar />
      <main className="auth-container">
        <SignupForm />
        <div className="auth-divider"><span>or</span></div>
        <GoogleAuth />
      </main>
    </div>
  );
}
