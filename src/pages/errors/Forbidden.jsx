import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Forbidden() {
  const { user } = useAuth();
  const isStaff = user?.role === 'staff';

  return (
    <div className="state-page state-page-full">
      <h1>{isStaff ? 'Halaman ini khusus admin' : 'Halaman ini untuk akun staff'}</h1>
      <p>
        {isStaff
          ? 'Akun staff tidak bisa menghapus barang, mengelola pengguna, atau membuka pengaturan admin.'
          : 'Anda masuk sebagai admin. Gunakan menu admin untuk mengelola laboratorium.'}
      </p>
      <Link className="btn btn-primary" to={`/${user.role}/dashboard`}>Kembali ke dashboard</Link>
    </div>
  );
}
