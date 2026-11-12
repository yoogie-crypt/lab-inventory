-- =====================================================================
-- Laboratory Inventory & Borrowing Management System — Supabase
-- Jalankan SELURUH file ini sekali di: Supabase Dashboard > SQL Editor > New query > Run
--
-- PERINGATAN: bagian 0 menghapus tabel lama. Menjalankan ulang file ini
-- akan MENGEMBALIKAN data ke kondisi awal (berguna untuk reset demo).
--
-- Keamanan:
--   * Semua tabel memakai RLS tanpa policy -> browser TIDAK bisa membaca/menulis tabel langsung.
--   * Semua akses lewat fungsi RPC (security definer) yang memeriksa token sesi & role.
--   * Password disimpan sebagai hash bcrypt (pgcrypto).
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- 0. Bersihkan objek lama (aman dijalankan berulang)
-- ---------------------------------------------------------------------
drop table if exists public.transaksi cascade;
drop table if exists public.sessions cascade;
drop table if exists public.barang cascade;
drop table if exists public.app_users cascade;
drop sequence if exists public.trx_seq;

-- ---------------------------------------------------------------------
-- 1. Tabel
-- ---------------------------------------------------------------------
create table public.app_users (
  id            uuid primary key default gen_random_uuid(),
  nama          text not null,
  username      text not null unique,
  password_hash text not null,
  role          text not null check (role in ('admin', 'staff')),
  aktif         boolean not null default true,
  created_at    timestamptz not null default now()
);

create table public.sessions (
  token      uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days'
);

create table public.barang (
  id         uuid primary key default gen_random_uuid(),
  kode       text not null unique,
  nama       text not null,
  kategori   text not null,
  stok       int  not null check (stok >= 0),
  tersedia   int  not null check (tersedia >= 0 and tersedia <= stok),
  created_at timestamptz not null default now()
);

create sequence public.trx_seq;

create table public.transaksi (
  id              uuid primary key default gen_random_uuid(),
  kode            text not null unique default ('TRX-' || lpad(nextval('public.trx_seq')::text, 4, '0')),
  peminjam        text not null,
  barang_id       uuid references public.barang(id) on delete set null,
  barang_kode     text not null,   -- salinan, agar riwayat tetap ada walau barang dihapus
  barang_nama     text not null,
  jumlah          int  not null check (jumlah > 0),
  tanggal_pinjam  date not null,
  tanggal_kembali date,
  status          text not null default 'Dipinjam' check (status in ('Dipinjam', 'Selesai')),
  dicatat_oleh    uuid references public.app_users(id) on delete set null,
  diproses_oleh   uuid references public.app_users(id) on delete set null,
  created_at      timestamptz not null default now(),
  returned_at     timestamptz
);

create index on public.transaksi (status);
create index on public.transaksi (created_at desc);
create index on public.transaksi (dicatat_oleh);
create index on public.transaksi (diproses_oleh);
create index on public.sessions (user_id);

-- Kunci semua tabel dari akses langsung browser
alter table public.app_users enable row level security;
alter table public.sessions  enable row level security;
alter table public.barang    enable row level security;
alter table public.transaksi enable row level security;
revoke all on public.app_users, public.sessions, public.barang, public.transaksi from anon, authenticated;
revoke all on sequence public.trx_seq from anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. Fungsi bantu internal (tidak bisa dipanggil dari browser)
-- ---------------------------------------------------------------------
create or replace function public._user_json(u public.app_users)
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'id', u.id, 'nama', u.nama, 'username', u.username,
    'role', u.role, 'aktif', u.aktif, 'createdAt', u.created_at
  );
$$;

create or replace function public._barang_json(b public.barang)
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'id', b.id, 'kode', b.kode, 'nama', b.nama, 'kategori', b.kategori,
    'stok', b.stok, 'tersedia', b.tersedia, 'createdAt', b.created_at
  );
$$;

