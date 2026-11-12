import { NavLink } from 'react-router-dom';
import { initials } from '../../utils/format.js';

export default function Sidebar({ open, user, items, onLogout }) {
  const roleLabel = user.role === 'admin' ? 'Admin' : 'Staff';

  return (
    <aside className={`sidebar${open ? ' is-open' : ''}`} aria-label="Navigasi utama">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true"><span /></span>
        <div>
          <strong>Inventaris Lab</strong>
          <small>Panel {roleLabel}</small>
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
            <small>{roleLabel} (@{user.username})</small>
          </div>
        </div>
        <button type="button" className="btn btn-sidebar" onClick={onLogout}>Keluar</button>
      </div>
    </aside>
  );
}
