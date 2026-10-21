# Rencana Eksekusi Batch 17 (B17): Eksekusi & Pemantauan Hasil Tes Gaya AI

## Ringkasan Masalah
Saat admin mengeklik "Tes" di `/admin/gaya-ai`, sistem hanya memasukkan data ke tabel `test_runs` dan membuat entri pekerjaan di tabel `jobs` dengan jenis `test_image` atau `test_audio`. Namun:
1. Worker (`apps/worker`) belum mendaftarkan dan belum memiliki handler untuk jenis pekerjaan `test_image` dan `test_audio`. Pekerjaan tersebut tertahan selamanya dalam status `queued`.
2. Antarmuka admin (`apps/web`) belum memiliki komponen atau alur untuk memantau status eksekusi maupun menampilkan hasil generasi gambar/suara dari tabel `test_runs`.
3. Notifikasi toast secara keliru mengarahkan admin ke tab "Konten" yang sebenarnya hanya memuat daftar cerita yang telah terbit.

## Tujuan Batch 17
1. Menyediakan stage handler `test-image` dan `test-audio` di `apps/worker` sehingga pengujian gaya visual dan persona suara diproses nyata oleh AI (Gemini Flash Image & Gemini Flash TTS).
2. Mengunggah hasil gambar/audio ke storage Supabase (`admin-assets/test-runs/`) dan memperbarui status serta URL hasil di tabel `test_runs`.
3. Memperbarui UI `/admin/gaya-ai` agar menampilkan status pemrosesan secara langsung di dalam modal pengujian (live progress) beserta pemutar audio dan penampil gambar hasil tes setelah selesai.
4. Menambahkan panel riwayat uji coba terbaru di halaman `/admin/gaya-ai` agar admin dapat meninjau kembali hasil tes sebelumnya.

## Alokasi Direktori & Sub-Agent
- **Sub-Agent 1 (Worker Stage)**:
  - Direktori: `apps/worker/src/stages/test-run/` dan `apps/worker/src/index.ts`
  - Tugas: Implementasi handler `testImageStage` dan `testAudioStage`, serta mendaftarkannya pada `JobRunner`.
- **Sub-Agent 2 (Frontend Admin UI)**:
  - Direktori: `apps/web/src/features/admin/`
  - Tugas: Live polling & visualizer hasil tes pada modal pengujian, perbaikan toast, dan pembuatan komponen riwayat hasil tes di `AdminGayaAI.tsx`.
- **Reviewer Agent (Read-only)**:
  - Memverifikasi implementasi terhadap PRD dan spesifikasi teknis, mencatat hasil verifikasi di `docs/qa/B17/REVIEW.md`.

## Urutan Fase Pengerjaan

### Fase 1: Implementasi Stage Worker (`apps/worker`)
1. Buat stage `testImageStage` di `apps/worker/src/stages/test-run/image.ts`:
   - Ambil data `test_runs` berdasarkan `job.ref_id`.
   - Gabungkan instruksi umum (`umum_gambar`) + deskriptor gaya (`descriptor` dari snapshot atau `style_configs`) + teks adegan pengujian.
   - Sertakan referensi gambar (bila ada) ke panggilan provider.
   - Panggil `registry.generateImage` (`gemini-3.1-flash-image`).
   - Unggah hasil WebP/PNG ke Supabase Storage `admin-assets/test-runs/`.
   - Update `test_runs` (`status = 'succeeded'`, `result_url`, `error = null`) dan `jobs` (`status = 'succeeded'`).
2. Buat stage `testAudioStage` di `apps/worker/src/stages/test-run/audio.ts`:
   - Ambil data `test_runs` berdasarkan `job.ref_id`.
   - Gabungkan instruksi umum (`umum_suara`) + persona suara (`style_prompt` dari snapshot atau `voice_personas`).
   - Tentukan `voice_name` (default: "Aoede").
   - Panggil `registry.generateAudio` (`gemini-3.8-flash-tts`).
   - Konversi PCM ke Ogg Opus via ffmpeg, unggah ke Supabase Storage `admin-assets/test-runs/`.
   - Update `test_runs` (`status = 'succeeded'`, `result_url`, `error = null`) dan `jobs` (`status = 'succeeded'`).
3. Daftarkan stage `test_image` dan `test_audio` di `apps/worker/src/index.ts`.
4. Jalankan `pnpm --filter worker build` dan `pnpm --filter worker test`.

### Fase 2: Antarmuka Live Tracking & Hasil di Admin UI (`apps/web`)
1. Perbarui Modal Pengujian di `AdminGayaAI.tsx`:
   - Setelah tombol "Kirim ke AI Worker" ditekan, modal tetap terbuka dan beralih ke mode pelacakan aktif (*live polling*).
   - Tampilkan status dinamis:
     - Mengantre (`queued`)
     - Sedang Diproses AI (`running`)
     - Berhasil (`succeeded`): Tampilkan gambar hasil (dengan opsi unduh/buka ukuran penuh) atau pemutar audio langsung.
     - Gagal (`failed`): Tampilkan pesan error dan tombol coba lagi.
2. Tambahkan Panel "Riwayat Uji Coba Terakhir" pada halaman `AdminGayaAI.tsx`:
   - Mengambil 10 pengujian terakhir dari tabel `test_runs`.
   - Menampilkan kartu hasil pengujian lengkap dengan pratinjau gambar, pemutar audio, cuplikan prompt, status, dan tombol hapus riwayat.
3. Hapus pesan toast yang keliru mengarahkan ke tab Konten. Ganti dengan notifikasi kontekstual di halaman Gaya AI.

### Fase 3: Verifikasi, Typecheck, dan QA
1. Jalankan `pnpm typecheck` dan `pnpm lint`.
2. Verifikasi alur pengujian end-to-end.
3. Tulis review di `docs/qa/B17/REVIEW.md`.

## Risiko & Mitigasi
- **Risiko Kuota Gemini API (429 Rate Limit)**:
  - Mitigasi: Handler mengikuti mekanisme standar `JobRunner` dengan retry bertahap (`handleRateLimit`).
- **Risiko Snapshot Data Kosong**:
  - Mitigasi: Jika `config_snapshot` kosong, fallback membaca konfigurasi tersimpan dari `style_configs` atau `voice_personas` via foreign key `style_id` / `voice_id`.
