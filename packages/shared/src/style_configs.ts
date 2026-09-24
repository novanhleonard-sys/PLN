// packages/shared/src/style_configs.ts

export const STYLE_CONFIGS = {
  main: {
    name: "Buku Anak Nusantara (Revisi Minimalis)",
    description: "Ilustrasi buku cerita anak (usia 6-12), bentuk tokoh dan tempat mudah dikenali, garis pensil warna halus, sapuan cat air ringan, sedikit tekstur kertas. Palet dasar hangat yang menyatukan buku.",
    rules: [
      "Jangan memenuhi seluruh bidang. Sisakan ruang visual yang tenang (breathing room/negative space); latar cukup menyiratkan tempat tanpa mengisi seluruh sudut.",
      "Komposisi ditentukan oleh AI per halaman: ruang kosong untuk perkenalan tokoh, adegan sedang untuk aksi/percakapan, panorama untuk perjalanan, gambar besar untuk momen puncak.",
      "Pencahayaan dan warna berubah mengikuti waktu/emosi. Warna terang HANYA digunakan untuk mengarahkan perhatian ke tokoh/objek penting, bukan menjenuhkan gambar.",
      "Tokoh dan garis harus konsisten antar halaman. Identitas budaya hanya dimasukkan jika ada di teks asli; JANGAN menambahkan atribut adat/suku secara otomatis."
    ],
    negative_prompt: "penuh, sesak, cluttered, 3d render, efek mengilap, glossy, detail dekoratif berlebihan, gaya AI generik, foto realistis, pewarnaan digital tebal, saturasi tinggi di seluruh bidang, elemen budaya asing"
  }
};
