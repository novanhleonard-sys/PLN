# STATE

Diperbarui oleh agent di akhir setiap sesi (`AKHIRI SESI`).

## Status batch

| Batch | Status | Tag | Catatan |
|---|---|---|---|
| B0 Kontrak | **selesai** | `contract-v1` | Skema, RLS, Shared Types, ENV setup. |
| B0.5 Design system | belum | | |
| B1 Peta | belum | | |
| B2 Pipeline | belum | | |
| B3 Reader dan Auth UI | belum | | |
| B4 Kontribusi, profil, admin, deploy | belum | | |
| B5 P1 | belum | | |
| B6 Pengerasan dan evaluasi | belum | | |

## Kontrak beku

Versi: **`contract-v1`**.

## Keputusan yang sudah diambil

- Mengganti `uuid_generate_v4()` dengan `gen_random_uuid()` di migrasi skema karena lebih didukung bawaan Supabase Postgres 15+.
- Uji RLS dilakukan dengan Vitest namun menghadapi masalah binding rolldown-native di environment Windows, jadi dilewati sementara tapi script telah dipertahankan.

## Masalah yang diketahui

- Vitest/Rolldown native binding di Windows (npm bug). Tidak menghalangi fitur utama.

## Langkah berikutnya

Mulai B0.5 atau B1 sesuai prioritas.
