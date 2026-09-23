# Design System Peta Legenda Nusantara

Dokumen ini menjadi acuan visual (menggantikan ekspor desain Stitch) bagi seluruh antarmuka Peta Legenda Nusantara.

## 1. Prinsip Desain
- **Kesan (Vibe):** Peta buku cerita Nusantara yang hangat dan imajinatif, namun rapi dan mudah dipakai oleh orang tua serta guru.
- **Bebas dari Gaya "AI Generik":** TANPA emoji, TANPA gradien mencolok, TANPA *glassmorphism*, TANPA efek bercahaya (*glow*), TANPA ilustrasi generik, dan TANPA dekorasi tanpa fungsi yang jelas.
- **Teks Singkat:** Teks UI harus singkat, spesifik, padat, berbahasa Indonesia, tidak bertele-tele seperti slogan.
- **Hierarki Tanpa Over-Carding:** Jangan membungkus setiap elemen ke dalam kartu (*card*). Gunakan jarak spasial (*spacing*) dan tipografi untuk mengelompokkan konten. Bayangan (*shadow*) atau garis batas (*border*) **hanya** dipakai ketika benar-benar perlu membedakan lapisan (misalnya *modal*, *sheet*, *dropdown*, *floating button*).
- **Satu Fokus Aksi:** Dalam setiap konteks/layar, sediakan hanya **satu** aksi utama (Primary CTA) yang paling menonjol.

## 2. Palet Warna
- **Latar Utama:** Krem `#FFF6E5` (memberi tekstur/kesan kertas yang hangat).
- **Permukaan Utama:** Putih `#FFFFFF` (untuk elemen yang harus bersih atau melayang).
- **Warna Aksi (Primary):** Teal `#2C8C99` (dengan iterasi lebih gelap saat ditekan/di-hover).
- **Warna Laut (Aksen):** Laut `#CDEBF3`.
- **Teks:** Utama `#2E2A26`, Teks Redup/Sekunder `#6B625A`.
- **Batas (Border):** Krem gelap / cokelat muda `#EADFCB`.
- **Umpan Balik:** Error `#C8453B`, Sukses `#4C9A5B`.
- **Pin / Chip Jenis Cerita:**
  - Legenda: Terakota `#D9663F`
  - Mite: Ungu `#7B5EA7`
  - Fabel: Hijau `#4C9A5B`
  - Dongeng: Kuning mustard `#E3A72F`

## 3. Tipografi
Menggunakan font *self-hosted* (via `@fontsource`).
- **Headings & Tombol:** Fredoka (Membulat, ramah, imajinatif).
- **Isi (Body & Bacaan):** Nunito (Jelas, bersih, membulat).
- **Ukuran Teks Baca:** Mobile `18px`, Desktop `20px`.
- **Line-height:** `1.6` (untuk kemudahan membaca).

## 4. Spasi, Bentuk, & Lapisan (Layers)
- **Grid:** Berbasis `8px` (`p-2`, `p-4`, `gap-4` dsb).
- **Radius Sudut:** 
  - Kartu / Wadah standar: `16px` (`rounded-2xl`).
  - Modal / Bottom Sheet: `24px` (`rounded-3xl`).
  - Tombol / Chip: `9999px` (Pill / *fully rounded*).
- **Bayangan:** Halus, hangat, tidak tajam. Hanya pada komponen yang terangkat (lapisan atas seperti floating action button, sheet, modal).
- **Area Sentuh (Tap Target):** Minimal `44px` (Aksesibilitas AA).

## 5. Panduan Komponen
- **Tombol (Button):** Varian: `primary`, `secondary` (outlined/tonal), `ghost`/`text`. Sediakan keadaan `default`, `pressed`, `disabled`, `loading`. Semua membulat sempurna (pill).
- **Chip & Badge:** Varian padat (solid) khusus untuk jenis cerita. Untuk tema atau interaksi ringan, gunakan garis batas (outline) tanpa background menonjol.
- **Card (Kartu):** Gunakan border `1px solid #EADFCB` dan latar putih `#FFFFFF`. Hindari menumpuk card di dalam card.
- **Layer & Overlays (Sheet, Modal):** Di mobile, lapisan dari bawah (*Bottom Sheet*) memakai gagang (handle) seret dan menjebak fokus (*focus trap*). Di desktop, tampil sebagai *Centered Modal* agar tidak berantakan. Jangan gunakan background *blur*, cukup pelapisan (dimming) `rgba(46, 42, 38, 0.4)`.

## 6. Aksesibilitas
- Seluruh rasio kontras warna terhadap teks minimal mematuhi spesifikasi WCAG AA (misal: warna putih di atas `#2C8C99` lulus kontras, teks `#2E2A26` pada krem `#FFF6E5` lulus kontras).
- Responsibilitas transisi dikontrol dengan utilitas `prefers-reduced-motion`.
- Hindari elemen interaktif yang hanya bisa dipahami lewat warna (selalu berikan ikon atau label teks pendukung).
