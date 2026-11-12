import { AssetTag, Empty, Loading, StatusBadge } from '../../components/common/ui.jsx';
import { fmtDate } from '../../utils/format.js';

/**
 * Tabel transaksi.
 * compact     -> kolom ringkas (untuk halaman peminjaman)
 * showPetugas -> tampilkan kolom petugas pencatat / penerima
 */
export default function TransaksiTable({ items, compact = false, showPetugas = false, emptyTitle, emptyText, footLabel }) {
  if (!items) return <Loading />;
  if (items.length === 0) return <Empty title={emptyTitle || 'Tidak ada transaksi'}>{emptyText}</Empty>;

  return (
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
              {!compact && <th>Tgl kembali</th>}
              <th>Status</th>
              {showPetugas && <th>Petugas</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id}>
                <td className="mono">{t.kode}</td>
                <td className="strong">{t.peminjam}</td>
                <td>{compact ? t.barangNama : <><AssetTag kode={t.barangKode} /> {t.barangNama}</>}</td>
                <td className="num">{t.jumlah}</td>
                <td className="nowrap">{fmtDate(t.tanggalPinjam)}</td>
                {!compact && <td className="nowrap">{fmtDate(t.tanggalKembali)}</td>}
                <td><StatusBadge status={t.status} /></td>
                {showPetugas && (
                  <td className="petugas">
                    <span>Catat: {t.pencatat}</span>
                    {t.pemroses && <span>Terima: {t.pemroses}</span>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footLabel && <p className="table-foot">{footLabel}</p>}
    </>
  );
}
