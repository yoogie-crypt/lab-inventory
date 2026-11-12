import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function NotFound() {
  const { user } = useAuth();
  return (
    <div className="state-page state-page-full">
      <h1>Halaman tidak ditemukan</h1>
      <p>Alamat yang Anda buka tidak ada di aplikasi ini.</p>
      <Link className="btn btn-primary" to={user ? `/${user.role}/dashboard` : '/login'}>
        {user ? 'Ke dashboard' : 'Ke halaman login'}
      </Link>
    </div>
  );
}
