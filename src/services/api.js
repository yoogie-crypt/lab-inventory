/**
 * Lapisan data: semua halaman memanggil fungsi di file ini.
 * Data disimpan di Supabase dan diakses lewat fungsi RPC (lihat supabase/schema.sql).
 * Setiap pemanggilan mengirim token sesi; hak akses admin/staff diperiksa di database.
 */
import { isConfigured, supabase } from './supabase.js';

const SESSION_KEY = 'labinv.session';
export const SESSION_EXPIRED_EVENT = 'labinv:session-expired';

export const KATEGORI = ['Laptop', 'Monitor', 'Aksesoris', 'Presentasi', 'Jaringan', 'Mikrokontroler', 'Lainnya'];

export const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

/* ---------- Sesi lokal ---------- */
function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}
function writeSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
function expireSession() {
  clearSession();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

/* ---------- Pemanggil RPC ---------- */
function friendlyMessage(error) {
  const msg = error?.message || '';
  if (/failed to fetch|network|load failed/i.test(msg)) {
    return 'Tidak dapat terhubung ke server. Periksa koneksi internet lalu coba lagi.';
  }
  if (/could not find the function/i.test(msg)) {
    return 'Fungsi database belum tersedia. Pastikan supabase/schema.sql sudah dijalankan.';
  }
  return msg || 'Terjadi kesalahan. Coba lagi.';
}

async function rpc(fn, args = {}, { auth = true } = {}) {
  if (!isConfigured) {
    throw new Error('Supabase belum dikonfigurasi: isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.');
  }
  let params = args;
  if (auth) {
    const token = readSession()?.token;
    if (!token) {
      expireSession();
      throw new Error('Sesi berakhir. Silakan masuk lagi.');
    }
    params = { p_token: token, ...args };
  }

  const { data, error } = await supabase.rpc(fn, params);
  if (error) {
    if (error.code === 'LB401') expireSession();
    throw new Error(friendlyMessage(error));
  }
  return data;
}

const toInt = (v) => {
  const n = Number.parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
};
const orNull = (v) => (v === '' || v === undefined ? null : v);

/* ---------- Autentikasi ---------- */
export async function login(username, password) {
  const data = await rpc('login', { p_username: username, p_password: password }, { auth: false });
  writeSession(data);
  return data.user;
}

export function logout() {
  const token = readSession()?.token;
  clearSession();
  if (token && isConfigured) supabase.rpc('logout', { p_token: token }).then(() => {});
}

/** User dari sesi tersimpan (tanpa ke server), dipakai saat aplikasi pertama dibuka. */
export function currentUser() {
  return readSession()?.user ?? null;
}

/** Cek ke server apakah sesi masih berlaku dan perbarui data user. */
export async function verifySession() {
  const user = await rpc('me');
  const s = readSession();
  if (s) writeSession({ ...s, user });
  return user;
}

/* ---------- Barang ---------- */
export function listBarang({ q = '', kategori = '' } = {}) {
  return rpc('list_barang', { p_q: q, p_kategori: kategori });
}

export function createBarang(data) {
  return rpc('create_barang', {
    p_kode: data.kode,
    p_nama: data.nama,
    p_kategori: data.kategori,
    p_stok: toInt(data.stok),
  });
}

export function updateBarang(id, data) {
  return rpc('update_barang', {
    p_id: id,
    p_kode: data.kode,
    p_nama: data.nama,
    p_kategori: data.kategori,
    p_stok: toInt(data.stok),
  });
}

export function deleteBarang(id) {
  return rpc('delete_barang', { p_id: id });
}

/* ---------- Transaksi ---------- */
/** userId: hanya transaksi yang dicatat/diproses pengguna tersebut. */
export function listTransaksi({ status = '', q = '', userId = '' } = {}) {
  return rpc('list_transaksi', { p_status: status, p_q: q, p_user_id: orNull(userId) });
}

export function createTransaksi({ peminjam, barangId, jumlah, tanggalPinjam }) {
  return rpc('create_transaksi', {
    p_peminjam: peminjam,
    p_barang_id: orNull(barangId),
    p_jumlah: toInt(jumlah),
    p_tanggal: orNull(tanggalPinjam),
  });
}

export function kembalikanTransaksi(id, tanggalKembali) {
  return rpc('kembalikan_transaksi', { p_id: id, p_tanggal: orNull(tanggalKembali) });
}

/* ---------- Pengguna (admin) ---------- */
export function listUsers() {
  return rpc('list_users');
}

export function createUser(data) {
  return rpc('create_user', { p_nama: data.nama, p_username: data.username, p_password: data.password });
}

export async function updateUser(id, data) {
  const user = await rpc('update_user', {
    p_id: id,
    p_nama: data.nama,
    p_username: data.username,
    p_password: orNull(data.password),
  });
  const s = readSession();
  if (s?.user?.id === user.id) writeSession({ ...s, user });
  return user;
}

export function setUserAktif(id, aktif) {
  return rpc('set_user_aktif', { p_id: id, p_aktif: aktif });
}

/* ---------- Dashboard ---------- */
export function getStats({ userId = '' } = {}) {
  return rpc('get_stats', { p_user_id: orNull(userId) });
}
