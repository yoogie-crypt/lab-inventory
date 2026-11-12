import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Forbidden from '../pages/errors/Forbidden.jsx';

/**
 * Penjaga halaman:
 * - belum login        -> ke /login (alamat tujuan disimpan)
 * - role tidak sesuai  -> halaman "akses ditolak"
 */
export default function RequireRole({ role }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.role !== role) return <Forbidden />;
  return <Outlet />;
}
