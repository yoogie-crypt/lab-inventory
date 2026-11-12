import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { KATEGORI, createBarang, deleteBarang, listBarang, updateBarang } from '../services/api.js';
import Modal from '../components/Modal.jsx';
import { AssetTag, Empty, Field, FormError, Loading, PageHeader, StockBadge } from '../components/ui.jsx';

const EMPTY = { kode: '', nama: '', kategori: '', stok: '' };

function BarangForm({ initial, onCancel, onSaved }) {
  const isEdit = Boolean(initial?.id);
  const toast = useToast();
  const [form, setForm] = useState(initial ? { ...initial } : EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const dipinjam = isEdit ? initial.stok - initial.tersedia : 0;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const saved = isEdit ? await updateBarang(initial.id, form) : await createBarang(form);
      toast(isEdit ? `${saved.nama} diperbarui.` : `${saved.nama} ditambahkan.`);
      onSaved();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal
      title={isEdit ? `Edit ${initial.kode}` : 'Tambah barang'}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Batal</button>
          <button type="submit" form="barang-form" className="btn btn-primary" disabled={busy}>
            {busy ? 'Menyimpan…' : isEdit ? 'Simpan perubahan' : 'Tambah barang'}
          </button>
        </>
      }
    >
      <form id="barang-form" onSubmit={submit} className="form-grid" noValidate>
        <FormError message={error} />
        <Field label="Kode barang" htmlFor="kode" hint="Contoh: BR019">
          <input id="kode" value={form.kode} onChange={set('kode')} className="input-mono" maxLength={12} />
        </Field>
        <Field label="Kategori" htmlFor="kategori">
          <select id="kategori" value={form.kategori} onChange={set('kategori')}>
            <option value="">Pilih kategori</option>
            {KATEGORI.map((k) => <option key={k}>{k}</option>)}
          </select>
        </Field>
        <Field label="Nama barang" htmlFor="nama" className="span-2">
          <input id="nama" value={form.nama} onChange={set('nama')} />
        </Field>
        <Field
          label="Jumlah stok"
          htmlFor="stok"
          hint={dipinjam > 0 ? `${dipinjam} unit sedang dipinjam, stok minimal ${dipinjam}.` : 'Total unit yang dimiliki lab.'}
        >
          <input id="stok" type="number" min={dipinjam} value={form.stok} onChange={set('stok')} />
        </Field>
      </form>
    </Modal>
  );
}

export default function Barang() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');
  const [kategori, setKategori] = useState('');
  const [editing, setEditing] = useState(null); // null | {} (baru) | barang
  const [deleting, setDeleting] = useState(null);
  const [delError, setDelError] = useState('');

  const load = useCallback(() => listBarang({ q, kategori }).then(setItems), [q, kategori]);
  useEffect(() => { load(); }, [load]);

  const confirmDelete = async () => {
    try {
      await deleteBarang(deleting.id);
      toast(`${deleting.nama} dihapus.`);
      setDeleting(null);
      load();
    } catch (err) {
      setDelError(err.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Data barang"
        desc={isAdmin ? 'Tambah, ubah, dan hapus inventaris laboratorium.' : 'Daftar barang dan ketersediaannya saat ini.'}
        action={isAdmin && <button className="btn btn-primary" onClick={() => setEditing({})}>Tambah barang</button>}
      />

      <div className="toolbar">
        <input
          type="search"
          className="search"
          placeholder="Cari kode, nama, atau kategori"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Cari barang"
        />
        <select value={kategori} onChange={(e) => setKategori(e.target.value)} aria-label="Filter kategori">
          <option value="">Semua kategori</option>
          {KATEGORI.map((k) => <option key={k}>{k}</option>)}
        </select>
      </div>

      <section className="panel panel-flush">
        {!items ? <Loading /> : items.length === 0 ? (
          <Empty title="Barang tidak ditemukan">
            {q || kategori ? 'Coba kata kunci atau kategori lain.' : 'Tambahkan barang pertama untuk mulai mencatat inventaris.'}
          </Empty>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama barang</th>
                  <th>Kategori</th>
                  <th className="num">Stok</th>
                  <th className="num">Tersedia</th>
                  <th>Status</th>
                  {isAdmin && <th className="actions-col"><span className="sr-only">Aksi</span></th>}
                </tr>
              </thead>
              <tbody>
                {items.map((b) => (
                  <tr key={b.id}>
                    <td><AssetTag kode={b.kode} /></td>
                    <td className="strong">{b.nama}</td>
                    <td>{b.kategori}</td>
                    <td className="num">{b.stok}</td>
                    <td className="num">{b.tersedia}</td>
                    <td><StockBadge tersedia={b.tersedia} stok={b.stok} /></td>
                    {isAdmin && (
                      <td className="actions">
                        <button className="btn btn-sm btn-ghost" onClick={() => setEditing(b)}>Edit</button>
                        <button className="btn btn-sm btn-danger-ghost" onClick={() => { setDelError(''); setDeleting(b); }}>Hapus</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {items && items.length > 0 && <p className="table-foot">{items.length} barang ditampilkan</p>}
      </section>

      {editing && (
        <BarangForm
          initial={editing.id ? editing : null}
          onCancel={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}

      {deleting && (
        <Modal
          title="Hapus barang?"
          size="sm"
          onClose={() => setDeleting(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setDeleting(null)}>Batal</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Hapus barang</button>
            </>
          }
        >
          <FormError message={delError} />
          <p><AssetTag kode={deleting.kode} /> <strong>{deleting.nama}</strong> akan dihapus dari inventaris. Riwayat transaksinya tetap tersimpan.</p>
        </Modal>
      )}
    </>
  );
}
