import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { createTransaksi, listBarang, listTransaksi, todayISO } from '../services/api.js';
import { AssetTag, Empty, Field, FormError, Loading, PageHeader, StatusBadge } from '../components/ui.jsx';
import { fmtDate } from '../utils/format.js';

const initialForm = () => ({ peminjam: '', barangId: '', jumlah: 1, tanggalPinjam: todayISO() });

export default function Peminjaman() {
  const { user } = useAuth();
  const toast = useToast();
  const [barang, setBarang] = useState([]);
  const [recent, setRecent] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [b, t] = await Promise.all([listBarang(), listTransaksi()]);
    setBarang(b);
    setRecent(t.slice(0, 8));
  }, []);
  useEffect(() => { load(); }, [load]);

  const selected = useMemo(() => barang.find((b) => b.id === form.barangId), [barang, form.barangId]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const t = await createTransaksi(form, user);
      toast(`Peminjaman ${t.kode} disimpan. ${t.jumlah} × ${t.barangNama} keluar dari lab.`);
      setForm(initialForm());
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Peminjaman" desc="Catat barang yang dipinjam. Stok tersedia berkurang otomatis saat transaksi disimpan." />

      <div className="grid-form">
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

        <section className="panel panel-flush">
          <div className="panel-head panel-head-pad">
            <h2>Transaksi terbaru</h2>
            <Link to="/riwayat">Semua transaksi</Link>
          </div>
          {!recent ? <Loading /> : recent.length === 0 ? (
            <Empty title="Belum ada transaksi">Peminjaman yang Anda simpan akan muncul di sini.</Empty>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>No. transaksi</th>
                    <th>Peminjam</th>
                    <th>Barang</th>
                    <th className="num">Jml</th>
                    <th>Tgl pinjam</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((t) => (
                    <tr key={t.id}>
                      <td className="mono">{t.kode}</td>
                      <td className="strong">{t.peminjam}</td>
                      <td>{t.barangNama}</td>
                      <td className="num">{t.jumlah}</td>
                      <td className="nowrap">{fmtDate(t.tanggalPinjam)}</td>
                      <td><StatusBadge status={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
