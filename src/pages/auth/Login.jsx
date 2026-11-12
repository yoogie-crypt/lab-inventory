import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { AssetTag, FormError } from '../../components/common/ui.jsx';
import '../../styles/login.css';

const DEMO = [
  { role: 'Admin', username: 'admin', password: 'admin123' },
  { role: 'Staff', username: 'staff', password: 'staff123' },
];

const SAMPLE_TAGS = [
  ['BR001', 'Laptop Lenovo'],
  ['BR004', 'Proyektor Epson'],
  ['BR006', 'Switch TP-Link 24 Port'],
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError('Isi username dan password.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const u = await login(form.username, form.password);
      // Kembali ke halaman tujuan hanya jika masih di area role yang sama.
      const from = location.state?.from;
      const target = from && from.startsWith(`/${u.role}/`) ? from : `/${u.role}/dashboard`;
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <section className="login-side" aria-hidden="true">
        <div className="login-side-inner">
          <span className="brand-mark brand-mark-lg"><span /></span>
          <h1>Inventaris &amp; peminjaman laboratorium komputer</h1>
          <p>Catat setiap barang yang keluar dan kembali, dan lihat stok yang siap dipinjam kapan saja.</p>
          <ul className="login-tags">
            {SAMPLE_TAGS.map(([kode, nama]) => (
              <li key={kode}><AssetTag kode={kode} /> <span>{nama}</span></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="login-main">
        <form className="login-form" onSubmit={onSubmit} noValidate>
          <h2>Masuk</h2>
          <p className="muted">Gunakan akun yang diberikan admin laboratorium.</p>

          <FormError message={error} />

          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              autoComplete="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="input-group">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button type="button" className="input-addon" onClick={() => setShowPw((s) => !s)}>
                {showPw ? 'Sembunyikan' : 'Lihat'}
              </button>
            </div>
          </div>

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Memeriksa…' : 'Masuk'}
          </button>

          <div className="demo-box">
            <p>Akun demo untuk pengujian</p>
            <div className="demo-list">
              {DEMO.map((d) => (
                <button
                  key={d.username}
                  type="button"
                  className="demo-item"
                  onClick={() => { setForm({ username: d.username, password: d.password }); setError(''); }}
                >
                  <strong>{d.role}</strong>
                  <span>{d.username} / {d.password}</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
