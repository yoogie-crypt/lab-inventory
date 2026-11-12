import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listTransaksi } from '../../services/api.js';
import { PageHeader } from '../../components/common/ui.jsx';
import PeminjamanForm from '../../features/transaksi/PeminjamanForm.jsx';
import TransaksiTable from '../../features/transaksi/TransaksiTable.jsx';
import '../../styles/transaksi.css';

/** Admin: catat peminjaman + lihat seluruh transaksi terbaru. */
export default function AdminPeminjaman() {
  const [recent, setRecent] = useState(null);
  const load = useCallback(() => listTransaksi().then((t) => setRecent(t.slice(0, 10))), []);
  useEffect(() => { load(); }, [load]);

  return (
    <>
      <PageHeader title="Peminjaman" desc="Catat barang yang dipinjam. Stok tersedia berkurang otomatis saat transaksi disimpan." />
      <div className="grid-form">
        <PeminjamanForm onSaved={load} />
        <section className="panel panel-flush">
          <div className="panel-head panel-head-pad">
            <h2>Seluruh transaksi terbaru</h2>
            <Link to="/admin/riwayat">Semua transaksi</Link>
          </div>
          <TransaksiTable items={recent} compact emptyTitle="Belum ada transaksi" />
        </section>
      </div>
    </>
  );
}
