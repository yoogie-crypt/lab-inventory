import { Empty, Loading } from '../../components/common/ui.jsx';
import { fmtDate, initials } from '../../utils/format.js';

export default function UserTable({ items, currentUserId, onEdit, onToggle }) {
  return (
    <section className="panel panel-flush">
      {!items ? <Loading /> : items.length === 0 ? (
        <Empty title="Tidak ada pengguna" />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Username</th>
                <th>Role</th>
                <th>Dibuat</th>
                <th>Status</th>
                <th className="actions-col"><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} className={u.aktif ? '' : 'is-muted'}>
                  <td>
                    <span className="user-cell">
                      <span className="avatar avatar-sm">{initials(u.nama)}</span>
                      <span className="strong">{u.nama}{u.id === currentUserId && <span className="you"> (Anda)</span>}</span>
                    </span>
                  </td>
                  <td className="mono">{u.username}</td>
                  <td><span className={`role-chip role-${u.role}`}>{u.role === 'admin' ? 'Admin' : 'Staff'}</span></td>
                  <td className="nowrap">{fmtDate(u.createdAt)}</td>
                  <td>
                    {u.aktif ? <span className="badge badge-ok">Aktif</span> : <span className="badge badge-muted">Nonaktif</span>}
                  </td>
                  <td className="actions">
                    <button className="btn btn-sm btn-ghost" onClick={() => onEdit(u)}>Edit</button>
                    {u.role === 'staff' && (
                      <button className={`btn btn-sm ${u.aktif ? 'btn-danger-ghost' : 'btn-ghost'}`} onClick={() => onToggle(u)}>
                        {u.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
