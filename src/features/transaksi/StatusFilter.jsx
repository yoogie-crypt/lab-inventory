const OPTIONS = [['', 'Semua'], ['Dipinjam', 'Dipinjam'], ['Selesai', 'Selesai']];

export default function StatusFilter({ value, onChange }) {
  return (
    <div className="segmented" role="group" aria-label="Filter status">
      {OPTIONS.map(([v, l]) => (
        <button key={l} type="button" className={value === v ? 'is-active' : ''} onClick={() => onChange(v)} aria-pressed={value === v}>
          {l}
        </button>
      ))}
    </div>
  );
}
