import { PageHeader } from '../../components/common/ui.jsx';
import PengembalianPanel from '../../features/transaksi/PengembalianPanel.jsx';

export default function AdminPengembalian() {
  return (
    <>
      <PageHeader
        title="Pengembalian"
        desc="Semua barang yang masih dipinjam. Proses pengembalian untuk menambah stok dan menyelesaikan transaksi."
      />
      <PengembalianPanel />
    </>
  );
}
