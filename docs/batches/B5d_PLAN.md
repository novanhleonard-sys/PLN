# Rencana Eksekusi B5d: Preferensi Peta & Hapus Akun

## Fase 1: Edge Function (Sub-agent: Backend)
- Membuat edge function `delete_account`.
- Menggunakan Supabase Admin Client (`SUPABASE_SERVICE_ROLE_KEY`) untuk memanggil `supabase.auth.admin.deleteUser(user_id)`.
- Semua data pengguna (`profiles`, `read_history`, `saved_stories`, `reports`) akan otomatis terhapus karena relasi *CASCADE*.
- Data `story_versions.contributor_id` akan otomatis menjadi `NULL` (berkat relasi *SET NULL*), sehingga karya tetap terbit atas nama anonim/dihapus.

## Fase 2: UI Tab Preferensi S11d (Sub-agent: Frontend)
- Menambahkan tab **Preferensi** pada halaman `Profile.tsx`.
- Menyertakan sub-bagian "Gaya Peta Default" berupa dua pilihan kartu: "Kartun" (Gaya A) dan "Lukisan" (Gaya B).
- Menyimpan pilihan peta ini langsung ke database `profiles.preferred_map_style` menggunakan *mutation*.
- Mengambil preferensi pengguna saat memuat profil dan menyimpannya juga ke `localStorage('pln_map_style')` agar bisa diakses komponen peta non-auth secara instan.
- Menambahkan tombol "Hapus Akun" dengan *Confirmation Modal* dua langkah (konfirmasi teks/peringatan) sebelum memanggil *edge function* `delete_account`. Setelah terhapus, sesi di-*sign-out* secara otomatis.

## Gerbang Kelulusan
- Preferensi gaya peta berhasil tersimpan ke Supabase dan memengaruhi pilihan peta default lintas perangkat (ketika *login*).
- Hapus akun sukses membuang profil dari *database* (diuji manual atau tes *script*) dan mengatur kolom *contributor_id* di *story_versions* terkait menjadi *NULL* tanpa menghapus versinya.
- Build, lint, typecheck lulus. Tag `b5d-done`.
