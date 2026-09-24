# Status Proyek Peta Legenda Nusantara

## Batch Terkini
**B3 (Reader dan Auth UI)** - Selesai (Menunggu tag b3-done)

## Status Fase (B3)
- [x] Fase A: Shell dan fondasi data (Selesai)
- [x] Fase B: Auth UI, Mode Baca, Mode Dongeng paralel (Selesai)
- [x] Fase C: Reviewer (Selesai)

## Kontrak Data
- Kontrak contract-v1 (B0) stabil.
- Tambahan B3: 20260924000001_b3_rls_policies.sql menerapkan RLS penuh untuk membatasi anonim ke 10% total halaman (ree_page_limit) pada pages dan page_audio. Pengguna login (uth.uid() IS NOT NULL) memiliki akses penuh.

## Keputusan Arsitektur
- **Otentikasi**: Sesuai arahan pengguna, metode email dan kata sandi dihapus dari layar Login. Google OAuth menjadi satu-satunya metode akses (Single Sign-On).
- **Animasi Dongeng**: Menggunakan ramer-motion (Ken Burns effect) secara deterministik dari page.id, fallback non-animasi tersedia bila mode aksesibilitas (prefers-reduced-motion) aktif.
- **Komponen Independen**: Komponen spesifik SceneImage disederhanakan/digabungkan langsung dalam layout demi efisiensi; *fallback background* khusus diganti kotak abu-abu generik.

## Masalah Diketahui
- Data cerita secara penuh bergantung pada hasil seeding sementara via 3_seed.ts & 3_tweak.ts. Saat worker berjalan sempurna (B2 lanjutan), seluruh pipeline akan terotomatisasi.
- Beberapa elemen UI spesifik M3 (info durasi baca, lencana, jumlah versi, dll.) di StoryCard belum ditambahkan dan dibiarkan menggunakan layout dummy sementara.

## Langkah Berikutnya
- **B4**: Search dan Filter (melengkapi Peta dan Eksplorasi).
- **B5**: Sesuaikan (Customization) - Mengaktifkan tombol 'Sesuaikan' dengan adaptasi tingkat membaca dan preferensi visual/audio AI.
