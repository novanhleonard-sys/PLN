# Rencana Eksekusi B5e (Laporan dan Dashboard Biaya)

## Fase 1: Pembuatan Komponen Pelaporan
- Membuat komponen `ReportButton.tsx` (fitur/report) dengan Modal untuk mengisi alasan.
- Mengintegrasikan `ReportButton` ke dalam:
  - `Baca.tsx` (untuk melaporkan versi atau adaptasi cerita).
  - `StoryCard.tsx` (untuk melaporkan cerita utama).

## Fase 2: Pembuatan Halaman Admin
- Membuat `AdminLaporan.tsx` (membaca tabel `reports` yang berstatus `pending` dan menyediakan aksi abaikan/unpublish/hapus).
- Membuat `AdminDashboard.tsx` (merangkum `ai_usage` per stage, menghitung total biaya, dan menampilkan *jobs* yang `failed` / `deferred` untuk dicoba ulang).
- Mendaftarkan rute ini di dalam `main.tsx`.

## Fase 3: Skrip Pendukung
- Menambahkan skrip CLI `report-cost.ts` yang sesuai dengan `pnpm report:cost` yang diminta pada PRD.
- Menguji integrasi dan eksekusi tipe.
