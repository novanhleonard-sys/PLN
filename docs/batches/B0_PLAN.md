# B0 PLAN

## Fase A: Scaffold (Satu Agent)
**Pemilik:** Agent Utama
**Direktori:** `/`, `apps/web`, `apps/worker`, `packages/shared`, `supabase`, `content`, `eval`, `scripts`, `docs`
**Tugas:**
1. Setup monorepo pnpm workspaces dengan struktur folder sesuai PRD.
2. Inisialisasi `apps/web` (Vite, React 18, TypeScript, Tailwind, React Router, TanStack Query, Zustand, supabase-js).
3. Buat placeholder route berdasarkan M1.
4. Inisialisasi `apps/worker` (Node, TypeScript, tsx).
5. Konfigurasi `package.json` root untuk skrip (typecheck, lint, test, build, env:check).
6. Setup ESLint, Prettier, Vitest, dan `.gitignore`.

## Fase B: Skema dan RLS (Satu Agent)
**Pemilik:** Agent Utama
**Direktori:** `supabase/migrations`, `supabase/seed.sql`
**Tugas:**
1. Buat file migrasi Supabase sesuai skema PRD 7.1-7.5 (enum, tabel dengan PK, FK, indeks).
2. Tambahkan ekstensi pgvector, fungsi SQL, trigger, dan kebijakan RLS.
3. Konfigurasi kebijakan bucket storage dan publikasi Realtime.
4. Buat `supabase/seed.sql` dengan data draf (app_settings, age_band_rules, style_configs, dll).

## Fase C: Paralel Dua Sub-Agent
**C1. `packages/shared` dan ENV**
**Pemilik:** Sub-agent C1
**Direktori:** `packages/shared/**`, `apps/*/src/env.ts`, `scripts/env-check.*`
**Tugas:**
1. Definisikan enum dan skema zod.
2. Implementasikan konstanta dan fungsi murni beserta tes unit table-driven.
3. Generate tipe DB via `supabase gen types typescript`.
4. Setup `env.ts` (zod) dan dokumentasi `ENV_REQUIRED.md`.

**C2. Tes RLS**
**Pemilik:** Sub-agent C2
**Direktori:** `supabase/tests/**`, `scripts/create-test-users.ts`
**Tugas:**
1. Setup Vitest untuk pengujian RLS Supabase.
2. Buat skrip pembuat akun uji.
3. Tulis dan jalankan 8 skenario tes RLS wajib.

## Fase D: Reviewer read-only
**Pemilik:** Sub-agent Reviewer
**Direktori:** (Hanya membaca)
**Tugas:** Membandingkan hasil dengan PRD dan mencatat penyimpangan di `docs/qa/B0/REVIEW.md`.

## Risiko
- Sinkronisasi tipe database dari Supabase ke `packages/shared` membutuhkan migrasi (Fase B) sudah berhasil diterapkan ke database, sehingga Fase C1 bergantung kuat pada validitas Fase B.
- Menulis dan menguji kebijakan RLS bisa cukup rumit untuk diparalelkan tanpa database lokal jika bergantung sepenuhnya pada cloud, tapi bisa dikelola dengan `supabase db push`.

## Urutan
Fase A -> Fase B -> Fase C (Paralel C1 & C2) -> Fase D -> Laporan & Tag.
