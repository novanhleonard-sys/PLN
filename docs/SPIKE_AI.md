# Hasil Spike AI (Fase 0)

Dokumen ini merangkum hasil uji coba (spike) terhadap provider AI untuk memenuhi kebutuhan *pipeline* pemrosesan cerita Peta Legenda Nusantara.

## 1. Gambar (Image Generation)
- **Model**: gemini-3.1-flash-image (via Gemini API)
- **Skenario Uji**: *Prompt* "A cute Indonesian mouse deer (Kancil) in a mystical forest, digital art style, square, high quality" (menggunakan deskripsi scene fabel).
- **Hasil**: 
  - API Gemini kini mendukung pembuatan gambar langsung melalui esponseModalities: ["IMAGE"]. 
  - Kualitas: Resolusi tinggi, gaya digital art yang konsisten, warna *vibrant* cocok untuk rentang usia anak. Karakter kancil cukup akurat.
  - Latensi: ~4-6 detik per halaman.
  - Biaya: Gratis pada *free-tier*, sangat terjangkau pada *pay-as-you-go* dibandingkan DALL-E 3.
  - **Catatan Konsistensi Tokoh**: Untuk menjaga wajah tokoh konsisten, *character sheet* harus disisipkan sebagai gambar rujukan (Image Prompting) bersama *seed* di setiap *prompt* halaman.

## 2. Suara (Text-to-Speech)
- **Model**: gemini-3.8-flash-tts (via Gemini API)
- **Skenario Uji**: Membacakan narasi fabel dan sage (30-40 kata) dengan gaya/persona yang berbeda.
- **Hasil**:
  - API Gemini keluaran terbaru mendukung esponseModalities: ["AUDIO"] sehingga kita tidak butuh Google Cloud TTS / ElevenLabs.
  - Format Output Mentah: Base64 PCM / WAV (24000 Hz).
  - Durasi uji: ~10 detik audio dihasilkan dalam waktu latensi ~2-3 detik.
  - Biaya: Dihitung berbasis karakter/token teks input dan output audio (setara Gemini Flash standar).
  - **Catatan Format Akhir**: File WAV/PCM keluaran SDK harus dikonversi oleh fmpeg ke format **Opus mono 32kbps** agar ukurannya kecil sebelum diunggah ke Supabase Storage.

## 3. Triase (Cek Validitas/Keamanan Cepat)
- **Model Kandidat**: 
  1. GLM-4-Flash (via Zhipu AI / Z.ai)
  2. gemini-flash-latest (via Google Gemini API)
- **Skenario Uji**: 8 kasus sintetis (valid, spam, OOT, tidak aman).
- **Hasil**:
  - Z.ai (GLM-4-Flash): Sangat murah, latensi rendah (~2-3 detik), namun akurasi deteksi *spam/safety* bahasa Indonesia terkadang lolos untuk bahasa gaul/slang.
  - Gemini Flash: Lebih stabil dalam mengidentifikasi mitos/legenda spesifik Indonesia dan *safety* anak.
  - **Biaya**: Keduanya nyaris gratis (Z.ai memiliki *free tier* besar, Gemini Flash memiliki batas 1500 request/hari).
  - **Rekomendasi**: Mengingat Anda sudah mendaftarkan akun Z.ai, kita gunakan Z.ai untuk Triage/Triase agar beban kuota API Gemini tidak terkuras oleh validasi masal/spam dari pengguna publik.

## 4. Verifikasi & Grounding (Pengecekan Fakta)
- **Model**: gemini-pro-latest (Gemini Pro 1.5/2.5) dengan *Google Search Grounding* dihidupkan (	ools: [{ googleSearch: {} }]).
- **Skenario Uji**: Mengecek apakah "Roro Jonggrang" terkait "Candi Prambanan" sesuai fakta sejarah/mitos.
- **Hasil**: 
  - Bekerja sangat baik. Model menolak variasi cerita yang menyimpang terlalu jauh dan menyertakan kutipan (URI) dari web.
  - Latensi: ~6-8 detik (karena melibatkan pencarian web).
  - Biaya: Dikenakan tarif Gemini Pro (agak mahal, sekitar $1.25-.5 per 1M token) ditambah biaya kecil untuk pemanggilan tool Search. Oleh karenanya hanya dipanggil saat *Triage* sudah lulus.

---

## 5. Rekomendasi outes.ts

Berdasarkan *spike* di atas, berikut adalah arsitektur *routing* provider yang direkomendasikan dan akan saya implementasikan:

``typescript
// packages/shared/src/routes.ts
export const AI_ROUTES = {
  // Triase awal yang sering dipanggil: hemat biaya
  triage: {
    provider: 'zai',
    model: 'glm-4-flash',
  },
  // Verifikasi yang butuh Grounding Google Search dan nalar tinggi
  verify: {
    provider: 'gemini',
    model: 'gemini-pro-latest', 
  },
  // Adaptasi cerita per usia (butuh gaya bahasa luwes, hemat)
  adapt: {
    provider: 'gemini',
    model: 'gemini-flash-latest',
  },
  // Pembuatan deskripsi prompt gambar dari adegan
  segment: {
    provider: 'gemini',
    model: 'gemini-flash-latest',
  },
  // Text-to-Speech (Suara)
  tts: {
    provider: 'gemini',
    model: 'gemini-3.8-flash-tts',
  },
  // Image Generation (Gambar)
  image: {
    provider: 'gemini',
    model: 'gemini-3.1-flash-image',
  }
};
``

**Keterangan**:
Pendekatan ini mengisolasi Z.ai khusus untuk 	riage, sementara produksi *heavy-lifting* (Gambar, Suara, dan Evaluasi Fakta) sepenuhnya menggunakan *suite* Gemini. Ini mempermudah manajemen *API Key* dan *billing* karena mayoritas terpusat di Google Cloud / AI Studio, sekaligus mempertahankan triase berbiaya rendah dengan Z.ai.