create or replace function public._trx_json(t public.transaksi)
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'id', t.id, 'kode', t.kode, 'peminjam', t.peminjam,
    'barangId', t.barang_id, 'barangKode', t.barang_kode, 'barangNama', t.barang_nama,
    'jumlah', t.jumlah,
    'tanggalPinjam', t.tanggal_pinjam, 'tanggalKembali', t.tanggal_kembali,
    'status', t.status,
    'dicatatOleh', t.dicatat_oleh, 'diprosesOleh', t.diproses_oleh,
    'createdAt', t.created_at, 'returnedAt', t.returned_at,
    'pencatat', coalesce((select a.nama from public.app_users a where a.id = t.dicatat_oleh), '-'),
    'pemroses', (select a.nama from public.app_users a where a.id = t.diproses_oleh)
  );
$$;

-- Memeriksa token sesi; p_role diisi untuk fitur khusus role tertentu.
create or replace function public._auth(p_token uuid, p_role text default null)
returns public.app_users
language plpgsql security definer set search_path = public, extensions as $$
declare
  u public.app_users;
begin
  select a.* into u
  from public.sessions s
  join public.app_users a on a.id = s.user_id
  where s.token = p_token and s.expires_at > now();

  if not found or not u.aktif then
    raise exception using message = 'Sesi berakhir. Silakan masuk lagi.', errcode = 'LB401';
  end if;
  if p_role is not null and u.role <> p_role then
    raise exception using message = 'Akses ditolak: fitur ini khusus ' || p_role || '.', errcode = 'LB403';
  end if;
  return u;
end;
$$;

revoke execute on function public._user_json(public.app_users)   from public, anon, authenticated;
revoke execute on function public._barang_json(public.barang)    from public, anon, authenticated;
revoke execute on function public._trx_json(public.transaksi)    from public, anon, authenticated;
revoke execute on function public._auth(uuid, text)              from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- 3. Autentikasi
-- ---------------------------------------------------------------------
create or replace function public.login(p_username text, p_password text)
returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  u public.app_users;
  t uuid;
begin
  select * into u from public.app_users where username = lower(trim(coalesce(p_username, '')));
  if not found or u.password_hash <> crypt(coalesce(p_password, ''), u.password_hash) then
    raise exception 'Username atau password salah.';
  end if;
  if not u.aktif then
    raise exception 'Akun ini dinonaktifkan. Hubungi admin laboratorium.';
  end if;

  delete from public.sessions where expires_at < now();
  insert into public.sessions (user_id) values (u.id) returning token into t;
  return jsonb_build_object('token', t, 'user', public._user_json(u));
end;
$$;

create or replace function public.logout(p_token uuid)
returns void
language sql security definer set search_path = public as $$
  delete from public.sessions where token = p_token;
$$;

create or replace function public.me(p_token uuid)
returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
begin
  return public._user_json(public._auth(p_token));
end;
$$;

-- ---------------------------------------------------------------------
-- 4. Barang
-- ---------------------------------------------------------------------
create or replace function public.list_barang(p_token uuid, p_q text default '', p_kategori text default '')
returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  q text := trim(coalesce(p_q, ''));
begin
  perform public._auth(p_token);
  return coalesce((
    select jsonb_agg(public._barang_json(b) order by b.kode)
    from public.barang b
    where (coalesce(p_kategori, '') = '' or b.kategori = p_kategori)
      and (q = '' or b.kode ilike '%' || q || '%' or b.nama ilike '%' || q || '%' or b.kategori ilike '%' || q || '%')
  ), '[]'::jsonb);
end;
$$;

create or replace function public.create_barang(
  p_token uuid, p_kode text, p_nama text, p_kategori text, p_stok int)
returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_kode text := upper(trim(coalesce(p_kode, '')));
  v_nama text := trim(coalesce(p_nama, ''));
  b public.barang;
begin
  perform public._auth(p_token, 'admin');
  if v_kode = '' then raise exception 'Kode barang wajib diisi.'; end if;
  if v_nama = '' then raise exception 'Nama barang wajib diisi.'; end if;
  if coalesce(p_kategori, '') = '' then raise exception 'Pilih kategori barang.'; end if;
  if p_stok is null or p_stok < 0 then raise exception 'Stok harus angka 0 atau lebih.'; end if;
  if exists (select 1 from public.barang where kode = v_kode) then
    raise exception 'Kode % sudah dipakai barang lain.', v_kode;
  end if;

  insert into public.barang (kode, nama, kategori, stok, tersedia)
  values (v_kode, v_nama, p_kategori, p_stok, p_stok)
  returning * into b;
  return public._barang_json(b);
