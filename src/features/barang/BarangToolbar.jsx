import { KATEGORI } from '../../services/api.js';

export default function BarangToolbar({ q, onQ, kategori, onKategori }) {
  return (
    <div className="toolbar">
      <input
        type="search"
        className="search"
        placeholder="Cari kode, nama, atau kategori"
        value={q}
        onChange={(e) => onQ(e.target.value)}
        aria-label="Cari barang"
      />
      <select value={kategori} onChange={(e) => onKategori(e.target.value)} aria-label="Filter kategori">
        <option value="">Semua kategori</option>
        {KATEGORI.map((k) => <option key={k}>{k}</option>)}
      </select>
    </div>
  );
}
