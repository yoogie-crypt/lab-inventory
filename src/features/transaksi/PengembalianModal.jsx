import { useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { kembalikanTransaksi, todayISO } from '../../services/api.js';
import Modal from '../../components/common/Modal.jsx';
import { AssetTag, Field, FormError } from '../../components/common/ui.jsx';
import { fmtDate } from '../../utils/format.js';

export default function PengembalianModal({ trx, onCancel, onDone }) {
  const toast = useToast();
  const [tanggal, setTanggal] = useState(todayISO());
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      const t = await kembalikanTransaksi(trx.id, tanggal);
      toast(`${t.kode} selesai. Stok ${t.barangNama} bertambah ${t.jumlah} unit.`);
      onDone();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal
      title={`Pengembalian ${trx.kode}`}
      size="sm"
      onClose={onCancel}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onCancel}>Batal</button>
          <button className="btn btn-primary" onClick={confirm} disabled={busy}>
            {busy ? 'Memproses…' : 'Selesaikan pengembalian'}
          </button>
        </>
      }
    >
      <FormError message={error} />
      <dl className="summary">
        <div><dt>Peminjam</dt><dd>{trx.peminjam}</dd></div>
        <div><dt>Barang</dt><dd><AssetTag kode={trx.barangKode} /> {trx.barangNama}</dd></div>
        <div><dt>Jumlah</dt><dd>{trx.jumlah} unit</dd></div>
        <div><dt>Dipinjam sejak</dt><dd>{fmtDate(trx.tanggalPinjam)}</dd></div>
      </dl>
      <Field label="Tanggal kembali" htmlFor="tglKembali">
        <input id="tglKembali" type="date" value={tanggal} min={trx.tanggalPinjam} max={todayISO()} onChange={(e) => setTanggal(e.target.value)} />
      </Field>
    </Modal>
  );
}
