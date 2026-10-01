# Laporan Audit Codebase: Peta Legenda Nusantara

Sesuai permintaan untuk melakukan audit menyeluruh pada codebase (terutama mendalami AI Worker Pipeline), berikut adalah hasil temuan berdasarkan tinjauan kode. Sesuai aturan **AGENTS.md**, audit ini bersifat *read-only* (tidak ada pengeditan kode yang dilakukan dalam sesi ini).

## Ringkasan Eksekutif
Sistem memiliki arsitektur yang menjanjikan, namun ditemukan **beberapa cacat fatal (high severity)** pada level *orchestration* (worker) yang dapat memicu kelumpuhan sistem secara global, kebocoran keamanan dasar, dan tahap AI yang sama sekali tidak berjalan namun memberikan status sukses palsu (mock/dead stubs). 

---

## 🔴 Temuan Kritis (High Severity)

1. **Bug Katastropik pada `handleRetry` (Blast Radius Global)**
   - **Lokasi:** `apps/worker/src/core/runner.ts` (sekitar baris 260)
   - **Masalah:** Fungsi pelindung *retry* memiliki dua bug logika fatal:
     1. Pemeriksaan `if (job.attempts >= 1)` membuat penjaga aktif **segera setelah kegagalan pertama**, bukan setelah beberapa percobaan.
     2. Jika `job.process_run_id` bernilai *null* (misalnya pada tahap `triage`), kode akan mengeksekusi blok `else` yang memperbarui **SELURUH job dengan status `queued` di seluruh database** menjadi `failed`. Ini berarti satu `triage` yang gagal akan **membatalkan semua antrean AI** untuk semua pengguna.

2. **Bypass Keamanan pada Edge Function**
   - **Lokasi:** `supabase/functions/submit_contribution/index.ts`
   - **Masalah:** Terdapat pemeriksaan `if (!user.email_confirmed_at)`, namun blok ini tidak melemparkan error 403. Alih-alih, ia hanya meninggalkan komentar (`// We will strictly enforce it unless we hit issues...`) dan mengizinkan pengguna yang belum terverifikasi untuk membanjiri antrean AI dengan kontribusi.

3. **Stage `finalize` dan `character` Adalah Mock/Dead Code**
   - **Lokasi:** `apps/worker/src/stages/finalize/index.ts` & `character/index.ts`
   - **Masalah:** 
     - `finalize` hanya me-return `{ status: 'success' }`. Akibatnya, `asset_status` pada tabel `story_versions` tidak pernah diubah menjadi `ready` oleh worker, sehingga di *frontend*, cerita mungkin tidak pernah dianggap "selesai di-generate".
     - `character` memiliki komentar `// Since we don't have access to Imagen here, we mock...` dan tidak menghasilkan gambar apapun, hanya mengembalikan status sukses.

4. **Verifikasi AI Menggunakan Halusinasi (Grounding Gagal)**
   - **Lokasi:** `apps/worker/src/stages/verify/index.ts`
   - **Masalah:** Tahap ini menggunakan model `glm-4-flash` dari ZaiProvider dan mengirimkan opsi `useSearchGrounding: true`. Namun, `ZaiProvider` (`providers/zai.ts`) sama sekali tidak mengimplementasikan fitur *search grounding* dari Google, sehingga verifikasi keaslian cerita sepenuhnya bergantung pada halusinasi LLM, bukan pencarian web sungguhan.

5. **RPC `audio_only` Tidak Memicu Job Apapun**
   - **Lokasi:** `supabase/migrations/20261008000101_b13_fix_process_rpc_status.sql`
   - **Masalah:** Pada fungsi `start_ai_process_run`, ketika admin memilih mode "Audio Saja" (`p_scope = 'audio_only'`), blok SQL hanya berisi komentar `-- We'll just leave this as is for now` dan tidak menyisipkan job apapun ke dalam tabel antrean.

---

## 🟡 Temuan Menengah (Medium Severity)

1. **Kuota Anggaran Bocor karena Retry**
   - **Lokasi:** `apps/worker/src/core/budget.ts`
   - **Masalah:** Penghitungan pemakaian harian membaca dari tabel `ai_usage` namun tidak memfilter `operation_status = 'succeeded'`. Jika sebuah panggilan AI gagal dan diulang (retry), kegagalan tersebut tetap menguras kuota harian.

