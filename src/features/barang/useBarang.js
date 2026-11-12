import { useCallback, useEffect, useState } from 'react';
import { listBarang } from '../../services/api.js';

/** Mengambil daftar barang sesuai kata kunci & kategori. */
export default function useBarang() {
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');
  const [kategori, setKategori] = useState('');

  const reload = useCallback(() => listBarang({ q, kategori }).then(setItems), [q, kategori]);
  useEffect(() => { reload(); }, [reload]);

  return { items, q, setQ, kategori, setKategori, reload };
}
