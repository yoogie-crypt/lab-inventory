import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { listTransaksi } from '../services/api.js';
import { AssetTag, Empty, Loading, PageHeader, StatusBadge } from '../components/ui.jsx';
import { fmtDate } from '../utils/format.js';

export default function Riwayat() {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    listTransaksi({ q, status, userId: isAdmin ? '' : user.id }).then(setItems);
  }, [q, status, isAdmin, user.id]);

  return (
    <>
      <PageHeader
        title="Riwayat transaksi"
        desc={isAdmin
          ? 'Seluruh peminjaman dan pengembalian di laboratorium.'
          : 'Transaksi yang Anda catat atau proses pengembaliannya.'}
      />

      <div className="toolbar">
        <input
          type="search"
          className="search"
          placeholder="Cari peminjam, barang, atau nomor transaksi"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Cari transaksi"
        />
        <div className="segmented" role="group" aria-label="Filter status">
          {[['', 'Semua'], ['Dipinjam', 'Dipinjam'], ['Selesai', 'Selesai']].map(([v, l]) => (
            <button key={l} type="button" className={status === v ? 'is-active' : ''} onClick={() => setStatus(v)} aria-pressed={status === v}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <section className="panel panel-flush">
        {!items ? <Loading /> : items.length === 0 ? (
          <Empty title="Tidak ada transaksi">Ubah filter atau kata kunci pencarian.</Empty>
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
                  <th>Tgl kembali</th>
                  <th>Status</th>
                  <th>Petugas</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.id}>
                    <td className="mono">{t.kode}</td>
                    <td className="strong">{t.peminjam}</td>
                    <td><AssetTag kode={t.barangKode} /> {t.barangNama}</td>
                    <td className="num">{t.jumlah}</td>
                    <td className="nowrap">{fmtDate(t.tanggalPinjam)}</td>
                    <td className="nowrap">{fmtDate(t.tanggalKembali)}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td className="petugas">
                      <span>Catat: {t.pencatat}</span>
                      {t.pemroses && <span>Terima: {t.pemroses}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {items && items.length > 0 && <p className="table-foot">{items.length} transaksi</p>}
      </section>
    </>
  );
}
