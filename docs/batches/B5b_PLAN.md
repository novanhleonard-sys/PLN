# Rencana Eksekusi B5b: Gaya Peta B dan Toggle

## Fase 1: Perbaikan Deployment (Tindakan Pengguna)
- Karena variabel environment berawalan `VITE_` diekstrak ke Javascript pada saat build (kompilasi), kunci Stadia Maps tidak terbawa ke environment *production* (seperti Render/Vercel) jika hanya diatur di `.env.local` lokal.
- **Tindakan**: Pengguna perlu memasukkan `VITE_STADIA_MAPS_API_KEY` pada pengaturan Environment Variables di *dashboard* platform hosting (misal Render, Vercel, dll) lalu melakukan *redeploy*.

## Fase 2: UI Toggle Kiri Bawah (Sub-agent: UI)
- Menghapus pill-toggle sementara yang bertuliskan "Gaya A / Gaya B" di kanan atas halaman `Home.tsx`.
- Membuat komponen `MapStyleToggle.tsx` di `features/map`.
- Komponen ini berupa tombol persegi di sudut kiri bawah layar dengan sebuah *thumbnail* visual mini (atau pewarnaan) dan label teks "Kartun" atau "Lukisan" yang bergantian sesuai state aktif.
- Pilihan peta disimpan secara persisten di dalam `localStorage` (key: `pln_map_style`) agar saat di-*refresh* gaya peta tetap sama.

## Fase 3: Batasan Zoom & Atribusi (Sub-agent: Peta)
- Mengatur properti `maxzoom: 11` (atau batasan lain sesuai spike) pada *source* layer `stadia-watercolor` di `MainMap.tsx`. Hal ini guna mencegah pengguna melakukan zoom terlalu dekat yang akan menampakkan gambar jalan raya modern/tol di peta lukisan.
- Memastikan atribusi atribusi Stadia Maps dan Stamen Design tampil dengan baik di sudut peta sesuai dengan lisensi layanan gratis Stadia.

## Gerbang Kelulusan (Gate)
- Toggle mengubah gaya peta tanpa muat ulang marker/pin cerita.
- Pilihan selamat setelah laman direfresh (Local Storage test).
- Teks jalan tol tidak terlihat meskipun di-*zoom* maksimum saat menggunakan mode Lukisan.
- Lulus `pnpm typecheck`, `lint`, dan `build`.
- Tag `b5b-done`.

**Risiko Utama**: Posisi tombol baru (`MapStyleToggle`) di sudut kiri bawah bisa tertutup jika ada elemen navigasi lain atau menutupi ikon MapLibre. Posisi absolut dan indeks z akan disesuaikan dengan saksama.
