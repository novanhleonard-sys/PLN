# B5. Fitur P1

Lima fitur independen. Satu sesi per fitur, branch per fitur (`batch/b5a-...` sampai `batch/b5e-...`). Prasyarat umum: B4 ter-merge dan aplikasi berjalan.

Kontrak beku tetap berlaku: perubahan skema hanya lewat `docs/CONTRACT_CHANGES.md` dengan persetujuan.

---

## 5a. Sesuaikan usia

Prasyarat: worker dan kunci Gemini serta Z.ai aktif. `design/screens/S08a`, `S08b`, dan varian banner S06. Data `age_band_rules` terisi (dari seed B0).

Referensi PRD: 6 M9, 8.2 (adapt, adapt_check), 8.6, 11.3, 7 (adaptations, pages, page_audio).

Kepemilikan: `apps/worker/src/stages/{adapt,adapt-check}/**`, `supabase/functions/request_adaptation/**`, `apps/web/src/features/reader/adapt/**`, perubahan kecil di header reader dan `dongeng` (mengaktifkan "Buat suara").

Tugas:
- Edge Function `request_adaptation`: wajib login dan email terverifikasi, pemetaan usia ke band (fungsi dari `packages/shared`; usia >= 13 mengembalikan `asli`, usia < 3 dipetakan ke 3-4), cek cache `(version_id, age_band, prompt_version)`, kuota `adaptations_per_day` (hanya untuk adaptasi baru), buat baris `adaptations` `pending`, enqueue job.
- Stage `adapt`: input halaman `asli`, aturan `age_band_rules`, jenis cerita, sensitivity. Output JSON array teks dengan jumlah elemen sama dengan jumlah halaman asli (1:1 dengan scene) beserta ringkasan perubahan. Simpan ke `pages`.
- Stage `adapt_check`: periksa nama tokoh, alur inti per halaman, pesan moral. Gagal: satu retry dengan umpan balik. Gagal lagi: adaptasi `failed`, pengguna tetap di teks asli dengan pesan.
- UI (S08a, S08b): modal usia dengan stepper 2-15, pratinjau band, catatan bahwa usia tidak disimpan, keadaan memuat (Realtime pada `adaptations`), banner adaptasi dengan "Lihat versi asli". Reader memuat teks adaptasi pada nomor halaman yang sama. Riwayat mengikuti `adaptation_id`.
- Audio adaptasi lazy: tombol "Buat suara" di mode Dongeng memicu job audio untuk adaptasi itu.
- Adaptasi tetap diberi label hasil AI.

Titik henti manusia: setelah stage adapt dan check bekerja, agent menampilkan contoh adaptasi satu cerita untuk band 3-4 dan 7-9. Pengguna menilai sebelum UI final.

Gerbang:
- Usia 5 menghasilkan adaptasi, halaman sama jumlahnya, banner tampil. Usia 6 (band 5-6) instan dari cache tanpa `ai_usage` baru.
- Kuota ditegakkan. Anonim ditolak. Usia 13 ke atas mendapat teks asli.
- Tes untuk pemetaan usia ke band dan invariansi jumlah halaman.
- Tag `b5a-done`.

---

## 5b. Gaya peta B dan toggle

Prasyarat: `STADIA_MAPS_API_KEY` dan `docs/SPIKE_MAP.md` (zoom maksimum efektif gaya B).

Referensi PRD: 6 M2, 10, 13.

Kepemilikan: `apps/web/src/features/map/**` (hanya layer gaya B, toggle, atribusi), `apps/web/src/ui/basic/MapStyleToggle` (bila perlu penyesuaian).

Tugas:
- Aktifkan layer raster Stamen Watercolor (Stadia) di dalam style yang sama dengan gaya A. Toggle hanya mengubah visibility, sehingga pin tidak dimuat ulang.
- Tombol persegi di kiri bawah dengan thumbnail gaya lain dan label ("Lukisan" atau "Kartun"). Pilihan disimpan di localStorage.
- Atribusi sesuai gaya aktif. Batasi zoom raster sesuai spike bila jejak jalan mengganggu.

Gerbang: toggle bekerja tanpa muat ulang pin, pilihan bertahan setelah refresh, atribusi benar, screenshot kedua gaya di `docs/qa/B5b/`. Tag `b5b-done`.

---

## 5c. Tier otomatis harian

Prasyarat: tidak ada.

Referensi PRD: 6 M2 (reveal), 7.4 (`tier_percentiles`, `tier_min_reads`, `score_weights`), 8.2 (Hitung tier).

Kepemilikan: `apps/worker/src/jobs/tier/**`, penjadwal di worker, tampilan skor pada `features/admin` (perubahan kecil).

Tugas:
- Job harian: `score = reads * bobot_baca + saves * bobot_simpan` dari `story_stats`. Untuk cerita dengan `tier_locked = false` dan `reads_count >= tier_min_reads`: tier dari persentil skor (5% tier 1, 15% tier 2, 30% tier 3, sisanya tier 4). Lainnya mempertahankan tier saat ini.
- Perbarui `story_stats.score`. Admin melihat skor dan tier.
- Penjadwal di proses worker (bukan layanan terpisah), idempoten untuk hari yang sama.
- Skrip pembuat data sintetis untuk uji.

Gerbang: tes unit penetapan persentil dan pengecualian (locked, di bawah minimum), uji dengan data sintetis, menjalankan job dua kali di hari yang sama tidak mengubah hasil. Tag `b5c-done`.

---

## 5d. Preferensi peta dan hapus akun

Prasyarat: `design/screens/S11d`.

Referensi PRD: 6 M5, 12 (Privasi), 7 (profiles, story_versions.contributor_id).

Kepemilikan: `apps/web/src/features/profile/preferences/**`, `supabase/functions/delete_account/**`.

Tugas:
- Tab Preferensi (S11d): kartu pilihan "Kartun" dan "Lukisan", disimpan di `profiles.preferred_map_style` dan dipakai sebagai default saat login (localStorage tetap untuk anonim). Bila gaya B belum ada, tampilkan hanya yang tersedia.
- Edge Function `delete_account`: menghapus profil, simpanan, riwayat, laporan milik pengguna, mengosongkan `contributor_id` pada versi (atribusi menjadi "Kontributor dihapus"), menghapus pengguna auth, keluar sesi. Konfirmasi dua langkah di UI.

Gerbang: preferensi lintas perangkat berfungsi, hapus akun menghasilkan keadaan yang benar di DB (dicek dengan tes), versi kontribusi tetap terbit. Tag `b5d-done`.

---

## 5e. Laporan dan dashboard biaya

Prasyarat: tidak ada.

Referensi PRD: 6 M8, 7 (reports, ai_usage, jobs).

Kepemilikan: `apps/web/src/features/report/**`, `apps/web/src/features/admin/{laporan,dashboard}/**`.

Tugas:
- Tombol "Laporkan" (login) pada story, versi, dan adaptasi: alasan singkat, insert `reports`.
- Admin: daftar laporan dengan aksi Abaikan, Unpublish versi, Hapus adaptasi.
- Dashboard: biaya AI per tahap per hari dan total (dari `ai_usage`), daftar job `failed` dan `deferred` dengan tombol coba ulang.
- Dibuat dari design system, tanpa desain Stitch.

Gerbang: laporan dibuat pengguna terlihat admin, aksi memengaruhi konten, angka dashboard cocok dengan `pnpm report:cost`. Tag `b5e-done`.
