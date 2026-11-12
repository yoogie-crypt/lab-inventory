import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getStats } from '../../services/api.js';
import { Loading, PageHeader } from '../../components/common/ui.jsx';
import StatLedger from '../../features/dashboard/StatLedger.jsx';
import ActivityFeed from '../../features/dashboard/ActivityFeed.jsx';
import LowStockList from '../../features/dashboard/LowStockList.jsx';
import '../../styles/dashboard.css';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => { getStats({ userId: user.id }).then(setStats); }, [user.id]);

  if (!stats) return <Loading />;

  return (
    <>
      <PageHeader
        title={`Halo, ${user.nama.split(' ')[0]}`}
        desc="Ketersediaan barang dan aktivitas peminjaman yang Anda tangani."
      />

      <StatLedger stats={stats} lastNote={`${stats.transaksiSaya} Anda tangani`} />

      <div className="quick-actions">
        <Link className="quick" to="/staff/peminjaman">
          <strong>Catat peminjaman</strong>
          <span>Barang keluar dari lab</span>
        </Link>
        <Link className="quick" to="/staff/pengembalian">
          <strong>Proses pengembalian</strong>
          <span>{stats.transaksiAktif} peminjaman belum kembali</span>
        </Link>
        <Link className="quick" to="/staff/barang">
          <strong>Cek ketersediaan</strong>
          <span>{stats.tersedia} unit siap dipinjam</span>
        </Link>
      </div>

      <div className="grid-2">
        <ActivityFeed
          title="Aktivitas Anda"
          items={stats.aktivitas}
          linkTo="/staff/riwayat"
          emptyText="Peminjaman dan pengembalian yang Anda catat akan muncul di sini."
        />
        <LowStockList items={stats.stokMenipis} linkTo="/staff/barang" />
      </div>
    </>
  );
}
