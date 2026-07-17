import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

export default function NotFoundPage() {
  return (
    <div className="page">
      <Navbar />
      <main className="error-screen">
        <h1 className="error-code">404</h1>
        <p className="error-message">Page not found</p>
        <Link to="/" className="btn btn-primary">Go home</Link>
      </main>
    </div>
  );
}
