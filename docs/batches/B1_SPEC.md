# B1. Peta

Tujuan: splash, peta ilustrasi gaya A, pin dengan reveal-by-zoom, pencarian, dan kartu cerita, dengan data wilayah dan aset yang diperlukan.

## Prasyarat

- B0 selesai (`contract-v1`) dan B0.5 ter-merge (Sheet, SidePanel, Chip, Button, dan lainnya).
- `design/screens/` berisi S01, S02, S03a, S03b, S04 (mobile dan desktop).
- Supabase (lokal atau dev cloud) berjalan dengan migrasi B0.
- `GEMINI_API_KEY` untuk aset. Jika tidak ada: sprite, fallback, dan anchor memakai placeholder bertanda `[GANTI DENGAN: ...]` dan dicatat di `ASSETS_PENDING.md`.
- Pengecualian data: batch ini boleh memakai data dummy hanya lewat `supabase/seed_dev.sql` (sekitar 30 cerita berslug `dev-*`, tersebar di banyak wilayah dan keempat tier). Data ini dihapus di B6.

## Referensi PRD

6 M1, M2, M3, M10 (geometri dan gazetteer), 7 (regions, stories, story_stats), 10, 12 (Performa), 13.2.

## Kepemilikan

`apps/web/src/features/{map,search,story-card,splash}/**`, `scripts/regions/**`, `scripts/gen-assets/**`, `content/regions/**`, `content/assets/**`, `apps/web/public/map/**`, `supabase/seed_dev.sql`. File bersama (`routes.tsx`, `package.json`) hanya ditambah baris.

## Fase

### Fase 0. Spike peta (satu agent) lalu berhenti

Keluaran: `docs/SPIKE_MAP.md`.

1. Gaya A pada satu pulau (Jawa) memakai GeoJSON ADM1 sementara: pola ombak pada laut, tekstur kertas pada daratan, garis pantai berlapis (bayangan, outline tebal membulat, outline dalam), batas provinsi putus-putus, label dengan font ramah anak (glyph PBF; dev boleh memakai endpoint demo MapLibre, produksi hosting sendiri). Screenshot pada zoom 4, 6, 8.
2. Gaya B (Stamen Watercolor lewat Stadia) bila `STADIA_MAPS_API_KEY` ada. Catat apakah jejak jalan muncul di zoom tinggi dan zoom maksimum yang wajar. Bila tidak ada kunci, lewati dan catat.
3. Kesimpulan: apakah gaya A cukup ilustratif, usulan perbaikan, opsi cadangan bila tidak (gaya B sebagai default sementara atau tambahan ornamen dan tekstur).

**Berhenti dan tunggu `GAYA A OK` dari pengguna.**

### Fase A. Tiga sub-agent paralel (setelah GAYA A OK)

**A1. Data wilayah** (memiliki `scripts/regions/**`, `content/regions/**`)

- Unduh geoBoundaries ADM1 dan ADM2 Indonesia. Periksa lisensi di halaman sumber dan catat di `docs/ASSUMPTIONS.md`.
- Sederhanakan (mapshaper atau tippecanoe) ke `content/regions/provinsi.geojson` dan `content/regions/kabkota.geojson`. Ukuran gzip total di bawah 5 MB, jika tidak buat PMTiles.
- Gazetteer dari dataset kode wilayah Kemendagri yang terbuka (kandidat: `cahyadsn/wilayah`, `JoeSoep/wilayah`; periksa lisensi): kode, nama, level, induk, lat/lng centroid, bounding box, `region_group`, alias (termasuk alias umum seperti Jogja, Jakarta, Bali).
- `scripts/regions/import.ts` (service role) mengisi tabel `regions`. Geometri hanya untuk menggambar peta, tidak ada spatial join.

**A2. Aset** (memiliki `scripts/gen-assets/**`, `content/assets/**`, `apps/web/public/map/**`)

