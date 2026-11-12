import { PageHeader } from '../../components/common/ui.jsx';
import useBarang from '../../features/barang/useBarang.js';
import BarangToolbar from '../../features/barang/BarangToolbar.jsx';
import BarangTable from '../../features/barang/BarangTable.jsx';

/** Staff: hanya melihat daftar barang dan status ketersediaan (tanpa edit/hapus). */
export default function StaffBarang() {
  const { items, q, setQ, kategori, setKategori } = useBarang();

  return (
    <>
      <PageHeader
        title="Daftar barang"
        desc="Daftar barang dan ketersediaannya saat ini. Perubahan data barang hanya bisa dilakukan admin."
      />
      <BarangToolbar q={q} onQ={setQ} kategori={kategori} onKategori={setKategori} />
      <BarangTable items={items} filtered={Boolean(q || kategori)} />
    </>
  );
}
