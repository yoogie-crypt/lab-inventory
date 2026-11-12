import { useState } from 'react';
import { PageHeader } from '../../components/common/ui.jsx';
import useBarang from '../../features/barang/useBarang.js';
import BarangToolbar from '../../features/barang/BarangToolbar.jsx';
import BarangTable from '../../features/barang/BarangTable.jsx';
import BarangFormModal from '../../features/barang/BarangFormModal.jsx';
import DeleteBarangModal from '../../features/barang/DeleteBarangModal.jsx';

/** Admin: tambah, edit, hapus, dan cari barang. */
export default function AdminBarang() {
  const { items, q, setQ, kategori, setKategori, reload } = useBarang();
  const [editing, setEditing] = useState(null); // null | 'new' | barang
  const [deleting, setDeleting] = useState(null);

  return (
    <>
      <PageHeader
        title="Kelola barang"
        desc="Tambah, ubah, dan hapus inventaris laboratorium."
        action={<button className="btn btn-primary" onClick={() => setEditing('new')}>Tambah barang</button>}
      />

      <BarangToolbar q={q} onQ={setQ} kategori={kategori} onKategori={setKategori} />

      <BarangTable
        items={items}
        canManage
        filtered={Boolean(q || kategori)}
        onEdit={setEditing}
        onDelete={setDeleting}
      />

      {editing && (
        <BarangFormModal
          initial={editing === 'new' ? null : editing}
          onCancel={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }}
        />
      )}
      {deleting && (
        <DeleteBarangModal
          barang={deleting}
          onCancel={() => setDeleting(null)}
          onDeleted={() => { setDeleting(null); reload(); }}
        />
      )}
    </>
  );
}