2. **Kebocoran Data LLM pada Log Produksi**
   - **Lokasi:** `apps/worker/src/providers/zai.ts`
   - **Masalah:** Provider Zai mencetak seluruh teks keluaran LLM menggunakan `console.log` untuk setiap panggilan, memicu polusi log yang masif dan berisiko membocorkan data sensitif jika ada.

3. **Skrip Tes Tertinggal di Produksi**
   - **Lokasi:** `apps/worker/src/jobs/tier/test-seed.ts` dan `apps/worker/src/test_zai.ts`
   - **Masalah:** File-file berisi *mock data* (seeding) dan eksperimen LLM ini masih berada di dalam *source tree* yang dibuild untuk *worker*.

4. **Shutdown Graceful Tidak Berfungsi**
   - **Lokasi:** `apps/worker/src/index.ts`
   - **Masalah:** Meskipun *runner* mengirimkan sinyal `isShuttingDown`, main loop di `index.ts` dikendalikan oleh variabel *hardcode* `const isPolling = true;`, membuat worker tidak bisa mati secara anggun (*graceful*) saat menerima SIGTERM.

5. **Dead Code di Orchestrator**
   - **Lokasi:** `apps/worker/src/orchestrator/index.ts`
   - **Masalah:** Fungsi `applyVerdict()` tertulis tetapi tidak pernah dipanggil di mana pun. Fungsi ini juga menggunakan nilai enumerasi yang salah (`'approved'`/`'rejected'` alih-alih `'succeeded'`/`'failed'`).

---

## 🟢 Temuan Ringan (Low Severity)

1. **Silent Failure Tersembunyi (Try-Catch Kosong)**
   - **Lokasi:** `canonical-master/index.ts`, `canonical-ref/index.ts`, `scene-image/index.ts`
   - **Masalah:** Terdapat konstruksi `try { ... } catch (e) {}` yang menelan *error* mentah-mentah (khususnya saat menghapus *temp files*, dan lebih parah lagi, saat gagal melakukan *fetch* gambar referensi di `scene-image` sehingga AI berjalan tanpa gambar referensi!).

2. **Hardcode Konfigurasi Prompt**
   - **Lokasi:** `apps/worker/src/stages/segment/index.ts`
   - **Masalah:** Menggunakan parameter versi statis (`prompt_version: "v1"`) alih-alih membacanya dari tabel konfigurasi `age_band_rules` secara dinamis.

3. **Penyalahgunaan Tipe `any` (Menghindari Type-Safety)**
   - **Lokasi:** Hampir di seluruh *provider* dan *stages*.
   - **Masalah:** Objek `job` selalu diketik sebagai `any`. Fungsi kritis seperti `zodToGeminiSchema(schema: any)` juga melepaskan pemeriksaan *type-safety*.

---

## 📋 Rekomendasi Action Plan (B12 / Batch Selanjutnya)

1. **Hotfix Utama (Segera):** 
   - Perbaiki `cancelPipeline`/`handleRetry` di `runner.ts`. Ganti logika agar tidak menghapus/membatalkan job yang tidak terhubung dengan `process_run_id` saat ini, dan perbaiki `job.attempts >= 1` menjadi `>= 2`.
   - Implementasikan *guard* asli di fungsi *submit_contribution* (lempar `new Response(..., { status: 403 })`).
2. **Pembersihan Logika Proses AI:**
   - Lengkapi RPC `start_ai_process_run` agar mendukung `audio_only`.
   - Hubungkan *provider* verifikasi ke model Gemini dengan fitur *Search Grounding*, atau hapus opsi `useSearchGrounding` jika tetap memakai ZAI.
   - Buat implementasi `finalize` yang sesungguhnya agar meng-update status `asset_status`.
3. **Disiplin Kode:**
   - Hapus *silent try-catch*. Gunakan *logging* yang tepat.
   - Hapus file *test* dari direktori produksi.
   - Filter `operation_status` pada kalkulasi anggaran di `budget.ts`.
