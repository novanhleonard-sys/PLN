# Usulan Perubahan Kontrak (B11)

## Alasan Perubahan
Saat ini, pengelompokan daerah (Region Groups) untuk gaya AI, suara latar (ambient), dan filter menggunakan tipe ENUM statis egion_group di database. Pengguna (Admin) meminta fitur antarmuka untuk dapat menambah, mengedit, dan mengelompokkan provinsi secara dinamis (misal: Jawa Tengah + DIY menjadi "Jawa", Jawa Barat menjadi "Sunda", Sumatera menjadi "Melayu"). Penggunaan ENUM statis membuat hal ini tidak mungkin dilakukan lewat UI tanpa migrasi DDL.

## Dampak
Tabel yang akan terpengaruh:
1. egions (kolom egion_group)
2. oice_personas (kolom egion_group)
3. mbient_sounds (kolom egion_group)
4. style_configs (kolom egion_group)

Tipe data TypeScript di packages/shared untuk RegionGroup yang sebelumnya statis harus diubah.

## Migrasi yang Diusulkan

1. **Membuat Tabel Baru**: egion_groups
   `sql
   CREATE TABLE region_groups (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       name TEXT UNIQUE NOT NULL,
       created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );
   ALTER TABLE region_groups ENABLE ROW LEVEL SECURITY;
   `

2. **Mengubah Kolom pada Tabel Terkait**:
   - Tambahkan egion_group_id UUID REFERENCES region_groups(id) ON DELETE SET NULL ke tabel egions, oice_personas, mbient_sounds, dan style_configs.
   - Migrasikan data yang sudah ada (dari ENUM string ke baris tabel baru).
   - Hapus kolom egion_group (ENUM) lama dan tipe ENUM-nya (opsional).
