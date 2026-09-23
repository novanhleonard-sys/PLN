# B0.5. Design system

Tujuan: mengubah DESIGN.md dari Stitch menjadi token dan komponen dasar yang dipakai semua batch UI, dengan halaman `/styleguide` sebagai bukti.

## Prasyarat

- Batch B0 selesai (tag `contract-v1`).
- `design/DESIGN.md` dan `design/screens/DS-0_styleguide.png` ada. `S02_peta_*.png` disarankan ada.
- Jika tidak ada, berhenti. Jangan mengarang token.

## Referensi PRD

Bagian 10 (10.2 dan 10.3), 12 (Aksesibilitas), 6 M1, M2 (tombol toggle gaya sebagai komponen visual saja), M3 (Sheet dan panel).

## Kepemilikan

`apps/web/src/ui/**`, `apps/web/src/styles/**`, konfigurasi Tailwind, route `/styleguide`. Tidak menyentuh fitur lain.

## Fase

### Fase A. Token (satu agent)

- Baca `design/DESIGN.md`. Terjemahkan ke tema Tailwind: warna (termasuk empat warna jenis cerita), font, radius, bayangan, spasi 8 px.
- Font Fredoka dan Nunito dipasang lewat paket `@fontsource` (self-hosted). Ukuran teks baca 18 px (mobile) dan 20 px (desktop), line-height 1.6.
- CSS dasar: latar krem dengan tekstur kertas halus, utilitas `prefers-reduced-motion`.

### Fase B. Dua sub-agent paralel

**B1. Komponen sederhana** (memiliki `apps/web/src/ui/basic/**`)

Button (primary, secondary, text; ukuran; default, pressed, disabled, loading), Chip (jenis cerita empat warna, tema netral, wilayah), Badge, Card, Input, Stepper (angka), SegmentedControl, ProgressBar, Toast, AvatarButton, MapStyleToggle (visual saja, tanpa logika peta), Icon (pembungkus lucide-react). Tanpa emoji.

**B2. Komponen berlapis** (memiliki `apps/web/src/ui/layers/**`)

- `Sheet`: bottom sheet dengan handle geser (framer-motion), tiga snap 30%, 55%, 92%, tutup dengan Escape dan tombol kembali, jebakan fokus.
- `SidePanel`: lebar 33vw (min 360 px, maks 480 px), dapat dilipat.
- `Modal`: tengah di desktop, berubah menjadi Sheet di mobile.
- `AppShell`: kerangka bar atas dan area konten yang dipakai route placeholder.

### Fase C. `/styleguide` (satu agent)

Halaman yang menampilkan semua komponen dan keadaannya, di mobile dan desktop, meniru susunan `DS-0_styleguide.png`. Route dimuat lazy. Tanpa data dari backend.

### Fase D. Reviewer read-only

Bandingkan `/styleguide` dengan screenshot DS-0 dan S02. Tulis daftar selisih di `docs/qa/B05/REVIEW.md`. Agent utama memperbaiki yang valid.

## Larangan

- Komponen tidak mengimpor lapisan data atau Supabase.
- Tidak membuat layar fitur (peta, kartu cerita, reader).
- Tidak menyalin HTML Stitch mentah. Tulis komponen React dengan props dan state.

## Titik henti manusia

Setelah Fase C: pengguna menyetujui `/styleguide` di 390 px dan 1280 px.

## Gerbang

- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` lulus.
- Pemeriksaan aksesibilitas otomatis (axe lewat browser) pada `/styleguide`: tanpa pelanggaran kontras AA.
- Screenshot 390 px dan 1280 px di `docs/qa/B05/`.
- Tag `b05-done`.
