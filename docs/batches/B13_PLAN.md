# Batch B13: Refactor Alur Admin Peta Legenda Nusantara

## Prasyarat
- Database Supabase terkoneksi.
- Kode pipeline AI worker stabil (JobRunner ada).

## Tujuan
Memisahkan tanggung jawab di panel Admin:
1. **Submission Review** (Antrean)
2. **Monitoring Process** (Pantauan AI)
3. **Audit/Riwayat** (Riwayat)
4. **Asset Management** (Edit Konten)

Membangun konsep \i_process_runs\ untuk mengelompokkan \jobs\, menyimpan konfigurasi AI (persona gambar/suara) sebelum eksekusi, serta memperbaiki tampilan dan manajemen aset secara granular tanpa merusak eksekusi job.

## Fase 1: Database Migration & Schema Update (Agent: Utama)
- **Tugas**: Membuat migrasi SQL baru untuk tabel \i_process_runs\, mengubah tabel \jobs\, memperbarui constraint status pada \story_versions\.
- **Direktori**: \supabase/migrations/\
- **Risiko**: Data job lama menjadi unlinked ke process run baru. Harus ditoleransi atau fallback \process_run_id = null\.

## Fase 2: Tab Antrean & Logic Start Process (Sub-agent: admin_antrean)
- **Tugas**: Memecah halaman \AdminAntrean.tsx\ jadi 3 Tab. Mengimplementasikan Tab 1 (Antrean) lengkap dengan UI Detail Submission, Panel Estimasi Proses AI, Pemilihan Persona (Gambar & Suara), dan tombol Split "Proses Cerita" (Scope).
- **Direktori**: \pps/web/src/features/admin/\
- **Risiko**: Kompleksitas state React Query dan form selection.

## Fase 3: Pantauan AI & Riwayat (Sub-agent: admin_monitor)
- **Tugas**: Mengembangkan Tab 2 (Pantauan AI) dan Tab 3 (Riwayat). Mengambil data run dari \i_process_runs\, menampilkan log/progress per job. Menampilkan raw error utuh untuk debugging. Tombol regenerasi parsial (individual job) di Pantauan AI.
- **Direktori**: \pps/web/src/features/admin/\
- **Risiko**: UI hierarchy yang dalam (Run -> Jobs -> Detail).

## Fase 4: Manajemen Aset Edit Cerita (Sub-agent: admin_asset)
- **Tugas**: Menambah seksi "Kelengkapan Asset" di halaman \AdminEditStory.tsx\. Opsi Regenerate, Hide, Delete, Generate Missing.
- **Direktori**: \pps/web/src/features/admin/\
- **Risiko**: Logika re-generation yang memiliki dependency (contoh Visual Bible dihapus).

## Urutan Eksekusi
- Utama mengerjakan Fase 1.
- Utama memverifikasi tipe database (typecheck).
- Utama mendelegasikan Fase 2, 3, dan 4 ke sub-agent secara paralel.
- Utama me-review dan menggabungkan hasil, uji integrasi (Fase akhir).
