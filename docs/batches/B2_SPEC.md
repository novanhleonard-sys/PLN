# B2. Pipeline AI

Tujuan: worker yang menjalankan seluruh pipeline PRD bagian 8 dengan provider nyata, kontrol biaya, dan idempotensi, membuktikan alur dari submission sampai aset siap.

## Prasyarat

- B0 selesai (`contract-v1`).
- ENV: Supabase (URL, service role), `GEMINI_API_KEY`, `ZAI_API_KEY`, `AI_DAILY_BUDGET_USD`, `AI_STORY_BUDGET_USD`. `ffmpeg` di PATH.
- `content/seed/` berisi minimal 3 cerita valid menurut skema PRD 7.6, satu di antaranya pendek (sekitar 200 kata) untuk smoke.
- Jika ada yang kurang: berhenti dan daftar. Tidak ada mock provider di luar unit test.

## Referensi PRD

8 (seluruhnya), 7 (jobs, ai_usage, verification_runs, corpus, style_configs, voice_personas, characters), 11, 12 (Keamanan), 14, 16.

## Kepemilikan

`apps/worker/**`, `scripts/seed*`, `scripts/corpus*`, `scripts/report*`, `content/seed/**`, `content/corpus/**`, `content/assets/candidates/voices/**`, `eval/` (hanya kerangka). Perubahan `packages/shared` atau migrasi hanya lewat `docs/CONTRACT_CHANGES.md` (contoh yang kemungkinan perlu: fungsi SQL pencarian vektor untuk RAG).

## Fase

### Fase 0. Uji kecil AI (satu agent) lalu berhenti untuk persetujuan

Keluaran: `docs/SPIKE_AI.md`. Skrip uji boleh memanggil SDK provider langsung (bukan kode aplikasi).

1. Gambar: satu fabel pendek menjadi 10 halaman dengan satu character sheet. Bandingkan dua model gambar bila tersedia. Contact sheet, biaya, catatan konsistensi tokoh.
2. Suara: tiga persona (gaya berbeda) pada satu naskah 30-40 kata yang memuat nama tempat sulit. Simpan ke `content/assets/candidates/voices/`. Catat format output mentah, durasi, biaya.
3. Triase: GLM kelas murah vs Gemini Flash pada 8 kasus sintetis (2 valid, 2 spam, 2 di luar topik, 2 tidak aman): akurasi, latensi, biaya.
4. Verifikasi: Gemini kelas Pro dengan Google Search grounding pada 5 kasus: apakah bekerja, kutipan sumber, latensi, biaya.
5. Rekomendasi isi awal `routes.ts` beserta alasannya.

**Berhenti dan tunggu `SPIKE OK` beserta pilihan pengguna** (model gambar, persona, routing).

### Fase A. Inti worker (satu agent; boleh berjalan bersamaan dengan Fase 0)

- Provider registry (PRD 8.7): antarmuka bersama, `providers/gemini.ts`, `providers/zai.ts`, `routes.ts` (dapat ditimpa dari `app_settings`), `ai_prices.ts` (dari dokumentasi resmi), pencatatan `ai_usage` di setiap panggilan, validasi JSON dengan zod dan satu retry.
- Job runner: klaim lewat `claim_job`, retry dengan backoff 30 detik, 2 menit, 10 menit (maksimal 3), batas concurrency per jenis dari `app_settings`, `idempotency_key = kind:ref_id:hash(params)`, status `deferred` bila anggaran habis, shutdown halus.
- Penjaga anggaran: harian (`AI_DAILY_BUDGET_USD`) dan per cerita (`AI_STORY_BUDGET_USD`), diperiksa sebelum setiap panggilan berbayar.
- Kontrak stage: `(ctx, job) => Promise<StageResult>`. Setiap stage memeriksa apakah keluarannya sudah ada sebelum memanggil provider.
- Entry point worker, log terstruktur.

### Fase B. Tiga sub-agent paralel (setelah `SPIKE OK` dan Fase A selesai)

**B1. Verifikasi** (memiliki `apps/worker/src/stages/{triage,verify}/**`, `apps/worker/src/orchestrator/**`, `scripts/corpus*`)