end;
$$;

create or replace function public.update_barang(
  p_token uuid, p_id uuid, p_kode text, p_nama text, p_kategori text, p_stok int)
returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_kode text := upper(trim(coalesce(p_kode, '')));
  v_nama text := trim(coalesce(p_nama, ''));
  b public.barang;
  v_dipinjam int;
begin
  perform public._auth(p_token, 'admin');
  select * into b from public.barang where id = p_id for update;
  if not found then raise exception 'Barang tidak ditemukan.'; end if;

  if v_kode = '' then raise exception 'Kode barang wajib diisi.'; end if;
  if v_nama = '' then raise exception 'Nama barang wajib diisi.'; end if;
  if coalesce(p_kategori, '') = '' then raise exception 'Pilih kategori barang.'; end if;
  if p_stok is null or p_stok < 0 then raise exception 'Stok harus angka 0 atau lebih.'; end if;
  if exists (select 1 from public.barang where kode = v_kode and id <> p_id) then
    raise exception 'Kode % sudah dipakai barang lain.', v_kode;
  end if;

  v_dipinjam := b.stok - b.tersedia;
  if p_stok < v_dipinjam then
    raise exception 'Stok tidak boleh kurang dari % unit yang sedang dipinjam.', v_dipinjam;
  end if;

  update public.barang
     set kode = v_kode, nama = v_nama, kategori = p_kategori,
         stok = p_stok, tersedia = p_stok - v_dipinjam
   where id = p_id
  returning * into b;
  return public._barang_json(b);
end;
$$;

create or replace function public.delete_barang(p_token uuid, p_id uuid)
returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public._auth(p_token, 'admin');
  if exists (select 1 from public.transaksi where barang_id = p_id and status = 'Dipinjam') then
    raise exception 'Barang masih dipinjam. Proses pengembalian dulu sebelum menghapus.';
  end if;
  delete from public.barang where id = p_id;
end;
$$;

-- ---------------------------------------------------------------------
-- 5. Transaksi
-- ---------------------------------------------------------------------
-- Admin: semua transaksi. Staff: semua yang masih Dipinjam (untuk pengembalian)
-- + transaksi yang ia catat atau proses sendiri.
create or replace function public.list_transaksi(
  p_token uuid, p_status text default '', p_q text default '', p_user_id uuid default null)
returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  u public.app_users := public._auth(p_token);
  q text := trim(coalesce(p_q, ''));
begin
  return coalesce((
    select jsonb_agg(public._trx_json(t) order by t.created_at desc)
    from public.transaksi t
    where (coalesce(p_status, '') = '' or t.status = p_status)
      and (p_user_id is null or t.dicatat_oleh = p_user_id or t.diproses_oleh = p_user_id)
      and (u.role = 'admin' or t.status = 'Dipinjam' or t.dicatat_oleh = u.id or t.diproses_oleh = u.id)
      and (q = '' or t.kode ilike '%' || q || '%' or t.peminjam ilike '%' || q || '%'
                  or t.barang_nama ilike '%' || q || '%' or t.barang_kode ilike '%' || q || '%')
  ), '[]'::jsonb);
end;
$$;

create or replace function public.create_transaksi(
  p_token uuid, p_peminjam text, p_barang_id uuid, p_jumlah int, p_tanggal date)
returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  u public.app_users := public._auth(p_token);
  v_nama text := trim(coalesce(p_peminjam, ''));
  b public.barang;
  t public.transaksi;
begin
  if v_nama = '' then raise exception 'Nama peminjam wajib diisi.'; end if;
  if p_barang_id is null then raise exception 'Pilih barang yang dipinjam.'; end if;

  -- kunci baris barang agar dua peminjaman bersamaan tidak membuat stok minus
  select * into b from public.barang where id = p_barang_id for update;
  if not found then raise exception 'Barang tidak ditemukan.'; end if;
  if p_jumlah is null or p_jumlah < 1 then raise exception 'Jumlah minimal 1 unit.'; end if;
  if p_jumlah > b.tersedia then
    raise exception 'Stok % hanya tersedia % unit.', b.nama, b.tersedia;
  end if;
  if p_tanggal is null then raise exception 'Tanggal peminjaman wajib diisi.'; end if;

  update public.barang set tersedia = tersedia - p_jumlah where id = b.id;

  insert into public.transaksi (peminjam, barang_id, barang_kode, barang_nama, jumlah, tanggal_pinjam, dicatat_oleh)
  values (v_nama, b.id, b.kode, b.nama, p_jumlah, p_tanggal, u.id)
  returning * into t;
  return public._trx_json(t);
