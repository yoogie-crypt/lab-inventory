export function AssetTag({ kode }) {
  return (
    <span className="tag">
      <span className="tag-hole" aria-hidden="true" />
      {kode}
    </span>
  );
}

export function PageHeader({ title, desc, action }) {
  return (
    <header className="page-head">
      <div>
        <h1>{title}</h1>
        {desc && <p>{desc}</p>}
      </div>
      {action && <div className="page-head-action">{action}</div>}
    </header>
  );
}

export function StockBadge({ tersedia, stok }) {
  if (tersedia === 0) return <span className="badge badge-danger">Habis</span>;
  if (tersedia <= Math.max(1, Math.floor(stok * 0.3))) return <span className="badge badge-warn">Menipis</span>;
  return <span className="badge badge-ok">Tersedia</span>;
}

export function StatusBadge({ status }) {
  return status === 'Dipinjam'
    ? <span className="badge badge-warn">Dipinjam</span>
    : <span className="badge badge-ok">Selesai</span>;
}

export function Empty({ title, children }) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </div>
  );
}

export function Loading({ label = 'Memuat data…' }) {
  return <div className="loading" role="status">{label}</div>;
}

export function Field({ label, hint, error, children, htmlFor, className = '' }) {
  return (
    <div className={`field ${className}`.trim()}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !error && <small className="hint">{hint}</small>}
      {error && <small className="field-error">{error}</small>}
    </div>
  );
}

export function FormError({ message }) {
  if (!message) return null;
  return <div className="form-error" role="alert">{message}</div>;
}
