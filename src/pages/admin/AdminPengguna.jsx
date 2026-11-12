import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { listUsers, setUserAktif } from '../../services/api.js';
import { PageHeader } from '../../components/common/ui.jsx';
import UserTable from '../../features/pengguna/UserTable.jsx';
import UserFormModal from '../../features/pengguna/UserFormModal.jsx';

/** Admin: tambah staff, lihat & ubah data pengguna, aktif/nonaktifkan akun. */
export default function AdminPengguna() {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null); // null | 'new' | user

  const load = useCallback(() => listUsers().then(setItems), []);
  useEffect(() => { load(); }, [load]);

  const toggle = async (u) => {
    try {
      await setUserAktif(u.id, !u.aktif);
      toast(u.aktif ? `Akun ${u.username} dinonaktifkan.` : `Akun ${u.username} diaktifkan.`);
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const staff = items?.filter((u) => u.role === 'staff') ?? [];
  const aktif = staff.filter((u) => u.aktif).length;

  return (
    <>
      <PageHeader
        title="Pengguna"
        desc={items
          ? `${staff.length} akun staff, ${aktif} aktif. Staff nonaktif tidak bisa masuk ke aplikasi.`
          : 'Kelola akun staff laboratorium.'}
        action={<button className="btn btn-primary" onClick={() => setEditing('new')}>Tambah staff</button>}
      />

      <UserTable items={items} currentUserId={user.id} onEdit={setEditing} onToggle={toggle} />

      {editing && (
        <UserFormModal
          initial={editing === 'new' ? null : editing}
          onCancel={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </>
  );
}
