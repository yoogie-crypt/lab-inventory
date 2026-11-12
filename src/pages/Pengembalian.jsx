import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { kembalikanTransaksi, listTransaksi, todayISO } from '../services/api.js';
import Modal from '../components/Modal.jsx';
import { AssetTag, Empty, Field, FormError, Loading, PageHeader } from '../components/ui.jsx';
import { fmtDate, lamaHari } from '../utils/format.js';

export default function Pengembalian() {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');
  const [target, setTarget] = useState(null);
  const [tanggal, setTanggal] = useState(todayISO());
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => listTransaksi({ status: 'Dipinjam', q }).then(setItems), [q]);
  useEffect(() => { load(); }, [load]);

  const open = (t) => { setTarget(t); setTanggal(todayISO()); setError(''); };

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      const t = await kembalikanTransaksi(target.id, tanggal, user);
      toast(`${t.kode} selesai. Stok ${t.barangNama} bertambah ${t.jumlah} unit.`);
      setTarget(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Pengembalian" desc="Barang yang masih dipinjam. Proses pengembalian untuk menambah stok dan menyelesaikan transaksi." />

      <div className="toolbar">
        <input
          type="search"
          className="search"
          placeholder="Cari peminjam, barang, atau nomor transaksi"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Cari peminjaman aktif"
        />
      </div>

      <section className="panel panel-flush">
        {!items ? <Loading /> : items.length === 0 ? (
          <Empty title={q ? 'Tidak ada yang cocok' : 'Semua barang sudah kembali'}>
            {q ? 'Coba kata kunci lain.' : 'Tidak ada peminjaman yang masih berjalan.'}
          </Empty>
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
                  <th>Lama</th>
                  <th className="actions-col"><span className="sr-only">Aksi</span></th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => {
                  const lama = lamaHari(t.tanggalPinjam);
                  return (
                    <tr key={t.id}>
                      <td className="mono">{t.kode}</td>
                      <td className="strong">{t.peminjam}</td>
                      <td><AssetTag kode={t.barangKode} /> {t.barangNama}</td>
                      <td className="num">{t.jumlah}</td>
                      <td className="nowrap">{fmtDate(t.tanggalPinjam)}</td>
                      <td className={lama > 3 ? 'text-warn' : ''}>{lama === 0 ? 'Hari ini' : `${lama} hari`}</td>
                      <td className="actions">
                        <button className="btn btn-sm btn-primary" onClick={() => open(t)}>Proses pengembalian</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {items && items.length > 0 && <p className="table-foot">{items.length} peminjaman masih berjalan</p>}
      </section>

      {target && (
        <Modal
          title={`Pengembalian ${target.kode}`}
          size="sm"
          onClose={() => setTarget(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setTarget(null)}>Batal</button>
              <button className="btn btn-primary" onClick={confirm} disabled={busy}>
                {busy ? 'Memproses…' : 'Selesaikan pengembalian'}
              </button>
            </>
          }
        >
          <FormError message={error} />
          <dl className="summary">
            <div><dt>Peminjam</dt><dd>{target.peminjam}</dd></div>
            <div><dt>Barang</dt><dd><AssetTag kode={target.barangKode} /> {target.barangNama}</dd></div>
            <div><dt>Jumlah</dt><dd>{target.jumlah} unit</dd></div>
            <div><dt>Dipinjam sejak</dt><dd>{fmtDate(target.tanggalPinjam)}</dd></div>
          </dl>
          <Field label="Tanggal kembali" htmlFor="tglKembali">
            <input id="tglKembali" type="date" value={tanggal} min={target.tanggalPinjam} max={todayISO()} onChange={(e) => setTanggal(e.target.value)} />
          </Field>
        </Modal>
      )}
    </>
  );
}
