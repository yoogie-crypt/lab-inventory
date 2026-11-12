import { useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { KATEGORI, createBarang, updateBarang } from '../../services/api.js';
import Modal from '../../components/common/Modal.jsx';
import { Field, FormError } from '../../components/common/ui.jsx';

const EMPTY = { kode: '', nama: '', kategori: '', stok: '' };

/** initial = null untuk tambah, objek barang untuk edit. */
export default function BarangFormModal({ initial, onCancel, onSaved }) {
  const isEdit = Boolean(initial);
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