end;
$$;

create or replace function public.kembalikan_transaksi(p_token uuid, p_id uuid, p_tanggal date)
returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  u public.app_users := public._auth(p_token);
  t public.transaksi;
begin
  select * into t from public.transaksi where id = p_id for update;
  if not found then raise exception 'Transaksi tidak ditemukan.'; end if;
  if t.status <> 'Dipinjam' then raise exception 'Transaksi ini sudah selesai.'; end if;
  if p_tanggal is null then raise exception 'Tanggal pengembalian wajib diisi.'; end if;
  if p_tanggal < t.tanggal_pinjam then
    raise exception 'Tanggal kembali tidak boleh sebelum tanggal pinjam.';
  end if;

  if t.barang_id is not null then
    update public.barang set tersedia = least(stok, tersedia + t.jumlah) where id = t.barang_id;
  end if;

  update public.transaksi
     set status = 'Selesai', tanggal_kembali = p_tanggal,
         diproses_oleh = u.id, returned_at = now()
   where id = p_id
  returning * into t;
  return public._trx_json(t);
end;
$$;

-- ---------------------------------------------------------------------
-- 6. Pengguna (khusus admin)
-- ---------------------------------------------------------------------
create or replace function public.list_users(p_token uuid)
returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public._auth(p_token, 'admin');
  return coalesce((
    select jsonb_agg(public._user_json(a) order by (a.role = 'admin') desc, a.nama)
    from public.app_users a
  ), '[]'::jsonb);
end;
$$;

create or replace function public.create_user(p_token uuid, p_nama text, p_username text, p_password text)
returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_nama text := trim(coalesce(p_nama, ''));
  v_user text := lower(trim(coalesce(p_username, '')));
  a public.app_users;
begin
  perform public._auth(p_token, 'admin');
  if v_nama = '' then raise exception 'Nama lengkap wajib diisi.'; end if;
  if v_user !~ '^[a-z0-9._]{3,20}$' then
    raise exception 'Username 3–20 karakter: huruf kecil, angka, titik, atau garis bawah.';
  end if;
  if exists (select 1 from public.app_users where username = v_user) then
    raise exception 'Username % sudah dipakai.', v_user;
  end if;
  if length(coalesce(p_password, '')) < 6 then raise exception 'Password minimal 6 karakter.'; end if;

  insert into public.app_users (nama, username, password_hash, role)
  values (v_nama, v_user, crypt(p_password, gen_salt('bf')), 'staff')
  returning * into a;
  return public._user_json(a);
end;
$$;

create or replace function public.update_user(
  p_token uuid, p_id uuid, p_nama text, p_username text, p_password text default null)
returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_nama text := trim(coalesce(p_nama, ''));
  v_user text := lower(trim(coalesce(p_username, '')));
  a public.app_users;
begin
  perform public._auth(p_token, 'admin');
  if not exists (select 1 from public.app_users where id = p_id) then
    raise exception 'Pengguna tidak ditemukan.';
  end if;
  if v_nama = '' then raise exception 'Nama lengkap wajib diisi.'; end if;
  if v_user !~ '^[a-z0-9._]{3,20}$' then
    raise exception 'Username 3–20 karakter: huruf kecil, angka, titik, atau garis bawah.';
  end if;
  if exists (select 1 from public.app_users where username = v_user and id <> p_id) then
    raise exception 'Username % sudah dipakai.', v_user;
  end if;
  if coalesce(p_password, '') <> '' and length(p_password) < 6 then
    raise exception 'Password minimal 6 karakter.';
  end if;

  update public.app_users
     set nama = v_nama,
         username = v_user,
         password_hash = case when coalesce(p_password, '') <> ''
                              then crypt(p_password, gen_salt('bf')) else password_hash end
   where id = p_id
  returning * into a;
  return public._user_json(a);
end;
$$;

