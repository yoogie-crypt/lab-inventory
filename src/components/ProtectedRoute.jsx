import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ roles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="state-page">
        <h1>Halaman ini khusus admin</h1>
        <p>Akun staff tidak memiliki akses ke pengelolaan pengguna atau pengaturan admin.</p>
        <Link className="btn btn-primary" to="/dashboard">Kembali ke dashboard</Link>
      </div>
    );
  }
  return <Outlet />;
}
