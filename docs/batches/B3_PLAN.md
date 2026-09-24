# Rencana Eksekusi Batch B3 (Reader dan Auth UI)

## Status Saat Ini
Fase A (Shell dan fondasi) telah selesai. Data layer, routing, dan fondasi useAuth telah diimplementasikan beserta RLS yang berfungsi penuh. Layar login diubah hanya menggunakan otentikasi Google berdasarkan permintaan pengguna.

## Fase B: Tiga Sub-Agent Paralel

### Sub-Agent B1: Auth UI & Modal Gerbang
**Direktori yang dimiliki:** pps/web/src/features/auth/, pps/web/src/features/story-card/ (perubahan terbatas)
- Mengabaikan instruksi PRD untuk mendaftarkan email/password (sesuai instruksi khusus pengguna sebelumnya: 'Tetap gunakan Google sebagai satu-satunya cara masuk').
- Membangun komponen Modal Gerbang (S09): *bottom sheet* di mobile, modal di desktop.
- Modal ini digunakan untuk: tombol Simpan, batas halaman baca, dll.
- Integrasi tombol Simpan di StoryCard.tsx yang memicu Modal Gerbang bila pengguna anonim, dan menyimpan ke Supabase (saved_stories) jika login.

### Sub-Agent B2: Mode Baca & Riwayat
**Direktori yang dimiliki:** pps/web/src/features/reader/baca/, pps/web/src/features/reader/versions/, pps/web/src/routes/Baca.tsx
- Implementasi Mode Baca (S06): header judul, tombol 'Sesuaikan', *segmented control* (Baca/Dongeng). Tipografi (18px mobile, 20px desktop).
- Implementasi Pilih Versi (S05): Pemilihan adaptasi. Tawarkan 'Lanjutkan versi X halaman N' jika ada riwayat.
- Logika Gerbang: mendeteksi limit dari data halaman (RLS otomatis membatasi array). Saat currentPage >= free_page_limit, tampilkan Modal Gerbang S09.
- Implementasi Riwayat: upsert ke ead_history secara reaktif (debounce 2 detik) saat membalik halaman (hanya bagi pengguna login).
- Tampilkan indikator "Lanjutkan halaman N" di Kartu Cerita.

### Sub-Agent B3: Mode Dongeng
**Direktori yang dimiliki:** pps/web/src/features/reader/dongeng/
- Implementasi Mode Dongeng (S07a): gambar satu layar penuh (*fullscreen*) dengan gerak efek *Ken Burns* (pan dan zoom pelan) via Framer Motion secara deterministik berdasarkan id halaman.
- Kontrol audio: elemen HTMLAudio untuk audio halaman. Putar/jeda, sebelumnya/berikutnya, kontrol kecepatan (0.8x, 1x, 1.2x), teks subtitel opsional. Audio secara otomatis melompat ke halaman selanjutnya setelah selesai diputar.
- Mode Terkunci (S07b): muncul gembok dan status "Suara sedang disiapkan" bila udio_status != 'ready'.
- Aksesibilitas: Matikan efek gerak bila prefers-reduced-motion aktif.

## Fase C: Reviewer
Agent tunggal akan memverifikasi hasil dengan UI/UX yang diminta dan gerbang PRD, memberikan screenshot, lalu menutup sesi B3.
