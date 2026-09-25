# Rencana Implementasi Pipeline Audio (B2)

Batch ini berfokus pada implementasi pipeline generasi suara otomatis (TTS) pada *worker*, menggantikan *mock* statis yang ada saat ini.

## Prasyarat
- [x] Kunci Gemini API tersedia di `.env.local`.
- [x] Konfigurasi *storage bucket* `audio` sudah terpasang dan RLS-nya dapat ditulis oleh *service role*.
- [x] Node.js dan `ffmpeg` tersedia di lingkungan eksekusi *worker*.

## Fase 1: Penambahan Kapabilitas TTS pada Provider
**Sub-agent Utama**
- **Tujuan**: Menambahkan antarmuka generasi audio ke `GeminiProvider`.
- **Direktori**: `apps/worker/src/providers/`
- **Tugas**:
  1. Menambahkan method `generateAudio(model, text, voiceName)` pada antarmuka `AIProvider` di `registry.ts`.
  2. Mengimplementasikan `generateAudio` di `gemini.ts` dengan memanfaatkan API terbaru Gemini (`@google/genai`) yang mendukung `responseModalities: ["AUDIO"]` beserta opsi *speech_config*.

## Fase 2: Implementasi Logika *Audio Stage*
**Sub-agent Utama**
- **Tujuan**: Memproses antrean *job* audio dan menghubungkan dengan Supabase Storage.
- **Direktori**: `apps/worker/src/stages/audio/`
- **Tugas**:
  1. Menghapus kode *mock* di `index.ts`.
  2. Melakukan proses *fetch* terhadap data `pages`, `adaptations`, `stories`, dan mencocokkan `voice_personas` yang tepat berdasarkan `region_group` dan tipe cerita.
  3. Memanggil `GeminiProvider.generateAudio` dengan parameter teks halaman dan nama suara (*voice name*) dari persona.
  4. Menyimpan *output* base64 sebagai file sementara dan melakukan konversi ke format Opus (`.ogg`) sekitar 32 kbps menggunakan modul bawaan NodeJS (`child_process.exec('ffmpeg ...')`).
  5. Mengunggah file audio `.ogg` ke *bucket* Supabase `audio`.
  6. Melakukan *upsert* ke tabel `page_audio` beserta `duration_ms` (diambil via ffmpeg/ffprobe) dengan status `ready`.
  7. Memperbarui status *job* menjadi sukses dan memastikan penggunaan *idempotency_key* untuk mencegah biaya berulang.

## Fase 3: Pengujian & Validasi
**Sub-agent Utama**
- **Tujuan**: Memastikan hasil AI dapat diputar oleh pengguna.
- **Tugas**:
  1. Menggunakan skrip *trigger* (atau update langsung ke DB) untuk memasukkan *job* tipe `audio` yang sebelumnya tidak terbuat atau tertunda.
  2. Menjalankan *worker* dan memastikan file audio berhasil terunggah ke Supabase Storage.
  3. Melakukan pemeriksaan API REST `page_audio` dan menguji di Frontend untuk memastikan panel detail mendeteksi suara yang ter-generate dan bisa memutarnya dengan lancar.

## Titik Henti
- Setelah membuat `generateAudio` di provider (sebelum menjalankan tes panggilan).
- Setelah selesai implementasi *worker stage* (sebelum mengantrekan banyak halaman untuk di-*generate* secara massal).

---
Balas dengan `SETUJU` jika Anda menyetujui rencana di atas, atau berikan penyesuaian jika ada.
