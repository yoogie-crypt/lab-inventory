import { AssetTag, Empty, Loading, StockBadge } from '../../components/common/ui.jsx';

/**
 * Tabel barang.
 * canManage = true  -> tampil tombol Edit & Hapus (admin)
 * canManage = false -> hanya baca (staff)
 */
export default function BarangTable({ items, canManage = false, filtered, onEdit, onDelete }) {
  return (
    <section className="panel panel-flush">
      {!items ? <Loading /> : items.length === 0 ? (
        <Empty title="Barang tidak ditemukan">
          {filtered ? 'Coba kata kunci atau kategori lain.' : 'Belum ada barang di inventaris.'}
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
                <th className="num">Dipinjam</th>
                <th>Status</th>
                {canManage && <th className="actions-col"><span className="sr-only">Aksi</span></th>}
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
                  <td className="num">{b.stok - b.tersedia}</td>
                  <td><StockBadge tersedia={b.tersedia} stok={b.stok} /></td>
                  {canManage && (
                    <td className="actions">
                      <button className="btn btn-sm btn-ghost" onClick={() => onEdit(b)}>Edit</button>
                      <button className="btn btn-sm btn-danger-ghost" onClick={() => onDelete(b)}>Hapus</button>
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
  );
}
