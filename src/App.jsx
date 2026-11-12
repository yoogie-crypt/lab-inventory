import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import RequireRole from './routes/RequireRole.jsx';
import AppLayout from './components/layout/AppLayout.jsx';

import Login from './pages/auth/Login.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminBarang from './pages/admin/AdminBarang.jsx';
import AdminPeminjaman from './pages/admin/AdminPeminjaman.jsx';
import AdminPengembalian from './pages/admin/AdminPengembalian.jsx';
import AdminRiwayat from './pages/admin/AdminRiwayat.jsx';
import AdminPengguna from './pages/admin/AdminPengguna.jsx';

import StaffDashboard from './pages/staff/StaffDashboard.jsx';
import StaffBarang from './pages/staff/StaffBarang.jsx';
import StaffPeminjaman from './pages/staff/StaffPeminjaman.jsx';
import StaffPengembalian from './pages/staff/StaffPengembalian.jsx';
import StaffRiwayat from './pages/staff/StaffRiwayat.jsx';

import NotFound from './pages/errors/NotFound.jsx';

/** Arahkan "/" ke dashboard sesuai role, atau ke login. */
function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}/dashboard`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />

      {/* ===== Halaman ADMIN ===== */}
      <Route path="/admin" element={<RequireRole role="admin" />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="barang" element={<AdminBarang />} />
          <Route path="peminjaman" element={<AdminPeminjaman />} />
          <Route path="pengembalian" element={<AdminPengembalian />} />
          <Route path="riwayat" element={<AdminRiwayat />} />
          <Route path="pengguna" element={<AdminPengguna />} />
        </Route>
      </Route>

      {/* ===== Halaman STAFF ===== */}
      <Route path="/staff" element={<RequireRole role="staff" />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="barang" element={<StaffBarang />} />
          <Route path="peminjaman" element={<StaffPeminjaman />} />
          <Route path="pengembalian" element={<StaffPengembalian />} />
          <Route path="riwayat" element={<StaffRiwayat />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
