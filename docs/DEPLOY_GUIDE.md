# Panduan Deployment Peta Legenda Nusantara

Berdasarkan pilihan, kita menggunakan **Vercel** untuk Web Frontend dan **Render** untuk Backend Worker. Supabase akan menggunakan proyek Cloud Production (bukan lokal).

## 1. Setup Supabase Produksi
1. Buat proyek baru di [Supabase Dashboard](https://supabase.com/dashboard).
2. Dapatkan kredensial produksi: `Project URL`, `Anon Key`, dan `Service Role Key`.
3. Di terminal lokal, *login* ke Supabase CLI dan tautkan proyek:
   ```bash
   supabase login
   supabase link --project-ref <PROJECT_ID_ANDA>
   ```
4. Dorong skema, migrasi, dan data awal ke produksi:
   ```bash
   supabase db push
   ```
5. Deploy Edge Functions (contoh `submit_contribution`):
   ```bash
   supabase functions deploy submit_contribution
   ```
6. Set rahasia (secrets) untuk Edge Function:
   ```bash
   supabase secrets set SUPABASE_URL=https://<PROJECT_ID>.supabase.co
   supabase secrets set SUPABASE_ANON_KEY=<ANON_KEY>
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>
   ```

## 2. Setup Worker di Render
Worker menggunakan Node.js dan membutuhkan `ffmpeg` serta `sharp`.
1. Daftar/Login ke [Render](https://render.com/).
2. Buat layanan baru: **New > Background Worker**.
3. Hubungkan repositori GitHub ini.
4. Pengaturan build:
   - **Environment**: Docker (Render akan mendeteksi `apps/worker/Dockerfile`).
   - Jika Root Directory diminta, biarkan kosong (karena Dockerfile kita mengatur dari *root* monorepo).
5. Tambahkan Environment Variables:
   - `SUPABASE_URL` = (URL Proyek)
   - `SUPABASE_SERVICE_ROLE_KEY` = (Service Role Key)
   - `GEMINI_API_KEY` = (Kunci Gemini)
   - `ZAI_API_KEY` = (Kunci Z.ai / GLM)
   - `AI_DAILY_BUDGET_USD` = `2.0`
   - `AI_STORY_BUDGET_USD` = `0.5`
6. Deploy. Render akan men-*download* dependensi, ffmpeg, lalu menjalankan Worker tanpa batas waktu istirahat.

## 3. Setup Web di Vercel
1. Daftar/Login ke [Vercel](https://vercel.com).
2. Buat proyek baru: **Add New > Project** dan hubungkan repo ini.
3. Vercel akan membaca file `vercel.json` di *root* dan secara otomatis mengonfigurasi framework Vite.
4. Pada bagian **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL` = (URL Proyek)
   - `VITE_SUPABASE_ANON_KEY` = (Anon Key)
5. Klik **Deploy**.

**Selesai!** Aplikasi Anda kini hidup secara publik. 
