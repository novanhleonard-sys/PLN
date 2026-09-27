# Rencana Eksekusi: Fitur Kelompok Daerah (B11)

Fitur ini akan mengubah cara daerah (provinsi) dikelompokkan untuk kebutuhan AI (gaya visual & suara), ambient sounds, serta filter pencarian, dari yang semula ENUM statis menjadi dinamis lewat UI Admin.

## Prasyarat
- Keputusan setuju atas docs/CONTRACT_CHANGES.md.

## Fase 1: Perubahan Kontrak & Migrasi Skema (Utama)
1. Buat file migrasi baru di supabase/migrations/ untuk tabel egion_groups.
2. Ubah struktur kolom egions, oice_personas, mbient_sounds, dan style_configs dengan mengganti enum egion_group menjadi relasi egion_group_id.
3. Tulis *data migration* (DML) di dalam file migrasi SQL tersebut untuk memindahkan data ENUM lama ke tabel egion_groups secara otomatis.
4. Perbarui packages/shared (	ypes.ts) untuk menyesuaikan perubahan tipe relasional ini.
5. Jalankan supabase db push dan lakukan pnpm typecheck untuk melihat di mana saja kode frontend / worker *break*.

## Fase 2: Perbaikan Tipe & Fungsionalitas Backend (Sub-agent A)
1. Perbaiki useStories.ts, Search.tsx, dan query di API / Edge Function terkait.
2. Ubah cara *worker* mencari style_configs dan oice_personas untuk AI, yaitu menggunakan *join* ke egions -> egion_group_id.
3. Verifikasi Pipeline AI tetap dapat melakukan generateAudio dan generateScene dengan konfigurasi daerah (region group) yang benar.

## Fase 3: Antarmuka UI Admin (Sub-agent B)
1. Buat antarmuka di AdminCenter untuk menu **Kelompok Daerah**.
2. Di dalam antarmuka ini, Admin bisa:
   - Membuat/mengedit "Nama Kelompok" (mis. Sunda, Melayu, Jawa).
   - Menambahkan (mencentang) provinsi-provinsi ke dalam kelompok tersebut (memperbarui egion_group_id di baris egions terkait).
3. Sesuaikan Form Tambah/Edit untuk oice_personas, mbient_sounds, dan style_configs di Admin Center agar memilih dari tabel egion_groups (berupa *dropdown* dinamis), bukan ENUM statis.

## Risiko
- Semua entitas (cerita, karakter, suara, style) sangat bergantung pada egion_group. Transisi ini berpotensi merusak *generate* audio/gambar pada cerita-cerita baru bila relasinya putus. Oleh karena itu, *typecheck* menyeluruh setelah fase migrasi wajib dilakukan sebelum Vercel Build.
