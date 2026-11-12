const dateFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

export function fmtDate(iso) {
  if (!iso) return '-';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return dateFmt.format(new Date(y, m - 1, d));
}

export function relTime(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return 'kemarin';
  if (days < 7) return `${days} hari lalu`;
  return fmtDate(new Date(iso).toISOString());
}

export function lamaHari(fromISO) {
  const [y, m, d] = fromISO.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((now - start) / 86400000));
}

export const initials = (nama = '') =>
  nama.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join('');
