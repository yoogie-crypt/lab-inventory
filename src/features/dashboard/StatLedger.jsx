function Figure({ value, label, note, tone }) {
  return (
    <div className={`figure${tone ? ` figure-${tone}` : ''}`}>
      <span className="figure-value">{value.toLocaleString('id-ID')}</span>
      <span className="figure-label">{label}</span>
      {note && <span className="figure-note">{note}</span>}
    </div>
  );
}

/** Ringkasan angka stok + bar proporsi tersedia/dipinjam. `lastNote` beda untuk admin & staff. */
export default function StatLedger({ stats, lastNote }) {
  const pct = stats.totalUnit ? Math.round((stats.tersedia / stats.totalUnit) * 100) : 0;
  return (
    <section className="ledger" aria-label="Ringkasan stok">
      <div className="ledger-figures">
        <Figure value={stats.totalUnit} label="Total barang" note={`${stats.jenis} jenis barang`} />
        <Figure value={stats.tersedia} label="Tersedia" tone="ok" note="Siap dipinjam" />
        <Figure value={stats.dipinjam} label="Sedang dipinjam" tone="warn" note={`${stats.transaksiAktif} transaksi aktif`} />
        <Figure value={stats.totalTransaksi} label="Total transaksi" note={lastNote} />
      </div>
      <div className="ledger-bar" role="img" aria-label={`${pct} persen unit tersedia`}>
        <span className="ledger-bar-ok" style={{ width: `${pct}%` }} />
        <span className="ledger-bar-warn" style={{ width: `${100 - pct}%` }} />
      </div>
      <p className="ledger-caption">{pct}% unit ada di lab, {100 - pct}% sedang di tangan peminjam</p>
    </section>
  );
}
