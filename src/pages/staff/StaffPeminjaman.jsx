import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { listTransaksi } from '../../services/api.js';
import { PageHeader } from '../../components/common/ui.jsx';
import PeminjamanForm from '../../features/transaksi/PeminjamanForm.jsx';
import TransaksiTable from '../../features/transaksi/TransaksiTable.jsx';
import '../../styles/transaksi.css';

/** Staff: catat peminjaman + lihat transaksi yang ia tangani. */
export default function StaffPeminjaman() {
  const { user } = useAuth();
  const [recent, setRecent] = useState(null);
  const load = useCallback(
    () => listTransaksi({ userId: user.id }).then((t) => setRecent(t.slice(0, 10))),
    [user.id]
  );
  useEffect(() => { load(); }, [load]);

  return (
    <>
      <PageHeader title="Peminjaman" desc="Catat barang yang dipinjam. Stok tersedia berkurang otomatis saat transaksi disimpan." />
      <div className="grid-form">
        <PeminjamanForm onSaved={load} />
        <section className="panel panel-flush">
          <div className="panel-head panel-head-pad">
            <h2>Transaksi yang Anda catat</h2>
            <Link to="/staff/riwayat">Riwayat saya</Link>
          </div>
          <TransaksiTable
            items={recent}
            compact
            emptyTitle="Belum ada transaksi"
            emptyText="Peminjaman yang Anda simpan akan muncul di sini."
          />
        </section>
      </div>
    </>
  );
}
