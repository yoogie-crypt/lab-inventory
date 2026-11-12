import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { createUser, listUsers, setUserAktif, updateUser } from '../services/api.js';
import Modal from '../components/Modal.jsx';
import { Empty, Field, FormError, Loading, PageHeader } from '../components/ui.jsx';
import { fmtDate, initials } from '../utils/format.js';

function UserForm({ initial, onCancel, onSaved }) {
  const isEdit = Boolean(initial);
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ nama: initial?.nama || '', username: initial?.username || '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const saved = isEdit ? await updateUser(initial.id, form) : await createUser(form);
      if (saved.id === user.id) setUser(saved);
      toast(isEdit ? `Data ${saved.nama} diperbarui.` : `Akun staff ${saved.username} dibuat.`);
      onSaved();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal
      title={isEdit ? `Edit ${initial.nama}` : 'Tambah akun staff'}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Batal</button>
          <button type="submit" form="user-form" className="btn btn-primary" disabled={busy}>
            {busy ? 'Menyimpan…' : isEdit ? 'Simpan perubahan' : 'Buat akun'}
          </button>
        </>
      }
    >
      <form id="user-form" onSubmit={submit} className="stack" noValidate>
        <FormError message={error} />
        <Field label="Nama lengkap" htmlFor="nama">
          <input id="nama" value={form.nama} onChange={set('nama')} />
        </Field>
        <Field label="Username" htmlFor="username" hint="Huruf kecil, angka, titik, atau garis bawah.">
          <input id="username" value={form.username} onChange={set('username')} autoComplete="off" />
        </Field>
        <Field label={isEdit ? 'Password baru' : 'Password'} htmlFor="password" hint={isEdit ? 'Kosongkan jika tidak diubah.' : 'Minimal 6 karakter.'}>
          <input id="password" type="text" value={form.password} onChange={set('password')} autoComplete="new-password" />
        </Field>
      </form>
    </Modal>
  );
}

export default function Pengguna() {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null); // null | 'new' | user

  const load = useCallback(() => listUsers().then(setItems), []);
  useEffect(() => { load(); }, [load]);

  const toggle = async (u) => {
    try {
      await setUserAktif(u.id, !u.aktif, user.id);
      toast(u.aktif ? `Akun ${u.username} dinonaktifkan.` : `Akun ${u.username} diaktifkan.`);
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const staffCount = items?.filter((u) => u.role === 'staff').length ?? 0;
  const activeStaff = items?.filter((u) => u.role === 'staff' && u.aktif).length ?? 0;

  return (
    <>
      <PageHeader
        title="Pengguna"
        desc={items ? `${staffCount} akun staff, ${activeStaff} aktif. Staff nonaktif tidak bisa masuk ke aplikasi.` : 'Kelola akun staff laboratorium.'}
        action={<button className="btn btn-primary" onClick={() => setEditing('new')}>Tambah staff</button>}
      />

      <section className="panel panel-flush">
        {!items ? <Loading /> : items.length === 0 ? (
          <Empty title="Belum ada pengguna" />
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
                        <span className="strong">{u.nama}{u.id === user.id && <span className="you"> (Anda)</span>}</span>
                      </span>
                    </td>
                    <td className="mono">{u.username}</td>
                    <td><span className={`role-chip role-${u.role}`}>{u.role === 'admin' ? 'Admin' : 'Staff'}</span></td>
                    <td className="nowrap">{fmtDate(u.createdAt)}</td>
                    <td>
                      {u.aktif
                        ? <span className="badge badge-ok">Aktif</span>
                        : <span className="badge badge-muted">Nonaktif</span>}
                    </td>
                    <td className="actions">
                      <button className="btn btn-sm btn-ghost" onClick={() => setEditing(u)}>Edit</button>
                      {u.role === 'staff' && (
                        <button className={`btn btn-sm ${u.aktif ? 'btn-danger-ghost' : 'btn-ghost'}`} onClick={() => toggle(u)}>
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

      {editing && (
        <UserForm
          initial={editing === 'new' ? null : editing}
          onCancel={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </>
  );
}
