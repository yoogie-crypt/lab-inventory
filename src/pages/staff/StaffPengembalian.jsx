import { PageHeader } from '../../components/common/ui.jsx';
import PengembalianPanel from '../../features/transaksi/PengembalianPanel.jsx';

export default function StaffPengembalian() {
  return (
    <>
      <PageHeader
        title="Pengembalian"
        desc="Barang yang masih dipinjam. Periksa kondisi barang, lalu proses pengembalian untuk menambah stok."
      />
      <PengembalianPanel />
    </>
  );
}
