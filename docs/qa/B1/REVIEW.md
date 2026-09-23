# Laporan Review Akhir Batch B1 (Peta)

Reviewer: Agent (Read-Only)
Tanggal: 23 September 2026
Tujuan: Memverifikasi hasil implementasi B1 terhadap `PLN_PRD_v1.md` dan `B1_SPEC.md`.

## 1. Kepatuhan (Compliance)

- **S01 Splash Screen**: Selesai dan sesuai. Framer Motion diimplementasikan dengan cek `prefers-reduced-motion` dan state persisten di session storage (animasi awan tersibak).
- **M2 Peta**:
  - Konfigurasi batas pan, batas zoom (min 3, max 12), proyeksi Mercator sesuai dengan yang didefinisikan.
  - Terdapat tombol toggle untuk berganti dari Style A (GeoJSON) ke Style B (Stadia Watercolor).
  - Terdapat implementasi awal styling GeoJSON (provinsi, kabupaten/kota) dan source story-pins.
- **S04 Kartu Cerita (Story Card)**:
  - Diimplementasikan sesuai responsivitas. Memakai `SidePanel` untuk desktop dan `Sheet` (bottom sheet) untuk mobile.
  - Komponen berisi judul, region, tipe (legenda dll), tombol Lanjut Baca, dan Simpan.
- **Generasi Aset**: 
  - Sub-agent A1 telah mengunduh/memproses ukuran GeoJSON (`provinsi.geojson` dan `kabkota.geojson` ada di `content/regions/`).
  - Sub-agent A2 telah menaruh sebagian file aset SVG dan JSON `ornaments.json` di `content/assets/` dan `public/map/`.

## 2. Penyimpangan dan Kekurangan (Deviations)

Reviewer menemukan beberapa kekurangan utama terkait integrasi dan fungsionalitas yang disyaratkan dalam PRD:

### Sub-agent A1 (Data Wilayah)
- **Gazetteer tidak mengambil data Kemendagri**: Di `scripts/regions/import.ts`, import data region bukan menggunakan dataset gazetteer resmi berisikan alias ("Jogja", "Jakarta") seperti diinstruksikan PRD (M10). Skrip tersebut malah membaca atribut `centroid_y/x` dari file batas GeoJSON batas wilayah. Alhasil, kolom `bbox`, `aliases`, `parent_id` tidak terisi.

### Sub-agent A2 (Aset)
- **Aset ikon pin tidak lengkap**: Baru tersedia satu fallback (`fallback_pin.svg`), PRD mensyaratkan ada 4 ikon spesifik per jenis cerita (legenda, mite, fabel, dongeng). 

### Sub-agent A3 (UI Peta, Pencarian, & Integrasi Data)
- **Implementasi A3 belum memakai GeoJSON A1**: `MainMap.tsx` secara hardcode masih menunjuk ke `data: '/map/jawa-temp.geojson'`, tidak berubah menggunakan hasil simplifikasi A1 (`content/regions/provinsi.geojson`).
- **Gaya A belum bertekstur**: `MainMap.tsx` mendefinisikan warna polygon dan background ocean dengan *solid color* biasa. Aset `paper_texture.svg` dan `ocean_waves.svg` belum diterapkan.
- **Label Provinsi MultiPolygon**: Label provinsi ditambahkan lewat `symbol-placement: point` langsung ke data provinsi GeoJSON. PRD `B1_PLAN.md` menekankan "Label Provinsi: Muncul hanya sekali di titik terpusat (jangan melabeli setiap pulau/fragment MultiPolygon)". Hal ini akan menghasilkan duplikasi label.
- **Ornamen Peta**: `MainMap.tsx` belum membaca `ornaments.json` dan memuat sprite. Ornament yang tampil hanya dummy berupa titik koordinat *hardcoded* di sumber GeoJSON.
- **Pin Layer (Symbol vs Circle)**: `MainMap.tsx` melukiskan story pins menggunakan tipe `circle` biasa, bukan tipe `symbol` yang memanfaatkan file SVG sesuai aset (A2).
- **Logika Reveal Tier dan Collision**: 
  - Tidak ada filter `tier <= tierForZoom(z)` untuk pin layer (reveal-by-zoom).
  - Trik pengurutan *sort-key* negatif `symbol-sort-key: ['-', ['get', 'score']]` perlu dipastikan benar didukung MapLibre.
- **Logika Offset Spiral**: Pin yang berdekatan atau pada posisi sama persis tidak memiliki offset spiral (spiderifier) yang diminta.
- **Pencarian S03 (Search.tsx)**:
  - Indeks `MiniSearch` hanya mencari `DUMMY_STORIES`. Tabel `regions` dan alias-aliasnya sama sekali tidak dicari/digabungkan.
  - Hasil pencarian tidak dikelompokkan ke dalam 2 kategori: "Cerita" dan "Wilayah" (sebagaimana diminta PRD).
  - Jika wilayah ditekan, tidak ada aksi navigasi `fitBounds` di peta, dan pin di wilayah tidak mendapatkan trigger *force-reveal*.
- **Data Dummy (seed_dev.sql)**:
  - PRD memandatkan: "Pengecualian data: batch ini boleh memakai data dummy hanya lewat `supabase/seed_dev.sql` (sekitar 30 cerita)".
  - Tidak ada file `seed_dev.sql`. Agent malah menulis secara hardcode data `DUMMY_STORIES` 7 cerita saja di dalam `apps/web/src/features/map/dummy-stories.ts`.

## 3. Kesimpulan & Langkah Selanjutnya
Gerbang (Gates) untuk Batch B1 belum dapat dinyatakan **lulus**. Sub-agent utama (atau agent utama) harus menyelesaikan sisa item yang tercantum di atas (terutama integrasi A1, A2, dan A3 ke file utama, dan logic Peta seperti tier, offset spiral) sebelum membuat *tag* git `b1-done`.