create or replace function public.set_user_aktif(p_token uuid, p_id uuid, p_aktif boolean)
returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_admin public.app_users := public._auth(p_token, 'admin');
  a public.app_users;
begin
  select * into a from public.app_users where id = p_id;
  if not found then raise exception 'Pengguna tidak ditemukan.'; end if;
  if a.id = v_admin.id then raise exception 'Anda tidak bisa menonaktifkan akun sendiri.'; end if;
  if a.role = 'admin' then raise exception 'Akun admin tidak bisa dinonaktifkan.'; end if;

  update public.app_users set aktif = coalesce(p_aktif, false) where id = p_id returning * into a;
  if not a.aktif then
    delete from public.sessions where user_id = a.id;   -- paksa keluar
  end if;
  return public._user_json(a);
end;
$$;

-- ---------------------------------------------------------------------
-- 7. Dashboard
-- ---------------------------------------------------------------------
-- Staff selalu melihat aktivitasnya sendiri; admin melihat semua (atau satu petugas jika p_user_id diisi).
create or replace function public.get_stats(p_token uuid, p_user_id uuid default null)
returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  u public.app_users := public._auth(p_token);
  v_uid uuid := case when u.role = 'staff' then u.id else p_user_id end;
  v_jenis int; v_total int; v_tersedia int;
  v_trx int; v_aktif int; v_saya int;
  v_staff_aktif int; v_staff_non int;
  v_aktivitas jsonb; v_menipis jsonb;
begin
  select count(*), coalesce(sum(stok), 0), coalesce(sum(tersedia), 0)
    into v_jenis, v_total, v_tersedia
    from public.barang;

  select count(*), count(*) filter (where status = 'Dipinjam'),
         count(*) filter (where v_uid is not null and (dicatat_oleh = v_uid or diproses_oleh = v_uid))
    into v_trx, v_aktif, v_saya
    from public.transaksi;

  select count(*) filter (where aktif), count(*) filter (where not aktif)
    into v_staff_aktif, v_staff_non
    from public.app_users where role = 'staff';

  select coalesce(jsonb_agg(e.obj order by e.ts desc), '[]'::jsonb) into v_aktivitas
  from (
    select x.obj, x.ts from (
      select jsonb_build_object(
               'id', t.id::text || ':p', 'jenis', 'pinjam', 'at', t.created_at,
               'oleh', coalesce(a.nama, '-'), 'trx', public._trx_json(t)) as obj,
             t.created_at as ts
        from public.transaksi t
        left join public.app_users a on a.id = t.dicatat_oleh
       where v_uid is null or t.dicatat_oleh = v_uid
      union all
      select jsonb_build_object(
               'id', t.id::text || ':k', 'jenis', 'kembali', 'at', t.returned_at,
               'oleh', coalesce(a.nama, '-'), 'trx', public._trx_json(t)),
             t.returned_at
        from public.transaksi t
        left join public.app_users a on a.id = t.diproses_oleh
       where t.returned_at is not null and (v_uid is null or t.diproses_oleh = v_uid)
    ) x
    order by x.ts desc
    limit 8
  ) e;

  select coalesce(jsonb_agg(public._barang_json(b) order by b.tersedia, b.kode), '[]'::jsonb) into v_menipis
  from public.barang b
  where b.id in (
    select x.id from public.barang x
     where x.tersedia <= greatest(1, floor(x.stok * 0.3))
     order by x.tersedia, x.kode
     limit 6
  );

  return jsonb_build_object(
    'jenis', v_jenis,
    'totalUnit', v_total,
    'tersedia', v_tersedia,
    'dipinjam', v_total - v_tersedia,
    'totalTransaksi', v_trx,
    'transaksiAktif', v_aktif,
    'transaksiSaya', v_saya,
    'staffAktif', v_staff_aktif,
    'staffNonaktif', v_staff_non,
    'aktivitas', v_aktivitas,
    'stokMenipis', v_menipis
  );
end;
$$;

-- ---------------------------------------------------------------------
-- 8. Data awal
-- ---------------------------------------------------------------------
insert into public.app_users (nama, username, password_hash, role, aktif) values
  ('Administrator Lab', 'admin', crypt('admin123', gen_salt('bf')), 'admin', true),
  ('Rina Wulandari',    'staff', crypt('staff123', gen_salt('bf')), 'staff', true),
  ('Dimas Pratama',     'dimas', crypt('staff123', gen_salt('bf')), 'staff', true),
  ('Sari Anggraini',    'sari',  crypt('staff123', gen_salt('bf')), 'staff', false);

