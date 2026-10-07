# STATE

Diperbarui oleh agent di akhir setiap sesi (AKHIRI SESI).

## Status batch

| Batch | Status | Tag | Catatan |
|---|---|---|---|
| B0 Kontrak | **selesai** | contract-v1 | Skema, RLS, Shared Types, ENV setup. |
| B0.5 Design system | **selesai** |  05-done | Komponen UI dan styleguide S02. |
| B1 Peta | **selesai** | b1-done | Peta, Marker, Splash, MiniSearch. |
| B2 Pipeline | **selesai** | b2-done | Job Runner, Worker Stages, Error Resilience, Retry. |
| B3 Reader dan Auth UI | **selesai** | b3-done | Auth UI (Google OAuth), Mode Baca, Mode Dongeng. |
| B4 Kontribusi, profil, admin, deploy | **selesai** | b4-done | Form wizard (S12), Profil (S11), Dashboard Admin, Edge Function submit_contribution, Integrasi Komponen B0.5. |
| B5 Kustomisasi Preferensi & AI | **selesai** | b5e-done | Fitur 5a (Sesuaikan usia), 5b (Gaya peta B), 5c (Tier), 5d (Preferensi & Hapus Akun), 5e (Laporan & Dashboard Biaya AI). |
| B6 Pengerasan dan evaluasi | **selesai** | b6-done | QA, Evaluasi (Golden set), PWA, Perbaikan Performa |
| B11 Kelompok Daerah | **selesai** | b11-done | Dynamic region groups untuk gaya AI dan filter (Migrasi dari ENUM). |
| B12 Audit Review | **selesai** | b12-done | Audit penuh & perbaikan guardrail, auth bypass, dan migrasi Gemini. |
| B14 AI Worker Overhaul | **selesai** | b14-done | Audit ulang Worker, perbaikan bug kritis, tracking cost, safety guardrail. |
| B15 Hierarki Daerah | **selesai** | b15-done | Restrukturisasi Kelompok Daerah menjadi 2 tingkat (Besar & Subkelompok), perbaikan UI filter dropdown bertingkat. |

## Kontrak beku

Versi: **contract-v1**.

## Keputusan yang sudah diambil

- Menggunakan gen_random_uuid() di migrasi skema.
- Pekerjaan B2 menggunakan @google/genai v1beta dengan gemini-3.6-flash.
- Mekanisme JobRunner dikonfigurasi berjalan secara runut (*sequential*) untuk menghindari 429 Too Many Requests API (terutama Z.ai).
- Limitasi eksternal kuota (Gemini API 429) disahkan sebagai pengujian positif terhadap *error resilience* pada Worker.
- Otentikasi murni menggunakan OAuth Google. Form Login Email/Password dihapus sesuai PRD B3.
- Menggunakan komponen design system internal murni dari B0.5 (Tailwind), menggantikan layout sementara.
- *Background Worker* di *deploy* ke Koyeb gagal (akuisisi Mistral), pindah ke Render Free Web Service dengan HTTP port *dummy* 8080 (di-*ping* via cron-job.org).
- Adaptasi usia (B5a) menggunakan Worker pipeline. Modal UI tidak menyimpan usia, langsung mengarahkan ke versi adaptasi.

## Masalah yang diketahui

- Vitest/Rolldown native binding di Windows (npm bug). Tidak menghalangi fitur utama.
- Kuota Gemini API gemini-3.6-flash sempat terlampaui, Worker akan melakukan retry otomatis.
- Model Z.ai (fallback) sering merusak struktur JSON, ditangani dengan instruksi eksplisit di pipeline B2.

## Langkah berikutnya

Selesai secara keseluruhan. B6 Pengerasan dan Evaluasi telah rampung. Semua fitur PRD telah selesai diimplementasikan.

**Perbaikan Tambahan (2026-10-07):**
- Memperbaiki bug pada *form* Admin UI Kelompok Daerah di mana kelompok besar secara tidak sengaja ditimpa menjadi subkelompok dari dirinya sendiri karena kesalahan UI. Data yang terkorupsi (Sumatera) telah dipulihkan.
- Memperbaiki pemetaan daerah (Kabupaten -> Subkelompok) di seluruh Indonesia agar 100% sejajar dengan Master Excel, serta menambahkan subkelompok Sumba Timur yang hilang.
- Memperbaiki bug senyap (*silent fail*) pada UI Admin Pustaka Suara yang menyebabkan penyimpanan data gagal tanpa peringatan karena mengirimkan kolom yang sudah dihapus.
- Membuka isian *Voice ID* pada UI Admin Gaya AI (Persona Suara) agar pengguna dapat menyimpan Persona baru (sebelumnya terkunci dan membuat tombol simpan nonaktif).
**B2_EXT (2026-09-25):** Implementasi AI nyata untuk segment, gambar, dan audio berhasil. Worker menghasilkan scenes+pages via `gemini-3.6-flash` (generateJSON), gambar per scene via `gemini-3.1-flash-image` (interactions.create ? WebP di story-media), audio via `gemini-2.5-flash-preview-tts`. 22/22 gambar ready, 22/22 audio ready untuk 3 cerita seed (Kancil, Si Pitung, Rawa Pening).




