import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { listTransaksi } from '../../services/api.js';
import { PageHeader } from '../../components/common/ui.jsx';
import TransaksiTable from '../../features/transaksi/TransaksiTable.jsx';
import StatusFilter from '../../features/transaksi/StatusFilter.jsx';

/** Staff: riwayat transaksi yang ia catat atau proses pengembaliannya. */
export default function StaffRiwayat() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    listTransaksi({ q, status, userId: user.id }).then(setItems);
  }, [q, status, user.id]);

  return (
    <>
      <PageHeader title="Riwayat saya" desc="Transaksi yang Anda catat atau proses pengembaliannya." />

      <div className="toolbar">
        <input
          type="search"
          className="search"
          placeholder="Cari peminjam, barang, atau nomor transaksi"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Cari transaksi"
        />
        <StatusFilter value={status} onChange={setStatus} />
      </div>

      <section className="panel panel-flush">
        <TransaksiTable
          items={items}
          showPetugas
          emptyText="Ubah filter atau kata kunci pencarian."
          footLabel={items ? `${items.length} transaksi` : null}
        />
      </section>
    </>
  );
}
