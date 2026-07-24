import Navbar from '../components/common/Navbar';
import GoogleAuth from '../components/auth/GoogleAuth';

export default function LoginPage() {
  return (
    <div className="page auth-page">
      <Navbar />
      <main className="auth-container">
        <GoogleAuth />
      </main>
    </div>
  );
}
