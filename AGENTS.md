# AGENTS.md: Peta Legenda Nusantara

Aturan tetap untuk semua sesi. Sumber kebenaran produk: `docs/PLN_PRD_v1.md`. Spesifikasi batch: `docs/batches/`. Keadaan terkini: `docs/STATE.md`.

## Cara kerja repo ini

Satu repo, satu folder, dibuka terus-menerus di Antigravity dari awal sampai akhir proyek. Tidak ada penyalinan folder per batch. Kamu punya akses git dan terminal langsung ke folder ini, dan (setelah terhubung) akses ke database Supabase lewat MCP. Pakai keduanya secara langsung: jalankan git command sendiri, jalankan migrasi Supabase sendiri, jangan minta pengguna mengetik command di terminal lain.

Kerja default di branch `main`. Setelah satu batch dinyatakan selesai (gerbang lulus), buat git tag (`bx-done`) sebagai titik aman untuk rollback. Jangan membuat branch kecuali pengguna secara eksplisit minta paralel.

## Urutan baca di awal sesi

1. File ini.
2. `docs/STATE.md`.
3. Spesifikasi batch yang sedang dikerjakan (`docs/batches/Bx_SPEC.md`).
4. Bagian PRD yang dirujuk spesifikasi itu.
5. Referensi visual di `design/` bila batch menyentuh UI (mungkin belum ada di awal proyek; jika belum ada dan batch membutuhkannya, berhenti dan minta pengguna menambahkannya).

## Protokol sesi

1. **Periksa prasyarat** di spesifikasi batch. Jika ada yang kurang (koneksi Supabase belum aktif, kunci AI belum ada, desain belum ada, batch sebelumnya belum ditandai selesai di STATE.md), berhenti dan daftar yang kurang. Jangan membuat mock, data palsu, atau respons palsu untuk menutupinya. Pengecualian yang diizinkan hanya yang tertulis di spesifikasi batch.
2. **Rencana dulu.** Tulis `docs/batches/Bx_PLAN.md`: fase, sub-agent, direktori milik tiap sub-agent, urutan, risiko. Lalu berhenti dan tunggu balasan `SETUJU`.
3. **Eksekusi** sesuai fase, memakai akses git dan Supabase langsung. Berhenti di setiap titik henti manusia yang tertulis di spesifikasi dan tunggu keputusan.
4. **Gerbang.** Sebelum menyatakan fase atau batch selesai: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` lulus, ditambah pemeriksaan gerbang di spesifikasi. Untuk UI, verifikasi lewat browser dan simpan screenshot di `docs/qa/Bx/`.
5. **Commit** per sub-tugas dengan pesan `bx: ringkasan`, dipush sendiri ke `origin main`. Jangan campur perubahan lintas sub-agent dalam satu commit.
6. **Jangan lanjut ke batch lain** tanpa instruksi.

## Sub-agent

- Maksimal 3 paralel. Gunakan untuk pekerjaan independen yang dapat diverifikasi. Logika inti yang saling terkait dikerjakan satu agent.
- Setiap sub-agent hanya boleh mengubah direktori miliknya (tertulis di rencana). Jika perlu menyentuh direktori lain, berhenti dan minta lewat agent utama.
- Satu agent reviewer read-only di akhir tiap batch: membandingkan hasil dengan PRD dan spesifikasi, menulis daftar penyimpangan di `docs/qa/Bx/REVIEW.md`. Reviewer tidak mengedit kode. Agent utama memperbaiki penyimpangan yang valid.

## Kontrak beku

`packages/shared/**` dan `supabase/migrations/**` dibekukan setelah tag `contract-v1` (akhir B0). Perubahan hanya lewat usulan tertulis di `docs/CONTRACT_CHANGES.md` (alasan, dampak, migrasi), lalu menunggu `SETUJU`. Migrasi baru selalu file baru, tidak mengedit migrasi lama.

## Database Supabase

- Proyek ini memakai **satu project Supabase cloud** (dev), bukan Supabase lokal. Tidak perlu Docker.
- Migrasi ditulis di `supabase/migrations/`, diterapkan ke project cloud lewat `supabase db push` (agent menjalankannya sendiri lewat terminal, karena `supabase link` sudah dilakukan pengguna sebelum sesi pertama).
- Bila MCP Supabase (Postgres) sudah terhubung, gunakan untuk membaca skema, menjalankan query pemeriksaan, dan memverifikasi RLS langsung, bukan hanya menulis migrasi lalu berharap benar.
- Jangan pernah mencetak connection string atau service role key ke chat, commit, atau screenshot.

## Aturan kode

- TypeScript strict. Ringkas dan pragmatis, seperti pengembang berpengalaman.
- Tanpa komentar per baris. Komentar hanya untuk alasan yang tidak jelas dari kode.
- Nama variabel singkat tapi jelas.
- Tanpa dependensi, error handling, validasi, README, atau fitur yang tidak diminta PRD atau spesifikasi. Batas keamanan di PRD bagian 12 adalah pengecualian dan wajib ada.
- Tanpa emoji di kode, UI, data seed, dan dokumen.
- Ikuti konvensi yang sudah ada di repo.
- Semua panggilan AI berbayar lewat provider registry (PRD 8.7). Komponen UI tidak memanggil provider AI.
- Nama model dan harga: baca dokumentasi resmi saat implementasi. Jangan mengandalkan ingatan.

## Rahasia dan ENV

- Ikuti PRD bagian 14. Rahasia tidak pernah masuk repo, log, screenshot, atau chat.
- Jangan meminta nilai rahasia di chat. Pengguna mengisi `.env.local` sendiri, atau agent membuat file itu sendiri lewat terminal lokal tanpa menampilkan isinya di percakapan.
- Setiap variabel baru langsung dicatat di `docs/ENV_REQUIRED.md` dan `.env.example`.

## Aset visual

Slot yang belum ada ditandai `<!-- [GANTI DENGAN: nama-file.ext, ukuran] -->` (JSX: komentar setara) dan dicatat di `docs/ASSETS_PENDING.md`.

## Ketidakjelasan

Pilih opsi paling sederhana, catat di `docs/ASSUMPTIONS.md`, lanjut. Jangan menambah fitur di luar PRD.

## Perintah khusus dari pengguna

- `SETUJU`: rencana disetujui, lanjut eksekusi.
- `LANJUTKAN`: sesi baru atau konteks penuh. Baca file ini, `docs/STATE.md`, dan spesifikasi batch, lalu lanjutkan dari fase pertama yang belum ditandai selesai. Jangan mengulang fase yang sudah selesai.
- `AKHIRI SESI`: jalankan ritual akhir:
  1. Perbarui `docs/STATE.md` (status fase, kontrak, keputusan, masalah diketahui, langkah berikutnya).
  2. Lengkapi `docs/ENV_REQUIRED.md` (kolom: NAMA, dipakai di, wajib atau opsional, fungsi, cara mendapatkan, contoh format palsu, batch yang memerlukan) dan pastikan semua `.env.example` lengkap. Tampilkan ringkasan tabelnya di chat.
  3. Perbarui `docs/ASSETS_PENDING.md`.
  4. Pastikan gerbang lulus, commit, push, dan buat tag `bx-done` (`contract-v1` untuk B0).
  5. Laporkan: yang selesai, yang belum, penyimpangan dari PRD, keputusan yang menunggu pengguna.
