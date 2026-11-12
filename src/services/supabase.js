import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && key);

if (!isConfigured) {
  console.error('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env');
}

// Login memakai tabel app_users sendiri (lihat supabase/schema.sql),
// jadi fitur auth bawaan Supabase tidak dipakai.
export const supabase = createClient(url || 'http://localhost:54321', key || 'belum-diisi', {
  auth: { persistSession: false, autoRefreshToken: false },
});
