# QA & Review Batch 17: Eksekusi & Pemantauan Hasil Tes Gaya AI

## 1. Lingkup Pekerjaan
- Mendaftarkan stage `test_image` dan `test_audio` pada AI Worker (`apps/worker`).
- Mengimplementasikan `testImageStage` (`gemini-3.1-flash-image`) dan `testAudioStage` (`gemini-3.8-flash-tts`).
- Menghubungkan penyimpanan hasil tes ke Supabase Storage pada bucket `admin-assets/test-runs/`.
- Memperbarui antarmuka pengguna di `/admin/gaya-ai` (`AdminGayaAI.tsx`) dengan:
  - Pelacakan langsung status pemrosesan di dalam modal tes (mengantre -> memproses -> selesai/gagal).
  - Pratinjau langsung gambar dan pemutar audio narasi.
  - Panel Riwayat Uji Coba AI yang menampilkan 10 pengujian terakhir beserta status dan aksi hapus.

## 2. Pemeriksaan Gerbang
- [x] `pnpm typecheck`: Lulus (0 error pada seluruh workspace).
- [x] `pnpm --filter web build`: Lulus (0 error, bundling Vite selesai).
- [x] `pnpm test`: Lulus (semua unit test worker passed).
- [x] Skema database: Tidak ada perubahan skema (menggunakan tabel `test_runs` dan `jobs` yang sudah tersedia).
- [x] Keamanan: Mengikuti RLS dan kebijakan storage bucket `admin-assets`.

## 3. Hasil Pengujian & Verifikasi
- Handler `testImageStage` merakit prompt dari instruksi umum `umum_gambar`, aturan spesifik gaya `descriptor`, dan teks adegan pengujian, lalu mengunggah output PNG ke `admin-assets/test-runs/`.
- Handler `testAudioStage` merakit instruksi sistem dari `umum_suara` dan persona suara `style_prompt`, menghasilkan audio via `gemini-3.8-flash-tts`, mengonversi via ffmpeg, lalu mengunggah ke `admin-assets/test-runs/`.
- UI modal tes tidak lagi menutup secara mendadak atau menampilkan toast keliru ("Pantau di tab Konten"). Modal kini menampilkan live progress dan langsung menyajikan media setelah sukses.
- Panel riwayat di bawah form `/admin/gaya-ai` memuat daftar uji coba sebelumnya dengan kontrol pemutar audio / pratinjau gambar dan tombol hapus riwayat.
