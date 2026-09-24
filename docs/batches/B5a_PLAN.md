# Rencana Batch B5a: Sesuaikan Usia

*Prasyarat visual Stitch (folder `design/screens/`) telah digantikan oleh `PLN_ANTIGRAVITY_DESIGN_OVERRIDE.md` dan `docs/PLN_STITCH_PROMPTS.md`.*

## Deskripsi
Membangun fitur on-demand untuk mengadaptasi teks cerita ke kelompok usia (age band) menggunakan AI, beserta UI modal dan banner di mode baca.

## Fase & Eksekusi

### Fase 1: Backend Edge Function (Agent Utama)
- **Direktori:** `supabase/functions/request_adaptation/`, `packages/shared/`
- **Tugas:** 
  1. Buat fungsi pemetaan `age_to_band` di `shared`. (Usia >= 13 -> `asli`, < 3 -> `3-4`).
  2. Implementasi Edge Function `request_adaptation`: 
     - Validasi sesi auth (wajib login & email terverifikasi).
     - Periksa cache unik `(version_id, age_band, prompt_version)`.
     - Cek dan hitung kuota `adaptations_per_day` hanya untuk adaptasi baru.
     - Insert `adaptations` status `pending`.
     - Enqueue job adaptasi ke tabel `jobs`.

### Fase 2: Worker Stages (Sub-agent: AI-Pipeline)
- **Direktori:** `apps/worker/src/stages/adapt/`, `apps/worker/src/stages/adapt-check/`
- **Tugas:**
  1. `adapt`: Menerima teks asli per halaman, `age_band_rules`, jenis cerita, sensitivity. Memanggil LLM untuk menghasilkan array halaman adaptasi (1:1 jumlahnya dengan scene) dan ringkasan.
  2. Menyimpan hasil `adapt` ke `pages`.
  3. `adapt_check`: Memeriksa kesetiaan cerita hasil adaptasi (nama tokoh, alur inti, moral).
  4. Aturan retry: satu kali retry jika gagal, jika gagal lagi update `adaptations.status = 'failed'`.
- **Risiko:** Model mungkin mengubah jumlah elemen/scene, sehingga validasi Zod ketat 1:1 wajib digunakan.

### Fase 3: UI Frontend & Integrasi (Sub-agent: UI-Dev)
- **Direktori:** `apps/web/src/features/reader/adapt/`, `apps/web/src/features/reader/` (Header & Dongeng)
- **Tugas:**
  1. Komponen Modal "Sesuaikan usia" dengan stepper (2-15 tahun) sesuai brief S08a.
  2. State pemuatan (loading) dengan Realtime ke tabel `adaptations` (S08b).
  3. Banner adaptasi dengan label buatan AI dan "Lihat versi asli" (varian S06).
  4. Modifikasi reader: memuat teks dari tabel `pages` milik adaptasi, tombol lazy "Buat suara" memicu job audio di `dongeng`.
- **Risiko:** Peralihan state Realtime yang cepat bisa membingungkan UI jika tidak ditangani dengan grace period/debounce yang tepat.

## Titik Henti (Human-in-the-Loop)
Sesuai PRD, setelah Fase 2, agent utama wajib menampilkan *contoh output* adaptasi 1 cerita (untuk band 3-4 dan 7-9) agar pengguna dapat menilai kualitas prompt sebelum frontend (Fase 3) difinalisasi.

## Gerbang Kelulusan (Gate)
- Typecheck, lint, test, build lulus.
- Anak usia 5 diubah ke adaptasi band 5-6, jumlah halaman tetap sama, banner S06 tampil.
- Panggilan kedua untuk usia 6 instan tanpa memotong kuota harian.
- Pengguna < 18 atau anonim dicegah sesuai aturan gerbang login.
- Penandaan git tag `b5a-done`.