insert into public.barang (kode, nama, kategori, stok, tersedia) values
  ('BR001', 'Laptop Lenovo',            'Laptop',         5,  5),
  ('BR002', 'Mouse Logitech',           'Aksesoris',      10, 10),
  ('BR003', 'Keyboard Mechanical',      'Aksesoris',      8,  8),
  ('BR004', 'Proyektor Epson',          'Presentasi',     3,  3),
  ('BR005', 'Monitor LG',               'Monitor',        6,  6),
  ('BR006', 'Switch TP-Link 24 Port',   'Jaringan',       4,  4),
  ('BR007', 'Router MikroTik hAP',      'Jaringan',       3,  3),
  ('BR008', 'Kabel LAN Cat6 5 m',       'Jaringan',       25, 25),
  ('BR009', 'Access Point Ubiquiti',    'Jaringan',       2,  2),
  ('BR010', 'Laptop ASUS VivoBook',     'Laptop',         4,  4),
  ('BR011', 'Headset Logitech H390',    'Aksesoris',      12, 12),
  ('BR012', 'Webcam Logitech C270',     'Aksesoris',      6,  6),
  ('BR013', 'Laser Pointer Presentasi', 'Presentasi',     5,  5),
  ('BR014', 'Kabel HDMI 3 m',           'Aksesoris',      15, 15),
  ('BR015', 'Raspberry Pi 4',           'Mikrokontroler', 8,  8),
  ('BR016', 'Arduino Uno R3',           'Mikrokontroler', 15, 15),
  ('BR017', 'Monitor Samsung 24 inci',  'Monitor',        4,  4),
  ('BR018', 'Crimping Tool RJ45',       'Jaringan',       6,  6);

-- Contoh transaksi: hp = berapa hari lalu dipinjam, hk = berapa hari lalu kembali (null = masih dipinjam)
insert into public.transaksi
  (peminjam, barang_id, barang_kode, barang_nama, jumlah, tanggal_pinjam, tanggal_kembali,
   status, dicatat_oleh, diproses_oleh, created_at, returned_at)
select v.peminjam, b.id, b.kode, b.nama, v.jumlah,
       current_date - v.hp,
       case when v.hk is null then null else current_date - v.hk end,
       case when v.hk is null then 'Dipinjam' else 'Selesai' end,
       pc.id, pr.id,
       now() - make_interval(days => v.hp, hours => 3),
       case when v.hk is null then null else now() - make_interval(days => v.hk, hours => 1) end
from (values
  ('BR001', 'Ahmad Fauzi (IF5A)',         2, 6, 3,              'staff', 'staff'),
  ('BR004', 'Bu Lestari (Dosen)',         1, 5, 5,              'dimas', 'dimas'),
  ('BR002', 'UKM Robotika',               4, 4, null::int,      'staff', null::text),
  ('BR006', 'Praktikum Jaringan IF3B',    2, 3, 1,              'admin', 'staff'),
  ('BR015', 'Kelompok IoT IF5A',          3, 2, null::int,      'dimas', null::text),
  ('BR009', 'Praktikum Jaringan IF3B',    2, 2, null::int,      'staff', null::text),
  ('BR001', 'Nadia Putri (SI3A)',         1, 1, null::int,      'staff', null::text),
  ('BR004', 'Seminar HIMA Informatika',   1, 0, null::int,      'admin', null::text)
) as v(kode, peminjam, jumlah, hp, hk, pencatat, pemroses)
join public.barang b on b.kode = v.kode
join public.app_users pc on pc.username = v.pencatat
left join public.app_users pr on pr.username = v.pemroses
order by v.hp desc, v.kode;

-- Sesuaikan stok tersedia dengan peminjaman yang masih berjalan
update public.barang b
   set tersedia = b.stok - coalesce((
         select sum(t.jumlah) from public.transaksi t
          where t.barang_id = b.id and t.status = 'Dipinjam'), 0);

-- Muat ulang cache API agar fungsi baru langsung bisa dipanggil
notify pgrst, 'reload schema';
