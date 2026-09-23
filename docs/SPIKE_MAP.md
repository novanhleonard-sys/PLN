# Spike Peta (Fase 0 - B1)

## Eksperimen Gaya Peta (MapLibre GL JS)

Kita mencoba dua pendekatan gaya utama untuk mewujudkan tampilan peta buku cerita yang ramah anak sesuai PRD.

### 1. Gaya A (Ilustrasi Kartun Berbasis GeoJSON)
Murni menggunakan GeoJSON pulau Jawa (`jawa-temp.geojson`) yang dirender ke dalam tumpukan layer MapLibre.
*   **Laut**: `background-color` warna cyan pucat (`#d1f4f9`).
*   **Bayangan Pesisir**: Layer `line` tebal (12px), di-blur (4px), berwarna biru laut (`#a3d9e0`) yang memberikan ilusi pulau melayang di atas air.
*   **Garis Pantai**: Menggunakan kombinasi dua layer `line`: *outline outer* warna teal gelap tebal (6px) dan *outline inner* warna krem kecoklatan tipis (2px). Hal ini menciptakan efek gambar tangan komik/kartun.
*   **Daratan**: Layer `fill` berwarna krem kertas (`#fff9ec`). (Tekstur SVG bisa ditambahkan jika masih kurang).
*   **Batas Provinsi**: Garis putus-putus (`line-dasharray`) berwarna coklat muda.
*   **Label**: Di tengah setiap poligon menggunakan teks besar berbingkai tebal putih.

*Kelebihan*: Ukuran muatan (payload) murni GeoJSON (kecil jika disederhanakan), warna sangat bisa dikustomisasi secara interaktif dari React, tidak ada jalan/bangunan dari peta modern sama sekali.
*Kekurangan*: Butuh simplifikasi presisi agar batas laut tidak terlihat tajam patah-patah (*jagged*).

### 2. Gaya B (Stamen Watercolor via Stadia Maps)
Menggunakan layer *raster tile* peninggalan proyek Stamen yang legendaris, kini di-hosting oleh Stadia Maps.
*   **Tampilan**: Cat air yang sangat artistik dan tak lekang oleh waktu.
*   **Performa**: Cepat, tapi merupakan gambar kotak-kotak (*raster tiles*), bukan vektor murni.

*Kelebihan*: Estetika langsung sangat indah tanpa perlu men-tweak garis pantai manual.
*Kekurangan*: Di *zoom level* yang tinggi, ada artefak "jalan" modern (seperti jalan tol) yang ikut terlukis dengan gaya cat air, sehingga kadang mengaburkan kesan "Nusantara Kuno/Mite".

### Tindakan Menunggu Keputusan Pengguna
Akses halaman eksperimen di **`/spike`** (contoh: `http://localhost:5173/spike`).
Anda bisa membandingkan Gaya A dan Gaya B langsung.
Mohon tinjau apakah Gaya A dirasa cukup berkarakter dan sesuai harapan, atau apakah kita perlu memakai cadangan (Gaya B / menumpuk aset tekstur tambahan).

Jika Anda puas dengan *layering vector* (Gaya A), balas dengan:
**GAYA A OK**
