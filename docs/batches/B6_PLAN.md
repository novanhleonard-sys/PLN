# Rencana Eksekusi B6 (Pengerasan dan Evaluasi)

Berdasarkan spesifikasi di `B6_SPEC.md`, batch ini berfokus pada evaluasi (*capstone*), perbaikan performa, aksesibilitas, *bug bash*, dan penyiapan sistem untuk *demo*.

## Hasil Pemeriksaan Prasyarat
- **B5 Ter-merge:** Selesai (`b5e-done`).
- **20-30 cerita seed published dengan aset siap:** Belum terpenuhi (hanya ada beberapa cerita seed, misal *Bawang Merah Bawang Putih*, dll. Namun pembuatan secara massal belum di-*generate* sepenuhnya hingga 20-30 judul, dan gambar aset juga belum 100% diproduksi nyata). **MOHON PERSETUJUAN**: Haruskah kita membiarkan skrip evaluasi memakai data yang ada atau perlu menambahkan data seed lagi?
- **eval/golden/valid_input.json dari pengguna:** Belum ada! Direktori `eval` bahkan belum dibuat. File *golden set* (35 cerita valid dan varian) ini belum disuplai. **TINDAKAN**: Meminta pengguna (USER) untuk menyediakan atau memberi izin pada agent E1 untuk men-*generate*-nya.

## Rencana Fase
Akan dibagi menjadi 3 sub-agent utama (Fase A) yang berjalan secara paralel, diikuti 1 agent penutup (Fase B).

### Fase A. Tiga Sub-Agent Paralel

**Sub-agent E1: Evaluasi & Verifikasi (Fokus Pipeline ML)**
- Menginisialisasi *golden set* dan kueri. (Akan berhenti setelah generator selesai, menunggu keputusan `GOLDEN OK` dari pengguna).
- Menjalankan `eval:verify` di 3 konfigurasi RAG (Pro, Flash, GLM) tanpa mengubah data produksi.
- Menyiapkan rubrik gambar & suara (`eval/image-rubric.csv` & `eval/tts-rubric.csv`). Menunggu pengguna mengisi rubrik tersebut (titik henti manusia ke-2).
- Mengevaluasi 10 cerita adaptasi (band usia) untuk *fidelity*.
- Menghasilkan laporan biaya dari `pnpm report:cost`.

**Sub-agent E2: Performa, PWA, Aksesibilitas (Fokus Frontend)**
- Membaca audit *Lighthouse* awal, menekan LCP < 3 detik di lingkungan terbatas.
- Menyempurnakan PWA (`manifest`, *Service Worker* cache runtime & app shell, `offline.html`).
- Menerapkan uji aksesibilitas (kontras AA, navigasi keyboard, alt text).

**Sub-agent E3: Bug Bash & Pembersihan (Fokus QA & DevOps)**
- Menyusun `docs/QA_CHECKLIST.md` dan menjalankannya secara menyeluruh. (Akan meminta *feedback* perbaikan mana yang akan dikerjakan - titik henti manusia ke-3).
- Memasukkan *bug* minor ke `docs/KNOWN_ISSUES.md`.
- Menghapus jalur *dev* (`seed_dev.sql`), memastikan kebersihan *secrets*, dan mem-verifikasi 20 cerita di *production* (`pnpm demo:check`).

### Fase B. Penutupan
- Finalisasi `ENV_REQUIRED.md` dan `ASSETS_PENDING.md`.
- Pembaruan `STATE.md`.
- Verifikasi dari *Agent Reviewer* (Read-only) terhadap kriteria PRD 2.3.
- Pembuatan rilis *tag* `b6-done`.

---

**Pertanyaan / Halangan saat ini:**
1. Apakah file *golden set* `eval/golden/valid_input.json` akan Anda siapkan, atau haruskah sub-agent E1 men-*generate* draf awalnya sekarang?
2. Apakah prasyarat "20-30 cerita seed" harus dibangkitkan sekarang melalui `pnpm start` dari *worker*?

**Tunggu balasan `SETUJU` dari pengguna sebelum eksekusi.**
