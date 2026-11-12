import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="state-page state-page-full">
      <h1>Halaman tidak ditemukan</h1>
      <p>Alamat yang Anda buka tidak ada di aplikasi ini.</p>
      <Link className="btn btn-primary" to="/dashboard">Ke dashboard</Link>
    </div>
  );
}
