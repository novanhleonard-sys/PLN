# Rencana Batch B2: Pipeline AI

Berdasarkan SPIKE OK, kita akan membangun arsitektur Pipeline AI secara bertahap.

## Fase A: Inti Worker (Agent Utama)
**Deskripsi**: Membangun fondasi infrastruktur *worker* sebelum sub-agent bekerja.
**Direktori yang disentuh**: pps/worker/src/core/, packages/shared/src/, pps/worker/src/providers/
**Langkah**:
1. **Provider Registry**: Membuat antarmuka standar (generateText, generateJSON, dll) lalu mengimplementasikan gemini.ts (Gemini SDK 2026) dan zai.ts (Zhipu AI via fetch/SDK).
2. **Penjaga Anggaran & Pencatatan Biaya**: Membaca i_prices.ts, memeriksa limit harian (AI_DAILY_BUDGET_USD) dan per cerita (AI_STORY_BUDGET_USD), menyimpan log ke i_usage.
3. **Job Runner**: Polling dari tabel jobs menggunakan FOR UPDATE SKIP LOCKED. Mekanisme *retry* (30s, 2m, 10m) dan *idempotency_key*.
4. **Kontrak Stage**: Menetapkan kerangka dasar (ctx, job) => Promise<StageResult> untuk semua tahap (triage, verify, dll).
**Risiko**: Kegagalan koneksi API, perhitungan kuota yang keliru menyebabkan *overbilling*. Dimitigasi dengan pengujian isolasi penjaga anggaran.

---

## Fase B: Tiga Sub-Agent Paralel

Setelah Fase A selesai, Agent Utama akan mendelegasikan pekerjaan spesifik ke 3 Sub-Agent yang berjalan serentak.

### Sub-Agent B1: Verifikator (Triage & Verify)
- **Direktori Milik B1**: pps/worker/src/stages/triage/, pps/worker/src/stages/verify/, pps/worker/src/orchestrator/
- **Fokus**:
  - 	riage: Keputusan lolos/spam/OOT/unsafe menggunakan Z.ai.
  - erify: Fungsi murni D17 (tanpa impor database) mengevaluasi kredibilitas menggunakan Gemini Pro + Grounding.
  - pplyVerdict: Orchestrator (berbasis *pure function* dari shared) untuk memperbarui status cerita.

### Sub-Agent B2: Konten & Gambar (Segmentasi, Karakter, Scene)
- **Direktori Milik B2**: pps/worker/src/stages/segment/, pps/worker/src/stages/character/, pps/worker/src/stages/scene-image/, pps/worker/src/stages/finalize/, packages/shared/src/style_configs.ts
- **Fokus**:
  - segment: Pembagian halaman (6-14) dengan Gemini Flash.
  - scene-image: Perakitan prompt secara deterministik (Aturan gaya + Deskripsi Scene + Deskriptor Tokoh). Menggunakan Gemini Image. Image processing dengan sharp (1024px & 400px WebP) sebelum diunggah ke story-media.
  
### Sub-Agent B3: Audio (Text-to-Speech)
- **Direktori Milik B3**: pps/worker/src/stages/audio/, packages/shared/src/voice_personas.ts, content/pronunciation.json
- **Fokus**:
  - Penentuan persona berdasar asal tradisi versi terverifikasi.
  - Pemanggilan Gemini TTS (gemini-3.8-flash-tts).
  - Pemrosesan keluaran audio melalui fmpeg lokal menjadi format **Opus 32kbps mono**.
  - Unggah ke Supabase Storage story-media.

---

## Fase C & D: Seed & Review (Agent Utama / Reviewer)
- **C**: Menjalankan pipeline pada 3 cerita *seed* (seed:import & pipeline:smoke).
- **D**: Sub-Agent Reviewer Read-only memverifikasi aturan D17, batas batas PRD, idempotensi, dan limit biaya.

Menunggu persetujuan (SETUJU) sebelum mengeksekusi **Fase A**.
