# QA Checklist

Dokumen ini berisi daftar periksa (checklist) pengujian manual untuk fitur-fitur yang didefinisikan pada PRD Bagian 6 (Spesifikasi Fitur per Modul). 

## M1. Splash dan Shell
- [ ] Layar splash tertutup awan dengan teks "Peta Legenda Nusantara" muncul pada kunjungan pertama.
- [ ] Animasi awan tersibak ke kiri dan kanan, lalu kamera zoom-in ke peta.
- [ ] Animasi dapat dilewati (skip).
- [ ] Jika `prefers-reduced-motion` aktif, animasi splash diganti fade sederhana.
- [ ] Desktop: Bar atas menampilkan logo, pencarian, tombol profil, dan tombol kontribusi.
- [ ] Mobile: Pencarian melayang di atas peta, navigasi lewat tombol profil dan kontribusi.
- [ ] PWA: Manifest dan ikon terkonfigurasi dengan benar. Service worker meng-cache app shell dan aset.
- [ ] Routing halaman berjalan dengan benar (peta, kartu cerita, baca, profil, kontribusi, admin, login).

## M2. Peta
- [ ] Batas pan (lng 94-142, lat -12-7) dan zoom (3-12) berfungsi. Kamera awal berpusat dengan benar.
- [ ] Gaya A (Kartun): Laut, daratan, dan batas wilayah tampil sesuai desain ilustratif (tanpa jalan/bangunan).
- [ ] Ornamen peta (kapal, hewan ikonik, dll) tampil pada zoom dan lokasi yang tepat, tidak dapat diklik.
- [ ] Gaya B (Lukisan): Tile Stamen Watercolor tampil benar, atribusi ada.
- [ ] Toggle gaya peta (kiri bawah) berfungsi mengubah gaya tanpa memuat ulang pin. Preferensi disimpan.
- [ ] Pin cerita tampil bertahap sesuai tier (reveal-by-zoom).
- [ ] Ikon pin sesuai jenis cerita dan judul tampil mulai zoom 6 dengan collision detection.
- [ ] Jika pin berdekatan (radius 2km), offset spiral deterministik diterapkan.
- [ ] Klik pin memicu `flyTo`, URL berubah ke `/cerita/:slug`, dan membuka kartu cerita.

## M3. Pencarian dan Kartu Cerita
- [ ] Pencarian wilayah dan cerita berfungsi dengan debounce (200ms).
- [ ] Pilih wilayah di pencarian: peta `fitBounds` ke wilayah, pin di wilayah di-force-reveal, panel menampilkan daftar cerita.
- [ ] Pilih cerita di pencarian: peta `flyTo`, pin di-force-reveal, buka kartu cerita.
- [ ] Kartu cerita (panel kiri desktop / bottom sheet mobile) menampilkan hero image (atau fallback), judul, chip jenis/wilayah, sinopsis, info durasi/halaman, status audio.
- [ ] Tombol "Simpan" berfungsi (meminta login jika anonim).
- [ ] Tombol "Lanjut baca" (atau mulai baca) berfungsi membuka reader.

## M4. Reader
- [ ] Mode Baca Desktop: 2 kolom (gambar kiri, teks kanan).
- [ ] Mode Baca Mobile/Portrait: Gambar di atas, teks di bawah (dapat digulir).
- [ ] Navigasi halaman: Tombol, panah keyboard, dan geser (swipe) layar sentuh berfungsi.
- [ ] Mode Dongeng: Gambar tampil penuh dengan pan/zoom, audio memutar otomatis per halaman dan maju otomatis saat selesai.
- [ ] Dongeng terkunci bila `audio_status != ready` (tampil gembok/pesan).
- [ ] Fallback background tampil bila gambar belum siap/gagal dengan pesan "Ilustrasi sedang dibuat".
- [ ] Gerbang Login: Memblokir baca dan audio setelah batas `max(1, floor(10% total halaman))` untuk pengguna anonim.
- [ ] Riwayat baca tercatat (last_page) untuk pengguna login saat pindah halaman atau keluar.
- [ ] Pemilihan versi cerita berfungsi (membuka modal/kartu pilihan versi).

## M5. Akun, Gerbang, dan Profil
- [ ] Login/Daftar dengan Google OAuth dan Email berfungsi. Checkbox usia 18+ saat daftar ada.
- [ ] Verifikasi email membatasi fungsi kontribusi dan penyesuaian usia.
- [ ] Halaman Profil - Tersimpan: Menampilkan daftar cerita yang disimpan, bisa dihapus dari simpanan.
- [ ] Halaman Profil - Riwayat: Menampilkan daftar "Lanjutkan membaca" dengan progres.
- [ ] Halaman Profil - Kontribusi saya: Menampilkan daftar kontribusi dengan status dan alasan penolakan.
- [ ] Modal login mengembalikan pengguna ke halaman/tindakan sebelumnya setelah berhasil login.

## M6. Kontribusi
- [ ] Form multi-langkah (Info, Teks, Sumber, Hak, Tinjauan) berfungsi.
- [ ] Pilih wilayah (provinsi, kabupaten) menggunakan gazetteer berfungsi.
- [ ] Validasi panjang teks (150 - 3000 kata) berfungsi.
- [ ] Tautan kontribusi dari cerita spesifik otomatis mengisi `target_story_id`.
- [ ] Kuota (3 kiriman/hari) dihormati (ditolak jika melebihi).
- [ ] Tombol "Kirim ulang" pada kontribusi yang ditolak mengisi form dengan data sebelumnya.

## M7 & M8. Pipeline AI dan Admin
- [ ] Akses admin hanya untuk `role = admin`.
- [ ] Antrean admin menampilkan daftar submission (hasil triase, verifikasi, alasan).
- [ ] Admin dapat menyetujui, menolak (dengan alasan), dan rerender job dari antrean.
- [ ] Admin dapat memodifikasi tier, lokasi pin, unpublish versi, atau mencoba ulang job aset.
- [ ] Pipeline berjalan otomatis dari Triase, Verifikasi, Segmentasi, Gambar, hingga Audio (teruji via uji coba submission).

## M9. Sesuaikan Usia
- [ ] Tombol "Sesuaikan dengan usia" membuka modal input (2-15 tahun).
- [ ] Kuota (10 adaptasi baru/hari) dihormati.
- [ ] Sistem menampilkan progres adaptasi (lewat Realtime).
- [ ] Setelah adaptasi siap, teks dimuat ulang dan banner penanda adaptasi AI muncul.
- [ ] Tautan "Lihat versi asli" mengembalikan teks ke aslinya.
- [ ] Audio adaptasi (jika diminta) dibuat on-demand.

## M10. Data Wilayah dan Seed
- [ ] Peta batas provinsi/kabupaten sesuai GeoJSON yang diimpor.
- [ ] Data seed terimpor dan tampil sebagai pin dengan informasi yang valid.
