# B6. Pengerasan dan evaluasi

Tujuan: membuktikan kualitas (evaluasi capstone), memenuhi target performa dan aksesibilitas, membersihkan data dev, dan memastikan demo siap.

## Prasyarat

- B5 (atau B4 bila P1 dipotong) ter-merge.
- 20-30 cerita seed `published` dengan aset siap.
- `eval/golden/valid_input.json` dari pengguna (35 cerita valid dan varian).
- Jika kurang: berhenti dan daftar.

## Referensi PRD

16 (Evaluasi), 12 (Performa, Keamanan, Aksesibilitas), 2.3 (kriteria demo), 17, 14.

## Kepemilikan

`eval/**`, `scripts/{report*,demo-check*}`, `apps/web/**` (hanya untuk performa, PWA, aksesibilitas, dan perbaikan bug), `docs/QA_CHECKLIST.md`, `docs/KNOWN_ISSUES.md`.

## Fase

### Fase A. Tiga sub-agent paralel

**E1. Evaluasi** (memiliki `eval/**`, `scripts/report*`)

- Generator kasus sintetis untuk golden set: 10 karangan, 8 salinan verbatim (dari sumber domain publik yang jelas), 7 di luar topik atau tidak aman. Berhenti untuk `GOLDEN OK` setelah pengguna memvalidasi label. Total target 60 kasus.
- `eval:verify`: menjalankan verifikator (fungsi murni, tanpa menulis DB) untuk tiga konfigurasi lewat override `routes` (A: Gemini Pro dengan RAG dan grounding, B: Gemini Flash dengan RAG, C: GLM dengan RAG). Keluaran CSV dan ringkasan markdown di `eval/results/`: akurasi verdict, tingkat false pass, tingkat false reject, proporsi `needs_human_review`, kesepakatan antar konfigurasi, biaya dan latensi per kasus.
- Kueri riset: 10-20 kueri cerita Indonesia nyata yang menguji cakupan sumber tiap provider.
- Rubrik: `eval/image-rubric.csv` (10 cerita x 3 halaman, skala 1-5: konsistensi tokoh, kesesuaian adegan, ketepatan budaya, ramah anak, kualitas visual) dan `eval/tts-rubric.csv` (kejelasan pengucapan, kealamian, kesesuaian persona, konsistensi antar halaman), beserta skrip sampel dan contact sheet.
- Evaluasi adaptasi bila fitur 5a ada: 10 cerita x 2 band dengan cek kesetiaan otomatis.
- `pnpm report:cost`: biaya per cerita per tahap, total seed, proyeksi 100 cerita.

**E2. Performa, PWA, aksesibilitas** (memiliki konfigurasi build, service worker, dan perbaikan performa di `apps/web`)

- Target LCP < 3 detik dengan throttling 4G pada peta, kartu, reader. Audit Lighthouse, perbaiki temuan utama (ukuran gambar, lazy loading, code splitting, preload).
- PWA: manifest, ikon, service worker (cache app shell, cache runtime gambar dan audio dengan batas entri), halaman offline sederhana.
- Aksesibilitas: axe pada layar utama, kontras AA, navigasi keyboard di reader, fokus terlihat, alt text, `prefers-reduced-motion`.

**E3. Bug bash dan pembersihan** (memiliki `docs/QA_CHECKLIST.md`, `docs/KNOWN_ISSUES.md`, perbaikan bug lintas fitur secara terbatas)

- Susun `docs/QA_CHECKLIST.md` dari kriteria penerimaan di PRD bagian 6 per milestone. Jalankan lewat browser. Catat temuan.
- Perbaiki bug P0. Sisanya masuk `KNOWN_ISSUES.md`.
- Hapus jalur data dev (`seed_dev.sql` dan data `dev-*`) dari lingkungan demo. Jalankan ulang tes RLS. Pindai rahasia di repo dan riwayat commit.
- `pnpm demo:check`: memastikan minimal 20 cerita `published` dengan aset siap.

### Fase B. Penutupan (satu agent)

`docs/ENV_REQUIRED.md` final, `docs/ASSETS_PENDING.md` final, `docs/STATE.md`. Reviewer read-only menulis `docs/qa/B6/REVIEW.md` terhadap kriteria PRD 2.3.

## Larangan

- Tidak menambah fitur baru.
- Evaluasi tidak menulis ke tabel produksi (tanpa efek samping).
- Tidak mengubah kontrak beku tanpa `CONTRACT_CHANGES.md`.

## Titik henti manusia

1. `GOLDEN OK` setelah pengguna memvalidasi label.
2. Pengisian rubrik gambar dan suara oleh dua penilai.
3. Keputusan bug mana yang diperbaiki.

## Gerbang

- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` lulus.
- Laporan evaluasi verifikator (tiga konfigurasi) dan biaya tersimpan di `eval/results/`.
- LCP < 3 detik pada halaman kunci, PWA dapat dipasang, axe bersih.
- `QA_CHECKLIST.md` lulus di HP asli. Demo check lulus.
- Kriteria demo PRD 2.3 terpenuhi. Tag `b6-done`.
