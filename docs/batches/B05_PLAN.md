# Rencana Batch B0.5: Design System

*Catatan: Rencana ini mengadaptasi `PLN_ANTIGRAVITY_DESIGN_OVERRIDE.md`, menggantikan kewajiban prasyarat desain Stitch dengan pembuatan desain (`DESIGN.md`) oleh Antigravity secara langsung.*

## Fase 0: Perancangan Desain (Agent Utama)
- **Direktori:** `design/`
- **Tugas:** Menulis `design/DESIGN.md` secara mandiri berdasarkan referensi dari `PLN_ANTIGRAVITY_DESIGN_OVERRIDE.md` (token warna, tipografi Fredoka/Nunito, border, spasi 8px, dsb.) dan `docs/PLN_STITCH_PROMPTS.md`.
- **Validasi:** Tidak ada blok kode, murni merancang pedoman desain visual.

## Fase A: Token & CSS Dasar (Agent Utama)
- **Direktori:** `apps/web/tailwind.config.js`, `apps/web/src/index.css`, `apps/web/package.json`
- **Tugas:** 
  - Install dependensi: `@fontsource/fredoka`, `@fontsource/nunito`, `lucide-react`, `framer-motion`, `clsx`, `tailwind-merge` (standar utilitas UI).
  - Menerjemahkan `DESIGN.md` ke dalam konfigurasi Tailwind (colors, radius, shadows, fonts).
  - Menyiapkan variabel CSS dasar di `index.css` (latar krem bertekstur, *prefers-reduced-motion*).

## Fase B: Pengembangan Komponen Dasar & Berlapis (2 Sub-Agent Paralel)

### Sub-Agent B1: Basic Components
- **Direktori:** `apps/web/src/ui/basic/**`
- **Tugas:** Membangun `Button`, `Chip`, `Badge`, `Card`, `Input`, `Stepper`, `SegmentedControl`, `ProgressBar`, `Toast`, `AvatarButton`, `MapStyleToggle`, `Icon`.

### Sub-Agent B2: Layer Components
- **Direktori:** `apps/web/src/ui/layers/**`
- **Tugas:** Membangun `Sheet` (dengan framer-motion, 3 *snap points*), `SidePanel`, `Modal`, `AppShell`.

## Fase C: Halaman Styleguide (Agent Utama)
- **Direktori:** `apps/web/src/routes/styleguide.tsx`, konfigurasi router.
- **Tugas:** Menyusun semua komponen yang dibuat B1 dan B2 menjadi satu halaman etalase (meniru susunan *DS-0*), bersifat responsif (390px dan 1280px). Tanpa koneksi backend.

## Fase D: QA dan Review (Sub-Agent Reviewer)
- **Direktori:** `docs/qa/B05/REVIEW.md`
- **Tugas:** Membandingkan hasil `/styleguide` dengan spesifikasi, PRD, dan `DESIGN.md`. Menyimpan tangkapan layar. Agent Utama memperbaiki temuan yang valid.

## Risiko & Mitigasi
- **Kesulitan Layout Responsif Komponen Layer:** `Sheet` (bottom sheet di mobile) bisa berbenturan perilakunya jika dipaksakan masuk di layout desktop. Mitigasi: Di desktop, `Modal` digunakan, sedangkan `Sheet` khusus *viewport* kecil.
- **Isolasi UI:** Memastikan tidak ada *state* global atau pemanggilan Supabase di dalam komponen presentasional ini. Semua komponen menerima data melalui *props*.
