import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getStats } from '../services/api.js';
import { AssetTag, Empty, Loading, PageHeader } from '../components/ui.jsx';
import { relTime } from '../utils/format.js';

function Figure({ value, label, note, tone }) {
  return (
    <div className={`figure${tone ? ` figure-${tone}` : ''}`}>
      <span className="figure-value">{value.toLocaleString('id-ID')}</span>
      <span className="figure-label">{label}</span>
      {note && <span className="figure-note">{note}</span>}
    </div>
  );
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [s, setS] = useState(null);

  useEffect(() => {
    getStats({ userId: isAdmin ? '' : user.id }).then(setS);
  }, [isAdmin, user.id]);

  if (!s) return <Loading />;

  const pct = s.totalUnit ? Math.round((s.tersedia / s.totalUnit) * 100) : 0;
  const firstName = user.nama.split(' ')[0];

  return (
    <>
      <PageHeader
        title={`Halo, ${firstName}`}
        desc={isAdmin
          ? 'Ringkasan inventaris dan seluruh aktivitas laboratorium.'
          : 'Ringkasan ketersediaan barang dan aktivitas peminjaman.'}
        action={<Link className="btn btn-primary" to="/peminjaman">Catat peminjaman</Link>}
      />

      <section className="ledger" aria-label="Ringkasan stok">
        <div className="ledger-figures">
          <Figure value={s.totalUnit} label="Total barang" note={`${s.jenis} jenis barang`} />
          <Figure value={s.tersedia} label="Tersedia" tone="ok" note="Siap dipinjam" />
          <Figure value={s.dipinjam} label="Sedang dipinjam" tone="warn" note={`${s.transaksiAktif} transaksi aktif`} />
          <Figure
            value={s.totalTransaksi}
            label="Total transaksi"
            note={isAdmin ? `${s.staffAktif} staff aktif` : `${s.transaksiSaya} Anda tangani`}
          />
        </div>
        <div className="ledger-bar" role="img" aria-label={`${pct} persen unit tersedia`}>
          <span className="ledger-bar-ok" style={{ width: `${pct}%` }} />
          <span className="ledger-bar-warn" style={{ width: `${100 - pct}%` }} />
        </div>
        <p className="ledger-caption">{pct}% unit ada di lab, {100 - pct}% sedang di tangan peminjam</p>
      </section>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head">
            <h2>Aktivitas terbaru</h2>
            <Link to="/riwayat">Lihat riwayat</Link>
          </div>
          {s.aktivitas.length === 0 ? (
            <Empty title="Belum ada aktivitas">Peminjaman pertama akan muncul di sini.</Empty>
          ) : (
            <ul className="feed">
              {s.aktivitas.map((a) => (
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

        <section className="panel">
          <div className="panel-head">
            <h2>Stok menipis</h2>
            <Link to="/barang">Lihat semua barang</Link>
          </div>
          {s.stokMenipis.length === 0 ? (
            <Empty title="Semua stok aman">Tidak ada barang yang hampir habis.</Empty>
          ) : (
            <ul className="low-list">
              {s.stokMenipis.map((b) => (
                <li key={b.id}>
                  <AssetTag kode={b.kode} />
                  <span className="low-name">{b.nama}</span>
                  <span className={`low-count${b.tersedia === 0 ? ' is-zero' : ''}`}>
                    {b.tersedia}/{b.stok}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
