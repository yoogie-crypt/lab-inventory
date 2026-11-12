import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { createUser, updateUser } from '../../services/api.js';
import Modal from '../../components/common/Modal.jsx';
import { Field, FormError } from '../../components/common/ui.jsx';

/** initial = null untuk tambah staff, objek user untuk edit. */
export default function UserFormModal({ initial, onCancel, onSaved }) {
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
