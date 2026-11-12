/** Bar atas, hanya tampil di layar kecil (mobile). */
export default function Topbar({ role, open, onToggle }) {
  return (
    <header className="topbar">
      <button type="button" className="menu-btn" onClick={onToggle} aria-label="Buka menu" aria-expanded={open}>
        <span /><span /><span />
      </button>
      <strong>Inventaris Lab</strong>
      <span className={`role-chip role-${role}`}>{role === 'admin' ? 'Admin' : 'Staff'}</span>
    </header>
  );
}
