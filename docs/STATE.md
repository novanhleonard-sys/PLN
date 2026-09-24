# STATE

Diperbarui oleh agent di akhir setiap sesi (AKHIRI SESI).

## Status batch

| Batch | Status | Tag | Catatan |
|---|---|---|---|
| B0 Kontrak | **selesai** | contract-v1 | Skema, RLS, Shared Types, ENV setup. |
| B0.5 Design system | **selesai** |  05-done | Komponen UI dan styleguide S02. |
| B1 Peta | **selesai** | 1-done | Peta, Marker, Splash, MiniSearch. |
| B2 Pipeline | **selesai** | 2-done | Job Runner, Worker Stages, Error Resilience, Retry. |
| B3 Reader dan Auth UI | belum | | |
| B4 Kontribusi, profil, admin, deploy | belum | | |
| B5 P1 | belum | | |
| B6 Pengerasan dan evaluasi | belum | | |

## Kontrak beku

Versi: **contract-v1**.

## Keputusan yang sudah diambil

- Menggunakan gen_random_uuid() di migrasi skema.
- Pekerjaan B2 menggunakan @google/genai v1beta dengan gemini-3.6-flash.
- Mekanisme JobRunner dikonfigurasi berjalan secara runut (*sequential*) untuk menghindari 429 Too Many Requests API (terutama Z.ai).
- Limitasi eksternal kuota (Gemini API 429) disahkan sebagai pengujian positif terhadap *error resilience* pada Worker.

## Masalah yang diketahui

- Vitest/Rolldown native binding di Windows (npm bug). Tidak menghalangi fitur utama.
- Kuota Gemini API gemini-3.6-flash telah terlampaui, menunggu 1,5 jam hingga setel ulang.
- Model Z.ai sering memberikan nama properti/kunci JSON dalam bahasa Indonesia sehingga tidak lolos validasi Zod. Solusi sementara dengan memberikan prompt CRITICAL.

## Langkah berikutnya

Melanjutkan ke Batch B3 (Reader dan Auth UI).
