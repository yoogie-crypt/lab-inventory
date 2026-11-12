import { useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { deleteBarang } from '../../services/api.js';
import Modal from '../../components/common/Modal.jsx';
import { AssetTag, FormError } from '../../components/common/ui.jsx';

export default function DeleteBarangModal({ barang, onCancel, onDeleted }) {
  const toast = useToast();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await deleteBarang(barang.id);
      toast(`${barang.nama} dihapus.`);
      onDeleted();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Hapus barang?"
      size="sm"
      onClose={onCancel}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onCancel}>Batal</button>
          <button className="btn btn-danger" onClick={confirm} disabled={busy}>Hapus barang</button>
        </>
      }
    >
      <FormError message={error} />
      <p>
        <AssetTag kode={barang.kode} /> <strong>{barang.nama}</strong> akan dihapus dari inventaris.
        Riwayat transaksinya tetap tersimpan.
      </p>
    </Modal>
  );
}