- `triage`: keputusan proceed, reject_spam, reject_offtopic, reject_unsafe, kandidat duplikat lewat kemiripan embedding.
- `verify`: fungsi murni tanpa handle database (D17). Input teks, sumber, top-k korpus, hasil grounding. Output JSON verdict (PRD 8.3). Tes yang membuktikan modul ini tidak mengimpor client database.
- `applyVerdict` di orchestrator memakai fungsi murni dari `packages/shared`. Menulis `verification_runs`, mengubah status submission, memicu tahap berikutnya.
- Embedding dan pencarian korpus (pgvector). `scripts/corpus:ingest` memecah dokumen di `content/corpus/`, membuat embedding, mengisi `corpus_docs` dan `corpus_chunks`.

**B2. Konten dan gambar** (memiliki `apps/worker/src/stages/{materialize,segment,character,scene-image,finalize}/**`)

- `materialize`: submission diterima menjadi `stories` (bila baru) dan `story_versions` berstatus `processing`.
- `segment`: pembagian halaman (6-14), deskripsi visual per scene, sinopsis, tema, tokoh, `sensitivity`. Membuat adaptasi `asli`, `pages`, `scenes`. Setelah selesai version `published` dan `asset_status = generating`.
- `character`: character sheet tokoh baru; tokoh global (mis. Kancil) dipakai ulang.
- `scene-image`: prompt dirakit deterministik (PRD 8.4) dari `style_configs`, deskripsi scene, deskriptor tokoh, aturan tetap (persegi, tanpa teks). Acuan: character sheet dan style anchor. Output WebP 1024 dan thumbnail 400 dengan sharp, diunggah ke `story-media`.
- `finalize`: menetapkan `asset_status` (`ready` atau `partial`) dan sinkron `total_pages`.

**B3. Audio** (memiliki `apps/worker/src/stages/audio/**`, `content/pronunciation.json`)

- Pemilihan persona dari `voice_personas` (paling spesifik ke umum).
- Satu panggilan TTS per halaman, suara dan arahan gaya sama untuk seluruh adaptasi. Kamus pengucapan disisipkan bila cocok.
- Konversi output mentah ke Opus mono sekitar 32 kbps dengan ffmpeg, unggah ke `story-media`, catat `duration_ms`, isi `page_audio`, set `audio_status`.

### Fase C. Seed dan smoke (satu agent)

- `seed:import`: membaca `content/seed/*.json`, memasukkannya sebagai submission dan menjalankan pipeline sungguhan. Mendukung Batch atau Flex tier untuk gambar bila tersedia.
- `pipeline:smoke`: satu cerita pendek dari submission sampai aset siap dengan asersi pada baris DB dan file storage.
- `pnpm report:cost`: biaya per tahap dan per cerita dari `ai_usage`.

### Fase D. Reviewer read-only

Periksa batas D17, idempotensi, penjaga anggaran, retry, kesesuaian dengan PRD 8. Tulis di `docs/qa/B2/REVIEW.md`.

## Tes unit yang wajib (dengan test double provider)

Perakitan prompt gambar, `applyVerdict` (table-driven), backoff retry, penjaga anggaran, idempotensi (eksekusi kedua tidak memanggil provider).

## Larangan

- Tidak ada UI.
- Kunci provider hanya di worker dan tidak masuk log.
- Tidak menulis konten di luar alur pipeline.
- Tidak regenerate aset yang sudah ada.

## Titik henti manusia

1. Setelah Fase 0: `SPIKE OK` dan pilihan model gambar, persona, routing.
2. Setelah smoke: pengguna memeriksa gambar dan audio tiga cerita.
3. Sebelum seed massal: pengguna menyerahkan 20-30 cerita seed dan menyetujui eksekusi.

## Gerbang

- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` lulus.
- `pipeline:smoke` lulus dengan provider asli. Smoke kedua tidak menambah `ai_usage`.
- Anggaran harian sangat kecil membuat job `deferred`, bukan `failed`.
- Worker dimatikan di tengah job lalu dinyalakan lagi: job pulih.
- Minimal 3 cerita `published` dengan `asset_status = ready`.
- Tag `b2-done`.
