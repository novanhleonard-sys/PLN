# Known Issues

Dokumen ini melacak masalah yang diketahui (known bugs) atau batasan teknis di aplikasi.

## 1. Lingkungan Pengembangan (Development)
- **Vitest/Rolldown native binding di Windows**: Terdapat bug pada npm terkait native binding Vitest/Rolldown di OS Windows. Masalah ini bersifat lokal pada saat *development* dan tidak menghalangi fitur utama.

## 2. API Provider dan Limitasi AI
- **Gemini API Rate Limits**: Jika aplikasi melebihi kuota harian atau kuota per menit untuk model `gemini-3.6-flash`, job AI dapat mengalami galat 429. Worker telah diatur untuk melakukan retry otomatis.
- **Model Z.ai JSON Output**: Model dari provider Z.ai (terutama versi murah yang digunakan untuk triase) terkadang menghasilkan struktur JSON yang tidak valid. Hal ini telah ditangani dengan *prompting* eksplisit dan mekanisme *retry* pada pipeline.

## 3. UI/UX
- *Tambahkan bug minor di UI/UX di sini bila ditemukan selama pengujian manual B6.*
