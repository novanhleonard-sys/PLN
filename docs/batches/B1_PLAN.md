# Rencana Eksekusi Batch B1 (Peta)

## Prasyarat
- [x] B0 selesai (`contract-v1`).
- [x] B0.5 selesai (komponen dasar UI dan styleguide).
- [x] Supabase terhubung.
- [!] `GEMINI_API_KEY` dan `STADIA_MAPS_API_KEY` (Pengguna akan mengatur env variabel ini. Jika tidak tersedia saat script berjalan, aset akan memakai placeholder sesuai pengecualian spesifikasi).
- [!] `design/screens/` digantikan oleh aturan di `PLN_ANTIGRAVITY_DESIGN_OVERRIDE.md` dan komponen B0.5 sesuai keputusan sebelumnya.

## Keputusan Desain (Hasil Fase 0)
- Keduanya (Gaya A & B) dipertahankan dan ditoggle.
- **Label Provinsi**: Muncul hanya sekali di titik terpusat (jangan melabeli setiap pulau/fragment MultiPolygon).
- **Batas & Label ADM2**: Batas kab/kota lebih tipis/samar dari batas provinsi. Label kab/kota baru muncul saat zoom dekat.
- **Label vs Pin**: Collision detection wajib (label tidak boleh menimpa pin cerita).
- **Gaya B (Stadia)**: Tambahkan ornamen kecil sesuai konteks (kapal di laut, pohon di darat) dengan ukuran terkendali agar tidak mengganggu bentuk wilayah.

## Fase 0: Spike Peta (Selesai)
- **Tujuan**: Membuktikan Gaya A (kartun/ilustrasi) cukup bagus dan membandingkannya dengan Gaya B (Stamen Watercolor via Stadia).
- **Tindakan**:
  1. Unduh sampel GeoJSON Pulau Jawa.
  2. Implementasikan MapLibre GL JS dasar.
  3. Terapkan styling GeoJSON Gaya A (tekstur kertas, laut berombak, garis pantai berlapis, batas putus-putus) serta font ramah anak (glyph PBF/lokal).
  4. Terapkan raster layer Gaya B menggunakan `STADIA_MAPS_API_KEY` (jika ada).
  5. Ambil *screenshot* pada tingkat zoom 4, 6, dan 8.
  6. Susun laporan di `docs/SPIKE_MAP.md`.
- **Titik Henti Manusia**: Agent akan berhenti dan menunggu persetujuan `GAYA A OK` dari pengguna.

## Fase A: Paralel 3 Sub-Agent (Setelah GAYA A OK)
1. **Sub-Agent A1 (Data Wilayah)**: 
   - Unduh, sederhanakan, dan simpan `provinsi.geojson` dan `kabkota.geojson` (< 5MB).
   - Unduh dan proses dataset wilayah Kemendagri terbuka menjadi gazetteer.
   - Buat skrip `scripts/regions/import.ts` untuk mengisi tabel `regions` di Supabase.
2. **Sub-Agent A2 (Aset & Ornamen)**:
   - Buat SVG (awan splash, ombak, tekstur kertas, ikon fallback).
   - Panggil Gemini API untuk men-generate 25-35 kandidat ornamen dengan background transparan, 5-8 background fallback, dan 4 style anchor.
   - Simpan hasil di `content/assets/candidates/`.
   - **Titik Henti Manusia**: Menunggu pengguna mengkurasi ornamen lewat `ornaments.selected.txt`.
   - Bangun `ornaments.json` dan *sprite sheet* MapLibre.
3. **Sub-Agent A3 (UI Peta & Pencarian)**:
   - Kerjakan `Splash` (S01) dengan Framer Motion.
   - Implementasikan *logic* MapLibre (S02) (reveal tier, clustering spiral offset, integrasi gaya A/B, pin cache).
   - Implementasikan *Search* (S03a/b) dengan `minisearch`.
   - Sambungkan kartu cerita (`SidePanel` dan `Sheet`) dengan data S04 (dari tabel Supabase `seed_dev.sql`).

## Fase B: Reviewer Read-Only
- Agent pemeriksa membandingkan hasil akhir dengan persyaratan S01-S04 dan M1-M3.
- Laporan kelemahan/kepatuhan dicatat di `docs/qa/B1/REVIEW.md`.
- Pengecekan gerbang akhir sebelum _tag_ `b1-done`.

## Risiko yang Diperhatikan
- Kesulitan mendapatkan tampilan "ilustrasi" otentik murni dari poligon GeoJSON. Spike M0 sangat krusial.
- Ukuran data geometri Indonesia bisa sangat masif. Simplifikasi GeoJSON menggunakan tool CLI lokal diperlukan (seperti `mapshaper`).
