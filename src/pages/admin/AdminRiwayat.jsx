import { useEffect, useState } from 'react';
import { listTransaksi, listUsers } from '../../services/api.js';
import { PageHeader } from '../../components/common/ui.jsx';
import TransaksiTable from '../../features/transaksi/TransaksiTable.jsx';
import StatusFilter from '../../features/transaksi/StatusFilter.jsx';

/** Admin: riwayat seluruh peminjaman & pengembalian, bisa difilter per petugas. */
export default function AdminRiwayat() {
  const [items, setItems] = useState(null);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [petugas, setPetugas] = useState('');

  useEffect(() => { listUsers().then(setUsers); }, []);
  useEffect(() => {
    listTransaksi({ q, status, userId: petugas }).then(setItems);
  }, [q, status, petugas]);

  return (
    <>
      <PageHeader title="Riwayat transaksi" desc="Seluruh peminjaman dan pengembalian di laboratorium." />

      <div className="toolbar">
        <input
          type="search"
          className="search"
          placeholder="Cari peminjam, barang, atau nomor transaksi"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Cari transaksi"
        />
        <select value={petugas} onChange={(e) => setPetugas(e.target.value)} aria-label="Filter petugas">
          <option value="">Semua petugas</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.nama}</option>)}
        </select>
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
