# B0. Kontrak

Tujuan: membekukan fondasi yang dipakai semua batch: struktur repo, skema database, RLS, tipe bersama, validasi ENV. Satu agent utama. Paralel hanya di Fase C.

## Prasyarat

- Node 20+, pnpm, Git, Supabase CLI.
- Docker untuk `supabase start`. Bila tidak ada, gunakan project Supabase cloud dev dan catat di `docs/ASSUMPTIONS.md`.
- Repo git dengan `docs/PLN_PRD_v1.md` dan `AGENTS.md` sudah ada.
- Tidak ada kunci provider AI yang dibutuhkan.

## Referensi PRD

Bagian 3, 4, 7 (seluruhnya), 8.7 (hanya bentuk antarmuka), 9, 12 (Keamanan), 14. Bagian 6 M1 untuk daftar route.

## Kepemilikan

Seluruh repo.

## Fase

### Fase A. Scaffold (satu agent)

- Monorepo pnpm workspaces sesuai PRD 9.2: `apps/web`, `apps/worker`, `packages/shared`, `supabase`, `content`, `eval`, `scripts`, `docs`.
- `apps/web`: Vite, React 18, TypeScript, Tailwind, React Router, TanStack Query, Zustand, supabase-js. Hanya route placeholder untuk semua route di PRD 6 M1. Tidak ada layar.
- `apps/worker`: Node, TypeScript, tsx, kerangka entry kosong.
- Skrip root: `typecheck`, `lint`, `test`, `build`, `env:check`.
- ESLint, Prettier, Vitest. TypeScript strict di semua paket.
- `.gitignore` yang menutup `.env*` (kecuali `.env.example`), `node_modules`, build output.

### Fase B. Skema dan RLS (satu agent)

Migrasi Supabase sesuai PRD 7.1-7.5:

- Semua enum (7.1) dan tabel (7.2) dengan PK, FK, indeks, dan batas unik yang tertulis (mis. `adaptations` unik `(version_id, age_band, prompt_version)`, `pages` unik `(adaptation_id, idx)`, `read_history` unik `(user_id, adaptation_id)`, `jobs.idempotency_key` unik).
- Ekstensi pgvector. Dimensi `corpus_chunks.embedding` dibuat sebagai konstanta yang mudah diganti (default 768) dan dicatat di `ASSUMPTIONS.md`.
- Fungsi SQL: `free_page_limit(adaptation_id)`, `claim_job(kinds text[])` (memakai `FOR UPDATE SKIP LOCKED`, menaikkan `attempts`, set `running`), trigger untuk `story_stats` (reads dan saves).
- RLS sesuai 7.3. `profiles.role` tidak dapat diubah pengguna sendiri. Tabel `verification_runs`, `jobs`, `ai_usage`, `corpus_docs`, `corpus_chunks` hanya admin (baca) dan service role (tulis).
- Bucket storage sesuai 7.5 beserta kebijakan (baca publik untuk `story-media` dan `map-assets`, `corpus` privat).
- Publikasi Realtime untuk `adaptations`, `story_versions`, `page_audio`.
- `supabase/seed.sql`: `app_settings` (7.4), `age_band_rules` (11.3), `style_configs` (satu baris per jenis cerita, deskriptor draf), `voice_personas` (tiga draf), `fallback_backgrounds` (path placeholder). Semua bertanda draf.

### Fase C. Paralel dua sub-agent

**C1. `packages/shared` dan ENV** (memiliki `packages/shared/**`, `apps/*/src/env.ts`, `scripts/env-check.*`)

- Enum, skema zod: payload submission, output triase, verdict (8.3), output segmentasi, output adaptasi, format seed (7.6), pengaturan `app_settings`.
- Konstanta dan fungsi murni: band usia dan pemetaan usia ke band, `freePageLimit(total)`, `tierForZoom(z)` dengan nilai default PRD M2, aturan `applyVerdict` sebagai fungsi murni (input verdict, pengaturan, sensitivity, safety flags; output status). Dengan tes unit table-driven.
- Tipe DB dari `supabase gen types typescript`.
- `env.ts` (zod) per app, `.env.example` per app, `env:check`, dan `docs/ENV_REQUIRED.md` awal (PRD 14).

**C2. Tes RLS** (memiliki `supabase/tests/**`, `scripts/create-test-users.ts`)

- Vitest dengan klien supabase memakai JWT anon, user A, user B, admin. Skrip pembuat akun uji.
- Delapan skenario wajib di bawah.

### Fase D. Reviewer read-only

Bandingkan migrasi dengan PRD 7.1-7.5, tulis penyimpangan di `docs/qa/B0/REVIEW.md`. Agent utama memperbaiki yang valid. Bekukan kontrak dan buat tag `contract-v1`.

## Tes RLS wajib

1. Anon membaca `stories`, `story_versions`, `adaptations` yang terbit: berhasil. Yang `processing` atau `unpublished`: tidak terlihat.
2. Anon membaca `pages` dengan `idx <= free_page_limit`: berhasil. `idx` lebih besar: tidak terlihat. User login: semua halaman terlihat.
3. User A tidak dapat membaca atau mengubah `saved_stories` dan `read_history` milik user B.
4. User tidak dapat mengubah `profiles.role` miliknya.
5. User hanya melihat `submissions` miliknya. Admin melihat semua.
6. `verification_runs`, `jobs`, `ai_usage`, `corpus_docs`, `corpus_chunks` tidak terbaca oleh anon dan user biasa.
7. Anon tidak dapat menulis ke tabel mana pun.
8. `claim_job`: dua pemanggil paralel tidak mengambil job yang sama.

## Larangan

- Tidak ada layar UI selain route placeholder.
- Tidak memanggil provider AI.
- Tidak menambah tabel atau kolom di luar PRD tanpa catatan di `ASSUMPTIONS.md`.

## Gerbang

- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` lulus.
- `supabase db reset` bersih. Semua tes RLS lulus.
- `pnpm env:check` gagal jelas bila ENV kosong dan lulus bila lengkap.
- Kontrak dibekukan: tag `contract-v1`.

## Artefak akhir

`docs/STATE.md` diperbarui, `docs/ENV_REQUIRED.md`, `docs/ASSUMPTIONS.md`, `docs/qa/B0/REVIEW.md`, tag `contract-v1`.
