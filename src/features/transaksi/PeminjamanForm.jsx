import { useEffect, useMemo, useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { createTransaksi, listBarang, todayISO } from '../../services/api.js';
import { AssetTag, Field, FormError } from '../../components/common/ui.jsx';

const initialForm = () => ({ peminjam: '', barangId: '', jumlah: 1, tanggalPinjam: todayISO() });

/** Form catat peminjaman. Dipakai halaman peminjaman admin & staff. */
export default function PeminjamanForm({ onSaved }) {
  const toast = useToast();
  const [barang, setBarang] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadBarang = () => listBarang().then(setBarang);
  useEffect(() => { loadBarang(); }, []);

  const selected = useMemo(() => barang.find((b) => b.id === form.barangId), [barang, form.barangId]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const t = await createTransaksi(form);
      toast(`Peminjaman ${t.kode} disimpan. ${t.jumlah} × ${t.barangNama} keluar dari lab.`);
      setForm(initialForm());
      await loadBarang();
      onSaved?.(t);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel">
      <div className="panel-head"><h2>Catat peminjaman baru</h2></div>
      <form onSubmit={submit} className="stack" noValidate>
        <FormError message={error} />
        <Field label="Nama peminjam" htmlFor="peminjam" hint="Nama mahasiswa, dosen, atau kegiatan.">
          <input id="peminjam" value={form.peminjam} onChange={set('peminjam')} placeholder="Contoh: Ahmad Fauzi (IF5A)" />
        </Field>
        <Field label="Barang" htmlFor="barangId">
          <select id="barangId" value={form.barangId} onChange={(e) => setForm({ ...form, barangId: e.target.value, jumlah: 1 })}>
            <option value="">Pilih barang</option>
            {barang.map((b) => (
              <option key={b.id} value={b.id} disabled={b.tersedia === 0}>
                {b.kode} — {b.nama} ({b.tersedia === 0 ? 'habis' : `tersedia ${b.tersedia}`})
              </option>
            ))}
          </select>
        </Field>
        {selected && (
          <div className="selected-item">
            <AssetTag kode={selected.kode} />
            <span>{selected.nama}</span>
            <span className="muted">{selected.tersedia} dari {selected.stok} unit ada di lab</span>
          </div>
        )}
        <div className="row-2">
          <Field label="Jumlah" htmlFor="jumlah">
            <input id="jumlah" type="number" min={1} max={selected?.tersedia || undefined} value={form.jumlah} onChange={set('jumlah')} />
          </Field>
          <Field label="Tanggal pinjam" htmlFor="tanggalPinjam">
            <input id="tanggalPinjam" type="date" value={form.tanggalPinjam} max={todayISO()} onChange={set('tanggalPinjam')} />
          </Field>
        </div>
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Menyimpan…' : 'Simpan peminjaman'}
        </button>
      </form>
    </section>
  );
}
