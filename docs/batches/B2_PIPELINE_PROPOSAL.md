# Proposal Pipeline Aset AI (Gambar & Suara) - REVISI

Dokumen ini berisi rancangan deterministik pipeline AI yang telah direvisi sesuai instruksi: **gaya minimalis (breathing room), variasi komposisi, dan fokus yang tidak membebani mata anak (6-12 tahun).**

## 1. Aturan Gaya Visual (style_configs.ts)

Seluruh gambar dalam aplikasi digenerate otomatis menggunakan satu gaya *anchor* utama.
- **Nama Gaya**: Buku Anak Nusantara (Revisi Minimalis)
- **Aturan Utama (Dikompilasi deterministik oleh Worker)**:
  1. **Minimalisme & Ruang Tenang**: Jangan memenuhi seluruh bidang. Sisakan ruang visual yang tenang (*negative space*); latar cukup menyiratkan tempat tanpa mengisi seluruh sudut.
  2. **Variasi Komposisi Dinamis**: AI (segment) akan menentukan jenis komposisi per halaman (ruang kosong untuk perkenalan, adegan sedang untuk dialog, panorama untuk perjalanan/latar luas, gambar besar untuk momen aksi puncak).
  3. **Warna & Pencahayaan**: Menggunakan palet dasar hangat yang menyatukan seluruh buku. Warna terang/vibrant HANYA digunakan untuk menyorot tokoh atau objek penting.
  4. **Identitas Budaya**: Detail adat hanya digenerate jika eksplisit tertulis di cerita asal. Dilarang menambahkannya secara asal atau berdasarkan sekadar koordinat provinsi.
- **Negative Prompt**: penuh, sesak, cluttered, 3d render, efek mengilap, glossy, detail dekoratif berlebihan, gaya AI generik, foto realistis, pewarnaan digital tebal.

## 2. Papan Cerita (Storyboard) "Kancil dan Buaya"

Berikut adalah simulasi *contact sheet* satu cerita pendek (6 halaman). Perhatikan bagaimana AI mengatur komposisi, emosi warna, dan *breathing room* dari halaman ke halaman tanpa mengubah identitas Kancil.

### Halaman 1 (Perkenalan Tokoh)
- **Narasi**: Suatu hari Si Kancil sedang berjalan-jalan di pinggir hutan mencari udara segar.
- **Keputusan Komposisi AI**: *Character intro with empty space.* (Vignette style).
- **Fokus Visual**: Kancil berjalan riang, cahaya pagi hangat.
- **Visual**:
![P1](file:///C:/Users/spvsales153/.gemini/antigravity/brain/cb89643d-7ad2-4f59-9dfa-22fa688c4849/kancil_p1_intro_1790212512134.jpg)

### Halaman 2 (Motivasi / Masalah Internal)
- **Narasi**: Perutnya berbunyi krucuk... krucuk... Wah, lapar. Dia membayangkan ketimun segar di seberang sungai.
- **Keputusan Komposisi AI**: *Medium shot with lots of negative space.*
- **Fokus Visual**: Kancil memegangi perut, membayangkan ketimun.
- **Visual**:
![P2](file:///C:/Users/spvsales153/.gemini/antigravity/brain/cb89643d-7ad2-4f59-9dfa-22fa688c4849/kancil_p2_hunger_1790212524099.jpg)

### Halaman 3 (Tantangan Muncul)
- **Narasi**: Namun sungai itu sangat besar dan dalam. Tiba-tiba Kancil mendapat ide dan berteriak, 'Buaya... ayo keluar!'
- **Keputusan Komposisi AI**: *Mid-shot.*
- **Fokus Visual**: Kancil di tepi sungai biru yang luas, moncong buaya perlahan muncul. Suasana sedikit tegang namun aman untuk anak.
- **Visual**:
![P3](file:///C:/Users/spvsales153/.gemini/antigravity/brain/cb89643d-7ad2-4f59-9dfa-22fa688c4849/kancil_p3_river_1790212539806.jpg)

### Halaman 4 (Rencana Berjalan)
- **Narasi**: 'Ada daging segar! Berbarislah kalian sampai ke seberang agar bisa kuhitung!' seru Kancil.
- **Keputusan Komposisi AI**: *Wide panorama layout.*
- **Fokus Visual**: Barisan buaya membentuk jembatan melintasi sungai, Kancil bersiap melompat. Cahaya siang hari yang terang.
- **Visual**:
![P4](file:///C:/Users/spvsales153/.gemini/antigravity/brain/cb89643d-7ad2-4f59-9dfa-22fa688c4849/kancil_p4_bridge_1790212594087.jpg)

### Halaman 5 (Aksi / Puncak)
- **Narasi**: Kancil segera melompat riang dari satu punggung buaya ke buaya lainnya. 'Satu, dua, tiga...'
- **Keputusan Komposisi AI**: *Dynamic action, large illustration.*
- **Fokus Visual**: Kancil melompat di udara, dinamis dan penuh energi melintasi punggung buaya.
- **Visual**:
![P5](file:///C:/Users/spvsales153/.gemini/antigravity/brain/cb89643d-7ad2-4f59-9dfa-22fa688c4849/kancil_p5_action_1790212606628.jpg)

### Halaman 6 (Resolusi)
- **Narasi**: Sesampainya di seberang, Kancil tertawa. 'Terima kasih jembatannya!' lalu ia berlari kegirangan ke kebun ketimun.
- **Keputusan Komposisi AI**: *Resolving far shot with breathing room.*
- **Fokus Visual**: Kancil berlari menjauh ke ladang hijau, buaya-buaya marah tertinggal di belakang. Cahaya sore yang hangat dan lega.
- **Visual**:
![P6](file:///C:/Users/spvsales153/.gemini/antigravity/brain/cb89643d-7ad2-4f59-9dfa-22fa688c4849/kancil_p6_resolution_1790212623234.jpg)


---
**Menunggu Persetujuan**:
Silakan periksa revisi konfigurasi gaya visual dan *contact sheet* Papan Cerita di atas. Jika Anda setuju dengan arah perbaikan ini, silakan berikan persetujuan (SPIKE OK) agar saya dapat mulai merakit *Worker* dan *Job Runner* massalnya!
