# B12_PLAN: Perbaikan Hasil Audit Worker & Ekosistem PLN

Sesuai persetujuan pengguna untuk menyelesaikan semua temuan kritis, menengah, dan ringan dari tinjauan audit. Kita akan fokus membereskan *dead code*, mengamankan logika *retry*, dan beralih sepenuhnya ke ekosistem **Gemini 3.1 Flash Lite** (termasuk *Search Grounding*).

## Fase 1: Pembersihan Provider & Persiapan Database (ZAI -> Gemini)
1. Buat **migrasi Supabase baru** untuk memperbarui RPC `start_ai_process_run` agar mengantrekan `audio` pada `scope = 'audio_only'`.
2. Hapus total model **Z.ai** (`providers/zai.ts`) dan hapus referensinya dari `registry.ts` dan `shared/src/ai/routes.ts`.
3. Ganti konfigurasi *routing* di `triage` dan `verify` untuk menggunakan `gemini-3.1-flash-lite`.

## Fase 2: Perbaikan Bug Katastropik & Keamanan Dasar
1. **Runner Guardrail (`runner.ts`)**: 
   - Tetap biarkan batas *fail-fast* pada percobaan pertama (`job.attempts >= 1`) sesuai persetujuan ("masih uji coba").
   - **Perbaikan Kritis:** Hapus blok `else` yang membatalkan seluruh *job* global jika `process_run_id` bernilai `null` (seperti saat *triage*). Hanya batalkan *job* dalam satu sesi proses (*sibling jobs*).
2. **Keamanan Edge Function (`submit_contribution`)**:
   - Jika `!user.email_confirmed_at`, fungsi **wajib** melemparkan `new Response("Forbidden", { status: 403 })`. Tidak ada toleransi *bypass*.
3. **Kebocoran Budget (`budget.ts`)**:
   - Perbarui perhitungan untuk hanya menjumlahkan *usage* dari *record* yang berstatus `succeeded`, sehingga kegagalan berulang tidak menghabiskan kuota.

## Fase 3: Pembersihan Dead Code & Mock AI
1. Hapus `character/index.ts` dan skrip-skrip tes lokal (`test-seed.ts`, `test_zai.ts`).
2. Tulis ulang `finalize/index.ts` agar mengubah kolom `asset_status` pada tabel `story_versions` menjadi `'ready'`.
3. Hapus fungsi yang tidak terpakai (`applyVerdict`) di Orchestrator dan paket *shared*.

## Fase 4: Grounding & Perbaikan Terakhir
1. **Search Grounding (`verify/index.ts`)**: Pastikan pemanggilan Gemini 3.1 Flash Lite menggunakan alat koneksi pencarian Google secara aktif.
2. **Graceful Shutdown (`index.ts`)**: Ganti *hardcode* `const isPolling = true;` agar membaca state `runner.isShuttingDown()` sehingga Worker dapat mati dengan aman.
3. Bersihkan blok penangkap *error* yang ditutupi (*silent catch*) pada saat menghapus *file temporary* (`canonical-master`, `canonical-ref`, `scene-image`).

---
Mohon ketik **SETUJU** untuk saya mulai bekerja sesuai urutan di atas secara otomatis dengan akses langsung ke codebase.
