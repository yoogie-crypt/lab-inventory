import { Link } from 'react-router-dom';
import { AssetTag, Empty } from '../../components/common/ui.jsx';

export default function LowStockList({ items, linkTo }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Stok menipis</h2>
        {linkTo && <Link to={linkTo}>Lihat semua barang</Link>}
      </div>
      {items.length === 0 ? (
        <Empty title="Semua stok aman">Tidak ada barang yang hampir habis.</Empty>
      ) : (
        <ul className="low-list">
          {items.map((b) => (
            <li key={b.id}>
              <AssetTag kode={b.kode} />
              <span className="low-name">{b.nama}</span>
              <span className={`low-count${b.tersedia === 0 ? ' is-zero' : ''}`}>{b.tersedia}/{b.stok}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
