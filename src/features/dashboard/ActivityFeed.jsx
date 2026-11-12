import { Link } from 'react-router-dom';
import { Empty } from '../../components/common/ui.jsx';
import { relTime } from '../../utils/format.js';

export default function ActivityFeed({ title = 'Aktivitas terbaru', items, linkTo, emptyText }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{title}</h2>
        {linkTo && <Link to={linkTo}>Lihat riwayat</Link>}
      </div>
      {items.length === 0 ? (
        <Empty title="Belum ada aktivitas">{emptyText}</Empty>
      ) : (
        <ul className="feed">
          {items.map((a) => (
            <li key={a.id} className={`feed-item feed-${a.jenis}`}>
              <span className="feed-dot" aria-hidden="true" />
              <div>
                <p>
                  <strong>{a.trx.peminjam}</strong>{' '}
                  {a.jenis === 'pinjam' ? 'meminjam' : 'mengembalikan'}{' '}
                  {a.trx.jumlah} × {a.trx.barangNama}
                </p>
                <small>
                  {a.jenis === 'pinjam' ? 'Dicatat' : 'Diproses'} oleh {a.oleh}, {relTime(a.at)}
                </small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
