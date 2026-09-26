# Rencana Eksekusi Batch 8 (B8): Antrean Cerita & Kelola Konten Admin

## Tujuan
Menyelesaikan fungsionalitas Pusat Admin sesuai PRD (M8). Termasuk antarmuka moderasi cerita (Antrean), manajemen konten (Cerita & Peta), pengelolaan *Job* AI, serta pengaturan Gaya AI (termasuk fitur unggah aset referensi).

## Daftar Sub-Agent & Direktori
Hanya menggunakan 1-2 agent secara berurutan untuk menjaga kestabilan *routing* dan komponen *shared*.
- **Agent Utama**: Mengatur rute, tabel, dan integrasi UI secara keseluruhan. Beroperasi di `apps/web/src/features/admin/`.

## Fase Implementasi

### Fase 1: Persiapan Database & Storage (Storage Aset Admin)
- Membuat *bucket* `admin-assets` di Supabase Storage dengan *policy* publik untuk baca, dan *admin-only* untuk unggah/hapus.
- Memastikan struktur `style_configs`, `voice_personas`, dan `fallback_backgrounds` dapat menyimpan referensi ke berkas yang diunggah.
- Membuat komponen uploader `FileUploader.tsx` (untuk gambar `.jpg/.png` dan audio `.mp3`).

### Fase 2: Antrean (Approval & Moderasi)
- Membuat halaman `/admin/antrean` (`AdminAntrean.tsx`).
- Menampilkan daftar dari tabel `submissions` yang membutuhkan tinjauan.
- Membuat panel detail tinjauan (menampilkan teks asli, sumber referensi, skor *confidence*, *safety flags*).
- Menambahkan aksi: **Setujui** (meneruskan ke proses AI/publikasi) dan **Tolak** (dengan pengisian alasan penolakan).

### Fase 3: Kelola Konten & Pemantauan Job AI
- Membuat halaman `/admin/konten` (`AdminKonten.tsx`).
- Menampilkan tabel cerita yang sudah tayang.
- Fitur aksi: ubah kunci *tier* (`tier_locked`), *publish/unpublish*, dan edit koordinat *pin* peta.
- Membuat tab/panel pemantauan **Jobs**: membaca tabel `jobs` (untuk melihat tugas pembuatan gambar/suara yang tertunda/gagal), dan menambahkan tombol **Coba Ulang** (*retry*).

### Fase 4: Pengaturan Gaya AI & Referensi Aset
- Membuat halaman `/admin/gaya-ai` (`AdminGayaAI.tsx`).
- Form pengelolaan `style_configs` (Gaya visual: legenda, mite, dll) dengan unggah gambar referensi.
- Form pengelolaan `voice_personas` (Gaya suara) dengan unggah contoh suara `.mp3` sebagai *Sample Path* / *Reference*.
- Form pengelolaan `age_band_rules` (Aturan batas usia & kosa kata) dan `fallback_backgrounds`.

## Kriteria Selesai (Gerbang Lulus)
- Admin bisa melihat cerita yang mengantre, menyetujui, dan menolaknya.
- Admin bisa mengunggah gambar dan suara ke *Supabase Storage* lewat antarmuka.
- Admin bisa melihat daftar cerita publik, mengubah titik petanya, dan memantau pekerjaan AI yang gagal.
- Lulus `pnpm typecheck`, `lint`, dan *build*. RLS pada *storage* berfungsi dengan benar.
