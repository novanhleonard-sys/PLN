# Rencana Batch B4: Kontribusi, profil, admin, deploy

## Prasyarat
- B3 ter-merge (Sudah).
- Worker B2 dapat dijalankan dan memproses job (Sudah).
- Referensi visual design/screens (Ketiadaan design/screens ditimpa oleh PLN_ANTIGRAVITY_DESIGN_OVERRIDE.md. Kita menggunakan design/DESIGN.md dan brief di docs/PLN_STITCH_PROMPTS.md).
- Satu akun admin (
ovanh.leonard@gmail.com) dan satu pengguna biasa (user@example.com) untuk uji (Telah dibuat via skrip).

## Kepemilikan & Struktur Folder
- pps/web/src/features/contribute/**
- pps/web/src/features/profile/**
- pps/web/src/features/admin/**
- supabase/functions/submit_contribution/**
- docs/DEPLOY.md

## Fase-Fase

### Fase A. Edge Function dan Guard (Agent Utama)
1. Membuat Edge Function submit_contribution:
   - Validasi session Supabase Auth.
   - Pengecekan limit kontribusi per hari via Supabase.
   - Skema Zod (dari packages/shared) untuk validasi input.
   - Insert ke tabel submissions, buat job triase di jobs.
2. Penambahan RequireAdmin guard untuk rute /admin.
3. Komponen label status kontribusi/verifikasi yang akan dipakai bersama.

### Fase B. Tiga Sub-Agent Paralel
- **B1 (Sub-agent Kontribusi)**: Implementasi Multi-step Form di eatures/contribute, route Kontribusi Saya, dan integrasi Edge Function.
- **B2 (Sub-agent Profil)**: Implementasi Profile Header, Riwayat, dan Tersimpan di eatures/profile.
- **B3 (Sub-agent Admin)**: Implementasi UI /admin/antrean, /admin/konten, dan /admin/pengaturan murni memakai design system. Logika validasi dan fungsi orchestrator.

### Fase C. Deploy (Agent Utama)
1. Menyusun docs/DEPLOY.md dengan analisis komparasi hosting untuk Worker (Fly.io/Render) dan Web (Vercel).
2. Berhenti dan menunggu arahan (titik henti HOST: ...).

### Fase D. Reviewer
Sub-agent memastikan semua fitur sesuai dengan B4_SPEC.md dan PRD M5/M6/M8.

## Catatan
- Rahasia tidak dimasukkan ke dalam repo.
- Tidak menyalin HTML asal-asalan, selalu menggunakan design system Antigravity.
