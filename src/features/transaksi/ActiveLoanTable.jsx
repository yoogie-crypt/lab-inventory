import { AssetTag, Empty, Loading } from '../../components/common/ui.jsx';
import { fmtDate, lamaHari } from '../../utils/format.js';

/** Daftar peminjaman yang belum kembali, dengan tombol proses pengembalian. */
export default function ActiveLoanTable({ items, searching, onProcess }) {
  if (!items) return <section className="panel panel-flush"><Loading /></section>;

  return (
    <section className="panel panel-flush">
      {items.length === 0 ? (
        <Empty title={searching ? 'Tidak ada yang cocok' : 'Semua barang sudah kembali'}>
          {searching ? 'Coba kata kunci lain.' : 'Tidak ada peminjaman yang masih berjalan.'}
        </Empty>
      ) : (
        <>
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
                  <th>Dicatat oleh</th>
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
                      <td className={`nowrap${lama > 3 ? ' text-warn' : ''}`}>{lama === 0 ? 'Hari ini' : `${lama} hari`}</td>
                      <td>{t.pencatat}</td>
                      <td className="actions">
                        <button className="btn btn-sm btn-primary" onClick={() => onProcess(t)}>Proses pengembalian</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="table-foot">{items.length} peminjaman masih berjalan</p>
        </>
      )}
    </section>
  );
}
