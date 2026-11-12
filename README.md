# Laboratory Inventory & Borrowing Management System

Aplikasi web inventaris dan peminjaman barang laboratorium komputer.
**React 18 + Vite + React Router + Supabase (PostgreSQL).**

## Cara menjalankan

```bash
npm install
npm run dev      # buka http://localhost:5173
npm run build    # hasil build di folder dist/
```

## Akun demo

| Role  | Username | Password | Masuk ke         |
|-------|----------|----------|------------------|
| Admin | admin    | admin123 | /admin/dashboard |
| Staff | staff    | staff123 | /staff/dashboard |

Staff lain: `dimas / staff123` (aktif), `sari / staff123` (nonaktif, untuk menguji login ditolak).

## Halaman per role

| Admin (`/admin/...`)                 | Staff (`/staff/...`)                    |
|--------------------------------------|-----------------------------------------|
| dashboard: semua aktivitas + akun staff | dashboard: aktivitas sendiri + akses cepat |
| barang: tambah, edit, hapus, cari    | barang: hanya lihat dan cari            |
| peminjaman: catat + semua transaksi  | peminjaman: catat + transaksi sendiri   |
| pengembalian                         | pengembalian                            |
| riwayat: semua, filter per petugas   | riwayat: yang dicatat/diproses sendiri  |
| pengguna: tambah, edit, aktif/nonaktif staff | (tidak ada akses)               |

Staff yang membuka alamat `/admin/...` akan melihat halaman "khusus admin", begitu juga sebaliknya.

## Struktur folder

```
supabase/
└── schema.sql               tabel, fungsi RPC, keamanan, data awal
src/
├── main.jsx                 entry point, memuat CSS global
├── App.jsx                  daftar semua route admin & staff
├── routes/
│   ├── RequireRole.jsx      penjaga halaman berdasarkan role
│   └── navigation.js        menu sidebar admin & staff
├── pages/
│   ├── auth/Login.jsx
│   ├── admin/               AdminDashboard, AdminBarang, AdminPeminjaman,
│   │                        AdminPengembalian, AdminRiwayat, AdminPengguna
│   ├── staff/               StaffDashboard, StaffBarang, StaffPeminjaman,
│   │                        StaffPengembalian, StaffRiwayat
│   └── errors/              Forbidden, NotFound
├── features/                potongan fitur yang dipakai admin & staff
│   ├── barang/              tabel, toolbar, form tambah/edit, modal hapus
│   ├── transaksi/           form peminjaman, tabel transaksi, pengembalian
│   ├── dashboard/           ringkasan stok, aktivitas, stok menipis
│   └── pengguna/            tabel & form pengguna
├── components/
│   ├── layout/              AppLayout, Sidebar, Topbar
│   └── common/              Modal, komponen UI kecil (badge, tag, field)
├── context/                 AuthContext (sesi login), ToastContext (notifikasi)
├── services/
│   ├── supabase.js          koneksi Supabase (dari .env)
│   └── api.js               SEMUA akses data (memanggil fungsi RPC)
├── utils/format.js          format tanggal
└── styles/
    ├── base.css             warna, font, reset
    ├── components.css       tombol, form, tabel, badge, modal, toast
    ├── layout.css           sidebar, topbar, area konten
    ├── login.css            halaman login
    ├── dashboard.css        dashboard admin & staff
    └── transaksi.css        halaman peminjaman
```

## Backend: Supabase

### 1. Buat database
1. Daftar di https://supabase.com lalu buat project baru (region Singapore paling dekat).
2. Buka **SQL Editor > New query**, salin seluruh isi `supabase/schema.sql`, klik **Run**.
   Ini membuat tabel, fungsi, keamanan, dan data awal (18 barang, 4 akun, contoh transaksi).

### 2. Hubungkan frontend
1. Di Supabase buka **Project Settings > API** (atau **API Keys**).
2. Salin `.env.example` menjadi `.env`, lalu isi:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=anon key / publishable key
   ```
3. `npm install` lalu `npm run dev`.

### Cara kerja keamanan
- Semua tabel dikunci RLS tanpa policy, jadi browser tidak bisa membaca/menulis tabel langsung.
- Semua akses lewat fungsi RPC di database yang memeriksa token sesi dan role.
  Contoh: staff yang memanggil `delete_barang` akan ditolak oleh database, bukan cuma disembunyikan tombolnya.
- Password disimpan sebagai hash bcrypt.
- Stok dikunci per baris (`for update`) saat peminjaman, sehingga dua petugas yang
  mencatat bersamaan tidak membuat stok minus.
- Sesi berlaku 7 hari. Staff yang dinonaktifkan langsung dikeluarkan.

### Reset data demo
Jalankan ulang `supabase/schema.sql` di SQL Editor (semua data kembali ke kondisi awal).

### Tabel
| Tabel      | Isi                                                  |
|------------|------------------------------------------------------|
| app_users  | akun admin & staff (password ter-hash)               |
| sessions   | token login aktif                                    |
| barang     | kode, nama, kategori, stok, tersedia                 |
| transaksi  | peminjaman & pengembalian, status Dipinjam/Selesai   |

## Deploy

- **Vercel**: import repository, framework preset *Vite*. Di **Settings > Environment
  Variables** tambahkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`, lalu redeploy.
  `vercel.json` sudah mengatur agar refresh di halaman seperti `/admin/barang` tidak 404.
- **Netlify**: build command `npm run build`, publish directory `dist`, tambahkan dua
  environment variable yang sama (`public/_redirects` sudah disiapkan).
