# Rencana Eksekusi B5c: Tier Otomatis Harian

## Fase 1: Logika Perhitungan & Persentil (Sub-agent: Backend/Worker)
- Membuat fungsi inti di `apps/worker/src/jobs/tier/calculate.ts`.
- Fungsi ini akan membaca `tier_percentiles`, `tier_min_reads`, dan `score_weights` dari tabel `app_settings`.
- Mengambil seluruh baris dari tabel `story_stats` gabungan `stories` (untuk melihat `tier_locked`).
- Menghitung `score = reads * bobot_baca + saves * bobot_simpan`.
- Memisahkan kumpulan cerita yang memenuhi syarat (`tier_locked === false` dan `reads_count >= tier_min_reads`).
- Mengurutkan cerita berdasarkan skor, lalu membaginya menjadi:
  - Top 5% -> Tier 1
  - Top 5-20% (15%) -> Tier 2
  - Top 20-50% (30%) -> Tier 3
  - Sisanya -> Tier 4
- Melakukan *batch update* nilai `score` dan `tier` kembali ke tabel `story_stats`.

## Fase 2: Penjadwalan & Idempotensi (Sub-agent: Backend/Worker)
- Menambahkan penanda terakhir jalan (`tier_job_last_run`) ke tabel `app_settings`.
- Menyuntikkan sebuah fungsi `setInterval` di dalam perulangan utama `apps/worker/src/index.ts` yang berjalan setiap beberapa menit (atau memakai library `node-cron` internal) untuk mengecek apakah hari ini proses tiering sudah dijalankan. 
- Ini memastikan worker tetap *stateless* tanpa layanan *cron job* eksternal tambahan.

## Fase 3: Skrip Pengujian Data Sintetis
- Menyiapkan sebuah file `apps/worker/src/jobs/tier/test-seed.ts` yang akan menyuntikkan puluhan data kunjungan dan penyimpanan fiktif ke database dev.
- Skrip ini akan digunakan sebagai verifikasi untuk gerbang kelulusan.

## Fase 4: Modifikasi Admin UI (Sub-agent: UI)
- Mengubah tampilan tabel di `apps/web/src/features/admin/AdminKonten.tsx` (atau serupa) agar metrik *score* dan *tier* saat ini muncul pada pratinjau statistik cerita.

## Gerbang Kelulusan
- Algoritma berhasil menghitung ambang batas persentil tanpa error logika.
- Job dapat dijalankan dua kali berturut-turut pada hari yang sama dan akan mengabaikan eksekusi kedua.
- Skor dan Tier bisa dimonitor dari Dashboard Admin.
- Build, lint, typecheck lulus. Tag `b5c-done`.
