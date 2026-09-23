# B4. Kontribusi, profil, admin, deploy

Tujuan: siapa pun yang login dapat menyumbang cerita, admin dapat meninjau, pengguna dapat mengelola simpanan dan riwayat, dan sistem berjalan di lingkungan yang di-deploy.

## Prasyarat

- B3 ter-merge (auth, reader, gerbang, riwayat, simpan).
- Worker B2 dapat dijalankan dan memproses job.
- `design/screens/` berisi S11a, S11b, S11c, S12a, S12b, S12c.
- Satu akun admin dan satu akun pengguna biasa untuk uji.
- Jika kurang: berhenti dan daftar.

## Referensi PRD

6 M5, M6, M8, 4, 5 (F7, F8), 7 (submissions, verification_runs, app_settings, jobs), 8.3 (aturan status), 10, 11, 12, 14.

## Kepemilikan

`apps/web/src/features/{contribute,profile,admin}/**`, `supabase/functions/submit_contribution/**`, `docs/DEPLOY.md`, berkas deploy worker dan web. File bersama hanya ditambah baris.

## Fase

### Fase A. Edge Function dan guard (satu agent)

- `submit_contribution`: memeriksa login dan email terverifikasi, kuota (`submissions_per_day`), validasi payload dengan skema zod dari `packages/shared` (teks 150-3.000 kata, minimal satu sumber, `rights_declared`), insert `submissions`, enqueue job triase. Menerima `target_story_id` opsional.
- Guard route admin (`role = admin`) dan komponen label status bersama.

### Fase B. Tiga sub-agent paralel

**B1. Kontribusi** (memiliki `features/contribute/**`)

- Form multi-langkah S12a-S12b: langkah Info (judul, jenis dengan empat kartu, provinsi dan kabupaten/kota dari `regions`, titik lokasi opsional di peta mini, label versi), Teks, Sumber, Hak (dua pernyataan), Tinjau dan kirim. Status draf di memori atau sessionStorage. Banner bila membuka dari kartu cerita ("Menambah versi untuk: ...").
- "Kontribusi saya" dan detail status S11c dan S12c: status (Dikirim, Diperiksa, Perlu tinjauan admin, Diterima, Ditolak), alasan penolakan, timeline, tombol "Kirim ulang" yang mengisi form dari data sebelumnya. Tombol "Kontribusikan" pada kartu cerita membuka form dengan target terisi.

**B2. Profil** (memiliki `features/profile/**`)

- S11a Riwayat ("Lanjutkan membaca", satu baris per story dengan adaptasi terbaru, progres, "Selesai" dan "Baca lagi"), S11b Tersimpan (grid, hapus simpanan), header profil (nama tampilan, Keluar). Tab Kontribusi saya memakai komponen dari B1 lewat route bersama. Tab Preferensi menunggu B5.

**B3. Admin** (memiliki `features/admin/**`)

- `/admin/antrean`: daftar submission (default: Perlu tinjauan). Detail: teks, sumber, hasil triase, hasil verifikator (verdict, confidence, discrepancies, matched sources dengan tautan, safety flags). Aksi: Setujui (dengan opsi "jadikan versi baru untuk story X" bila terdeteksi duplikat), Tolak (alasan wajib), Jalankan ulang verifikasi. Semua lewat aturan status yang sama dengan `applyVerdict` (memanggil fungsi orchestrator, bukan menulis status langsung dari klien tanpa aturan).
- `/admin/konten`: daftar story dan version. Aksi: ubah tier dan kunci tier, ubah koordinat pin, publish atau unpublish version, hapus adaptasi (invalidasi cache), coba ulang job aset yang gagal.
- `/admin/pengaturan`: editor `app_settings` (auto publish, ambang confidence, kuota, anggaran harian, concurrency, ambang tier).
- Dibuat dari design system tanpa desain Stitch. Fungsional dan rapi, tidak perlu ilustratif.

### Fase C. Deploy (satu agent, berhenti untuk pilihan)

1. Tulis `docs/DEPLOY.md`: opsi host worker (Fly.io, Render, Railway, VPS kecil) dan host web (Vercel, Cloudflare Pages), perbandingan singkat (biaya, kemudahan, dukungan ffmpeg, kebutuhan proses panjang), rekomendasi. **Berhenti dan tunggu `HOST: ...`.**
2. Setelah pilihan: Dockerfile worker (Node, ffmpeg, sharp), konfigurasi host, health check, pemetaan ENV per host, langkah membuat project Supabase produksi (`supabase link`, `db push`, deploy Edge Functions, set secrets), konfigurasi web (build, redirect SPA, environment). Kamu yang membuat akun dan menjalankan langkah yang butuh kredensial.

### Fase D. Reviewer read-only

Bandingkan dengan S11-S12 dan checklist PRD M5, M6, M8. Tulis di `docs/qa/B4/REVIEW.md`.

## Larangan

- Klien tidak menulis status submission atau membuat story langsung. Semua lewat Edge Function atau fungsi orchestrator.
- Tidak ada fitur P1 (Sesuaikan, gaya B, tier otomatis, preferensi, hapus akun, laporan, dashboard).
- Tidak menyalin HTML Stitch mentah.
- Rahasia produksi tidak ditulis di repo atau chat.

## Titik henti manusia

1. Fase C: pilihan host (`HOST: ...`).
2. Pembuatan akun dan project host serta Supabase produksi oleh pengguna.

## Gerbang

- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` lulus.
- End-to-end di browser: kirim kontribusi, triase dan verifikasi berjalan, review admin, terbit, tampil di peta dan dapat dibaca. Jalur tolak dan kirim ulang berfungsi. Kuota ditegakkan di server.
- Tes RLS tambahan: pengguna biasa tidak dapat mengakses data admin.
- Lingkungan deploy menjalankan alur yang sama. Worker memproses job di host.
- Tag `b4-done`.
