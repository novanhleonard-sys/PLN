# B3. Reader dan Auth UI

Tujuan: membaca dan mendengarkan cerita nyata dari pipeline, dengan login, gerbang halaman gratis, simpan, dan riwayat.

## Prasyarat

- B0.5, B1, B2 ter-merge. Minimal 3 cerita `published` dengan aset siap. Sebaiknya satu multi-versi dan satu dengan audio atau gambar belum lengkap.
- `design/screens/` berisi S05, S06 (dan varian banner adaptasi), S07a, S07b, S09, S10a, S10b.
- Supabase Auth dikonfigurasi: Google OAuth dan email dengan konfirmasi email; redirect URL dev terdaftar.
- Jika kurang: berhenti dan daftar. Tidak ada data cerita palsu.

## Referensi PRD

6 M4 dan M5 (Auth, gerbang), 4, 5 (F4, F5), 7.3 (RLS `pages`, `page_audio`), 8.5, 10, 12 (Performa, Aksesibilitas).

## Kepemilikan

`apps/web/src/features/reader/**`, `apps/web/src/features/auth/**`, `apps/web/src/components/SceneImage.tsx`, wiring tombol Simpan pada `story-card` (perubahan kecil dan terbatas di file itu).

## Fase

### Fase A. Shell dan fondasi (satu agent) lalu tunjukkan hasil

- Route `/baca/:versionId` dengan adaptasi default `asli`.
- Data layer (TanStack Query): `useStoryVersions`, `usePages(adaptationId)`, `usePageAudio`, `useReadHistory`, `useSaved`.
- Pergantian tata letak: landscape (lebar >= 768 dan rasio > 1) dua kolom, selain itu atas-bawah. Navigasi halaman (tombol, panah keyboard, geser), bar progres, prefetch gambar dan audio halaman berikutnya.
- `SceneImage`: menampilkan gambar scene, atau fallback background per jenis cerita (dari `fallback_backgrounds`) dengan teks "Ilustrasi sedang dibuat" bila status belum selesai. Label "Dibuat AI".
- Fondasi auth: session store, guard, `requireLogin(returnTo)`, halaman `/masuk`.

**Berhenti dan tunjukkan reader shell.** Lanjut ke Fase B setelah pengguna mengizinkan.

### Fase B. Tiga sub-agent paralel

**B1. Auth UI** (memiliki `features/auth/**`)

- S10a (daftar) dan S10b (cek email), tab masuk, Google OAuth, email dan password, verifikasi email wajib, checkbox 18+ dan persetujuan wajib.
- S09 modal gerbang (bottom sheet di mobile, modal di desktop) dipakai bersama Simpan, batas baca, dan (nanti) Sesuaikan dan Kontribusi. Setelah login kembali ke URL dan halaman semula.
- Simpan cerita di kartu (toggle `saved_stories`), anonim memicu modal gerbang.

**B2. Mode Baca** (memiliki `features/reader/baca/**`, `features/reader/versions/**`)

- S06: header dengan judul, tombol Sesuaikan (tampil tetapi belum berfungsi, dikerjakan di B5), segmented control Baca | Dongeng. Teks 18 px (mobile) dan 20 px (desktop). Alt text gambar dari deskripsi scene.
- S05 pilih versi: tampil bila cerita punya lebih dari satu versi terbit dan belum ada riwayat. Bila ada riwayat, tawarkan "Lanjutkan versi X halaman N" dan tautan "Pilih versi lain".
- Gerbang: `free_pages = max(1, floor(0.1 * total_pages))` per adaptasi. Halaman di atas batas tidak diambil untuk anonim (RLS). Saat mencapai batas tampilkan modal S09.
- Riwayat: upsert `read_history` saat pindah halaman (debounce 2 detik) dan saat keluar. Hanya untuk pengguna login. Kartu cerita menampilkan "Lanjutkan halaman N" bila ada riwayat.

**B3. Mode Dongeng** (memiliki `features/reader/dongeng/**`)

- S07a: gambar penuh dengan gerak pelan (pan dan zoom ala Ken Burns dan transisi antar halaman, arah deterministik dari id halaman, framer-motion), subtitle dapat disembunyikan, kontrol putar/jeda, sebelumnya/berikutnya, kecepatan 0.8x, 1x, 1.2x. Audio HTMLAudio per halaman, maju otomatis saat selesai, prefetch halaman berikutnya. Mengikuti gerbang yang sama untuk audio.
- S07b: terkunci bila `audio_status != ready` (gembok, pesan "Suara sedang disiapkan", tombol kembali ke mode Baca). Varian dengan tombol "Buat suara" dibuat sebagai komponen tetapi baru diaktifkan di B5.
- `prefers-reduced-motion` mematikan gerak gambar.

### Fase C. Reviewer read-only

Bandingkan dengan S05-S07 dan S09-S10 serta checklist PRD M4 dan M5. Tulis di `docs/qa/B3/REVIEW.md`.

## Larangan

- Tidak ada kontribusi, profil, admin, atau logika Sesuaikan.
- Tidak menyalin HTML Stitch mentah.
- Tidak mencatat riwayat untuk anonim.
- Tidak mengambil halaman di atas batas dari klien untuk anonim.

## Titik henti manusia

Setelah Fase A: pengguna melihat reader shell dan mengizinkan Fase B.

## Gerbang

- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` lulus.
- Tes yang membuktikan anon tidak mendapat `pages` di atas batas (dengan anon key) dan pengguna login mendapat semua.
- Alur F4 dan F5 berjalan di browser: anonim membaca halaman gratis, gerbang muncul, login, kembali ke halaman yang sama. Screenshot 390, 768, dan 1280 px di `docs/qa/B3/`.
- Dongeng memutar audio berurutan dan maju otomatis. Keadaan terkunci dan fallback gambar terbukti dengan cerita yang aset belum lengkap.
- Riwayat ter-upsert dan "Lanjutkan halaman N" tampil.
- Tag `b3-done`.