- SVG dibuat agen sendiri: dua kelompok awan splash, ikon pin per jenis cerita (empat), pola ombak dan tekstur kertas (SVG atau CSS).
- Skrip generate (skrip dev boleh memanggil SDK Gemini langsung, bukan kode aplikasi): 25-35 kandidat ornamen (kapal, hewan ikonik per pulau, gunung, pohon) dengan latar polos lalu background removal menjadi PNG transparan 512x512; 5-8 fallback background (WebP 1600x1200: hutan untuk fabel, pantai atau gunung untuk legenda, langit malam untuk mite, desa atau istana untuk dongeng, umum); 4 style anchor. Semua ke `content/assets/candidates/` beserta contact sheet.
- Setelah pengguna menulis `content/assets/ornaments.selected.txt`, buat `ornaments.json` (id, sprite, lat, lng, minzoom, ukuran, maksimal 40) dan sprite sheet MapLibre. Penempatan hewan sesuai wilayah asal.

**A3. UI peta** (memiliki `apps/web/src/features/{map,search,story-card,splash}/**`, `supabase/seed_dev.sql`)

- Splash (S01): dua kelompok awan tersibak (framer-motion), kamera peta dianimasikan dari zoom lebar ke Indonesia. Tampil sekali per sesi, dapat dilewati, fade bila `prefers-reduced-motion`.
- Peta (S02, PRD M2): gaya A sebagai layer GeoJSON, ornamen, pin (symbol layer, ikon per jenis, label mulai zoom 6, collision, `symbol-sort-key` dari skor), reveal `tier <= tierForZoom(z)` atau `forceReveal`, offset spiral untuk pin berdekatan, kontrol zoom dan reset, atribusi, batas pan dan zoom sesuai PRD. Satu style memuat slot layer gaya B (visibility off), belum ada toggle.
- Pin dimuat sekali (id, slug, judul, jenis, lat, lng, tier, skor, cover) dan di-cache.
- Pencarian (S03a/S03b): indeks MiniSearch dari pin dan `regions` beserta alias, hasil dikelompokkan Cerita dan Wilayah, pilih wilayah memanggil `fitBounds` dan menampilkan daftar cerita wilayah (semuanya force-reveal), force reveal dilepas saat pencarian dibersihkan.
- Kartu cerita (S04): panel kiri di desktop, bottom sheet di mobile (memakai `SidePanel` dan `Sheet` dari B0.5). Isi sesuai PRD 6 M3. Tombol Simpan dan Lanjut baca ada tetapi belum berfungsi penuh (login dan reader dikerjakan B3): Simpan membuka placeholder, Lanjut baca menuju route `/baca/:versionId` placeholder.
- Deep link: `/cerita/:slug` dan parameter posisi peta.
- Koordinasi: A3 memakai stub GeoJSON dari Fase 0 sampai A1 selesai, lalu beralih ke data A1.

### Fase B. Reviewer read-only

Bandingkan hasil dengan S01-S04 dan checklist PRD M1-M3. Tulis di `docs/qa/B1/REVIEW.md`.

## Larangan

- Tidak ada reader, auth, atau pipeline.
- Tidak menyalin HTML Stitch mentah.
- Tidak memakai tile vektor OSM atau data yang memuat jalan dan bangunan.
- Data dummy hanya di `seed_dev.sql`.

## Titik henti manusia

1. Setelah Fase 0: `GAYA A OK`.
2. Kurasi ornamen, fallback, dan anchor lewat `ornaments.selected.txt`.
3. Persetujuan tampilan akhir gaya A.

## Gerbang

- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` lulus.
- Verifikasi lewat browser dengan screenshot 390 px dan 1280 px di `docs/qa/B1/`: splash, peta pada zoom 4, 7, 10, hasil pencarian, region list, kartu cerita.
- Reveal per tier terbukti (zoom out hanya tier 1). Pencarian "Jogja" menghasilkan Yogyakarta. Deep link `/cerita/dev-...` berfungsi.
- Tanpa jalan atau bangunan. Atribusi tampil.
- Tag `b1-done`.
