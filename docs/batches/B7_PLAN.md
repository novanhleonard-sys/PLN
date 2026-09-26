# Rencana Eksekusi B7 (Pusat Admin /admin)

Berdasarkan permintaan dari pengguna, batch ini berfokus pada pembangunan antarmuka terpusat bagi pengelola sistem Peta Legenda Nusantara di `/admin`. Ini mencakup Dasbor metrik, Pengaturan sistem yang terhubung langsung dengan *backend*, serta pengelolaan hak akses Admin.

## Hasil Pemeriksaan Prasyarat
- Proyek berjalan normal dan fitur profil pengguna/pengaturan pembaca (B5) sudah terpisah.
- Modul-modul *admin* saat ini (Antrean, Konten, dll.) sudah ada sebagai rute terpisah namun belum memiliki "rumah" (`/admin`) dan perlindungan akses berlapis yang konsisten.
- Skema data yang dibutuhkan untuk dasbor metrik seperti sesi kunjungan harian dan sesi baca spesifik (durasi) belum ada di database, karena `read_history` saat ini bersifat *upsert* progress (overwrite) tanpa melacak jejak tiap sesi baca, dan belum ada *tracker* anonim untuk sesi kunjungan publik.
- Hak akses *admin* selama ini dikontrol via tabel `profiles.role = 'admin'`, tetapi belum ada mekanisme UI terpusat untuk menambahkan admin baru dengan validasi keamanan.

## Rencana Fase
Akan menggunakan 2 sub-agent (Fase A) paralel, diikuti oleh Fase B untuk penggabungan dan Fase QA.

### Fase A. Dua Sub-Agent Paralel

**Sub-agent P1: Skema Metrik, Keamanan RLS & Edge Function (Fokus Backend)**
- **Skema Metrik**: Membuat file migrasi baru (`20261001000000_b7_admin_metrics.sql`) berisi:
  - `app_sessions`: melacak kunjungan anonim atau login (ID sesi unik di memori klien per *tab*), `start_time`, `last_ping_at` (untuk durasi rata-rata dan pengguna aktif).
  - `read_sessions`: melacak setiap kali pengguna mulai membaca/mendengarkan cerita, dengan durasi baca, *mode* (baca/dongeng), dan status `is_completed`.
  - Melengkapi/mengonfirmasi data tabel `app_settings` (menambahkan *keys* default jika belum ada untuk publikasi, peta, kontrol biaya, fallback, dll.).
- **Keamanan Akses (/admin)**: Mengonfirmasi RLS dan membentengi data analitik agar hanya *role* admin yang dapat melakukan *select*.
- **Edge Function (Kelola Admin)**: Membuat *Supabase Edge Function* (`manage_admin`) yang akan diakses melalui POST request. EF ini memverifikasi bahwa *requester* adalah admin (lewat JWT *auth* yang diverifikasi via Supabase Admin Client), lalu melakukan `UPDATE profiles SET role = 'admin'` untuk *email* target yang sudah terdaftar. Melindungi agar admin tidak menghapus dirinya sendiri atau menghapus satu-satunya admin.

**Sub-agent P2: UI Dashboard, Pengaturan & Kelola (Fokus Frontend)**
- **Layout & Routing**: Mengonsolidasikan semua halaman `/admin/*` di dalam satu `<AdminLayout>` (SidebarLayout) yang secara ketat memeriksa *session* dan `profile.role`. Jika proses cek sedang berlangsung, tampilkan `loading` (jangan *bounce* prematur); jika non-admin, *redirect* ke `/`.
- **Dashboard (/admin/dashboard)**: Menghubungkan visualisasi (tanpa 3rd party tracker) untuk:
  - *Pengunjung*: *query* ke `app_sessions` untuk mendapatkan sesi baru dan pengguna *login* aktif hari ini/7 hari/dll.
  - *Pembacaan*: *query* ke `read_sessions` (durasi aktif, tingkat penyelesaian).
  - *Top Cerita*: gabungan `story_stats` dan filter `read_sessions`.
  - *Biaya AI & Job*: mengambil data `ai_usage` (per tahap) dan `jobs` (dikelompokkan berdasar status), lalu divisualisasikan menggunakan rentang waktu.
  - *Catatan Privasi*: Sesi dikelola murni lewat UUID *ephemeral* di sesi *browser* React (State) yang di-ping setiap ~30s, tanpa cookie, tanpa fingerprinting, sejalan dengan Children's Code.
- **Pengaturan (/admin/pengaturan)**: Membangun form dari `app_settings`. Tiap komponen menyimpan dan memuat *real-time* ke DB, mencantumkan status *"Tersimpan"*, validasi, dan keterangan dampak (langsung/hanya job berikutnya). *Tidak akan menampilkan service role/secrets di UI.*
- **Kelola Admin (/admin/kelola)**: Menampilkan tabel `profiles` di mana `role='admin'`. Sediakan *form* tambah (menggunakan *email*) yang menembak Edge Function P1, serta tombol cabut akses dengan modal konfirmasi dan proteksi "admin terakhir".

### Fase B. Pengujian dan Integrasi Akhir
- *Agent Utama* melakukan tes penuh menggunakan pengguna anonim, pengguna standar, dan admin sungguhan.
- Verifikasi pencatatan *session* di *network tab* bahwa tidak melacak lokasi atau menggunakan pihak ketiga.
- Cocokkan jumlah biaya dari `ai_usage` di Dashboard dengan rekapan sebenarnya di DB.

---

**Risiko & Asumsi:**
- Sistem *ping* (heartbeat) membutuhkan interval tertentu (misal tiap 30 detik) dari UI Klien ke Supabase agar durasi baca dan *active visitors* akurat. Kita berasumsi Supabase API cukup tahan (*resilient*) menangani rentetan *update* ini atau kita akan membuat operasi *debounce* saat *unmount*.
- Tidak ada *Analytics* eksternal (murni DB internal).
- Konfigurasi `app_settings` dibaca *on-the-fly* oleh sistem/worker lainnya (apabila sistem lain saat ini *hardcoded*, maka itu di luar jangkauan task admin, namun admin tetap akan menyimpan di DB).

**Silakan balas dengan kata `SETUJU` jika rencana ini sudah sesuai dengan ekspektasi.**
