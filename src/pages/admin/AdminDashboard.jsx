import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getStats } from '../../services/api.js';
import { Loading, PageHeader } from '../../components/common/ui.jsx';
import StatLedger from '../../features/dashboard/StatLedger.jsx';
import ActivityFeed from '../../features/dashboard/ActivityFeed.jsx';
import LowStockList from '../../features/dashboard/LowStockList.jsx';
import '../../styles/dashboard.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => { getStats().then(setStats); }, []);

  if (!stats) return <Loading />;

  return (
    <>
      <PageHeader
        title={`Halo, ${user.nama.split(' ')[0]}`}
        desc="Ringkasan inventaris dan seluruh aktivitas laboratorium."
        action={
          <div className="btn-row">
            <Link className="btn btn-ghost" to="/admin/barang">Kelola barang</Link>
            <Link className="btn btn-primary" to="/admin/peminjaman">Catat peminjaman</Link>
          </div>
        }
      />

      <StatLedger stats={stats} lastNote={`${stats.totalTransaksi - stats.transaksiAktif} sudah selesai`} />

      <div className="grid-2">
        <ActivityFeed
          title="Aktivitas seluruh petugas"
          items={stats.aktivitas}
          linkTo="/admin/riwayat"
          emptyText="Peminjaman pertama akan muncul di sini."
        />
        <div className="stack-lg">
          <LowStockList items={stats.stokMenipis} linkTo="/admin/barang" />
          <section className="panel">
            <div className="panel-head">
              <h2>Akun staff</h2>
              <Link to="/admin/pengguna">Kelola pengguna</Link>
            </div>
            <div className="mini-stats">
              <div><strong>{stats.staffAktif}</strong><span>Aktif</span></div>
              <div><strong>{stats.staffNonaktif}</strong><span>Nonaktif</span></div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
