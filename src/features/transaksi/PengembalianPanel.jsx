import { useCallback, useEffect, useState } from 'react';
import { listTransaksi } from '../../services/api.js';
import ActiveLoanTable from './ActiveLoanTable.jsx';
import PengembalianModal from './PengembalianModal.jsx';

/** Isi lengkap halaman pengembalian (pencarian + tabel + modal). */
export default function PengembalianPanel() {
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');
  const [target, setTarget] = useState(null);

  const load = useCallback(() => listTransaksi({ status: 'Dipinjam', q }).then(setItems), [q]);
  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div className="toolbar">
        <input
          type="search"
          className="search"
          placeholder="Cari peminjam, barang, atau nomor transaksi"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Cari peminjaman aktif"
        />
      </div>

      <ActiveLoanTable items={items} searching={Boolean(q)} onProcess={setTarget} />

      {target && (
        <PengembalianModal
          trx={target}
          onCancel={() => setTarget(null)}
          onDone={() => { setTarget(null); load(); }}
        />
      )}
    </>
  );
}
