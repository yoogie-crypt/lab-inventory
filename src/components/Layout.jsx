import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { initials } from '../utils/format.js';

const NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/barang', label: 'Data barang' },
  { to: '/peminjaman', label: 'Peminjaman' },
  { to: '/pengembalian', label: 'Pengembalian' },
  { to: '/riwayat', label: 'Riwayat transaksi' },
  { to: '/pengguna', label: 'Pengguna', adminOnly: true },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => setOpen(false), [pathname]);

  const items = NAV.filter((n) => !n.adminOnly || isAdmin);

  return (
    <div className="shell">
      <aside className={`sidebar${open ? ' is-open' : ''}`} aria-label="Navigasi utama">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <div>
            <strong>Inventaris Lab</strong>
            <small>Laboratorium Komputer</small>
          </div>
        </div>

        <nav className="nav">
          {items.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="who">
            <span className="avatar">{initials(user.nama)}</span>
            <div>
              <strong>{user.nama}</strong>
              <small>{isAdmin ? 'Admin' : 'Staff'} (@{user.username})</small>
            </div>
          </div>
          <button type="button" className="btn btn-sidebar" onClick={handleLogout}>Keluar</button>
        </div>
      </aside>

      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button type="button" className="menu-btn" onClick={() => setOpen((o) => !o)} aria-label="Buka menu" aria-expanded={open}>
            <span /><span /><span />
          </button>
          <strong>Inventaris Lab</strong>
          <span className={`role-chip role-${user.role}`}>{isAdmin ? 'Admin' : 'Staff'}</span>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
