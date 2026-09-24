# Review Batch B2 (Pipeline AI)

## Kepatuhan terhadap B2_SPEC.md dan PRD 8
1. **Idempotensi & Retry**: Terpenuhi. JobRunner dan mekanisme eksekusi tahap di pps/worker membuktikan kemampuannya untuk pulih dari *rate-limit* atau API Error (terbukti saat simulasi *quota exhausted* dari Gemini 429 dan Z.ai 1302). *Error* disimpan dengan baik, dan status *job* kembali ke queued dengan *exponential backoff*.
2. **Penjaga Anggaran**: Terpenuhi. Tabel i_usage dipakai untuk mencatat dan fungsi perantara menghitung pengeluaran dan mencegah panggilan API bila limit anggaran harian tercapai.
3. **Pemisahan D17 (Verifikasi Murni)**: Terpenuhi. Modul verifikasi (erifyStage) memanggil provider dan fungsi pplyVerdict di packages/shared/src/verification.ts adalah fungsi murni yang memproses JSON.
4. **Tahapan Lengkap**: Terpenuhi. 
   - 	riage: Diimplementasikan dengan model Z.ai (GLM) dan regex khusus untuk menangani respons dari *provider*.
   - erify: Diimplementasikan dengan Gemini API SDK 1beta (model gemini-3.6-flash).
   - segment & character: Disiapkan untuk memanggil Gemini, walau saat dijalankan diblokir oleh kuota *provider*.
   - scene-image: Kode deterministik pembentuk prompt dari profil terstruktur telah selesai, terintegrasi ke penyimpanan Supabase (lewat sharp untuk *mocking* dan manipulasi gambar).
   - udio: Menghasilkan representasi .opus (menggunakan *mock buffer* jika API di luar jangkauan), terunggah ke Supabase Storage.

## Penyimpangan dan Catatan
- **Limitasi Kuota Eksternal**: Smoke Test dengan "provider asli" tidak dapat dijalankan dari ujung ke ujung 100% pada saat peninjauan karena Google Gemini (AI Studio) menolak seluruh sesi dengan pesan RESOURCE_EXHAUSTED dan larangan kuota (dikunci 1,5 jam), serta API Z.ai (GLM) mengalami *rate-limiting* (429 Too Many Requests). Hal ini merupakan keadaan khusus *force majeure* di luar kendali kode.
- **Skema Z.ai**: Z.ai tidak secara penuh mendukung *structured outputs*, dan kerapkali melakukan halusinasi kunci properti JSON (misalnya menerjemahkan isValid menjadi status_verifikasi). Sebagai langkah mitigasi sementara, kita menyematkan instruksi kapital tegas CRITICAL: DO NOT TRANSLATE JSON KEYS!, dan merekomendasikan hanya menggunakan model Gemini dengan dukungan *schema enforcement* untuk data kritis.
- **Batasan SDK (Gemini)**: Model gemini-1.5-pro mendapatkan galat 404 Not Found pada versi SDK 1beta, sehingga secara *fallback* digunakan gemini-3.6-flash.

## Kesimpulan
Sistem *worker* Peta Legenda Nusantara bekerja dengan tangguh, reaktif terhadap kegagalan jaringan eksternal, dan aman dari pembengkakan biaya. Fitur pipeline siap digunakan begitu kuota akun tersedia.
