# Opsi Deployment: Peta Legenda Nusantara

Proyek Peta Legenda Nusantara memiliki dua komponen utama yang harus di-*deploy* ke produksi:
1. **Aplikasi Web (Frontend)**: SPA React/Vite yang membutuhkan hosting statis dengan dukungan routing sisi klien (fallback index.html).
2. **Worker AI (Backend Node.js)**: *Long-running process* yang terus-menerus mengambil antrean dari Supabase jobs (via pub/sub atau polling), memanggil API AI eksternal (Gemini/Z.ai), memproses teks, dan membutuhkan pustaka biner khusus seperti **ffmpeg** (untuk audio) dan **sharp** (untuk pemrosesan gambar C-Pitung/S-Kancil).

Berikut adalah perbandingan lingkungan *hosting* untuk kedua komponen tersebut:

## A. Opsi Host Worker (Backend)

Karena Worker menjalankan tugas intensif (*generate* gambar, merakit *audio* dengan ffmpeg) dan prosesnya bisa memakan waktu bermenit-menit per *job*, kita tidak bisa menggunakan *Serverless Functions* biasa (yang biasanya dibatasi maksimal 10-30 detik atau memory ketat). Kita butuh penampung (container) atau VPS.

| Penyedia | Biaya (Perkiraan) | Kemudahan (*Developer Experience*) | Dukungan ffmpeg/sharp | Catatan untuk *Long-running process* |
| --- | --- | --- | --- | --- |
| **Fly.io** | ~/bulan (RAM 256/512MB) | Sangat mudah. Cukup satu ly.toml dan Dockerfile. | Ya (bisa di-*install* lewat Dockerfile). | Sangat cocok. Mesin *always-on* tersedia, dan *scale-to-zero* bisa dimatikan. |
| **Render** | ~/bulan (Background Worker) | Sangat mudah. Integrasi langsung dari GitHub. | Ya (menggunakan opsi *Docker environment*). | Sangat cocok. Jenis layanan *Background Worker* di Render dirancang khusus untuk ini. |
| **Railway** | ~/bulan (Berbasis penggunaan aktual) | Mudah. | Ya (menggunakan Dockerfile atau Nixpacks). | Sangat cocok. Tidak pernah tidur bila dikonfigurasi demikian. |
| **VPS (DigitalOcean/Linode)** | ~ - /bulan (1GB RAM) | Sedang. Harus *setup* Docker, sistem operasi, dan auto-restart (systemd) sendiri. | Bebas sepenuhnya (akses root penuh). | Sangat cocok, performa lebih konsisten dan stabil untuk komputasi berat. |

**Rekomendasi Host Worker:** **Render** (karena tipe *Background Worker*-nya sangat mudah diatur dan stabil) ATAU **Fly.io** (karena Docker-nya ringan dan deployment cepat).

## B. Opsi Host Web (Frontend)

| Penyedia | Biaya | Kemudahan | Performa Global |
| --- | --- | --- | --- |
| **Vercel** | Gratis (Hobby tier) | Sangat Mudah. Otomatis mengenali Vite, out-of-the-box routing SPA. | Sangat Cepat (Global Edge Network) |
| **Cloudflare Pages** | Gratis (Kapasitas tinggi) | Sangat Mudah. | Sangat Cepat (Terbaik untuk aset statis) |
| **Supabase Hosting** | - (Belum matang) | - | - |

**Rekomendasi Host Web:** **Vercel** (paling mulus untuk integrasi Vite/React).

---

## Keputusan yang Dibutuhkan

Sebelum melangkah ke tahap setup infrastruktur CI/CD dan kredensial produksi, harap balas dengan pilihan spesifik Anda dengan format:

HOST: [Pilihan Worker], [Pilihan Web]
*Contoh: HOST: Render, Vercel*
