# Peta Legenda Nusantara — pengganti alur Stitch

Letakkan file ini di root repo, sejajar dengan `AGENTS.md`, sebelum B0.5. Berlaku untuk B0.5 dan setiap batch UI setelahnya. B0, database, kontrak, cakupan fitur, dan urutan batch tetap mengikuti dokumen semula.

## Prioritas instruksi

Untuk sumber dan proses **desain UI saja**, file ini menggantikan instruksi yang mewajibkan hasil Stitch dalam `AGENTS.md`, `MULAI.md`, `docs/PLN_PRD_v1.md` bagian 10.3, serta `docs/batches/B05_SPEC.md`, `B1_SPEC.md`, `B3_SPEC.md`, `B4_SPEC.md`, dan `B5_SPEC.md`. Ketentuan teknis, fitur, keamanan, pengujian, dan titik persetujuan lain tetap berlaku. `docs/PLN_STITCH_PROMPTS.md` dibaca sebagai **brief tertulis untuk layar**, bukan instruksi memakai Stitch.

| Sebelumnya | Menjadi |
| --- | --- |
| Buat desain di Stitch lalu ekspor `DESIGN.md`, HTML, dan screenshot | Antigravity merancang langsung di kode; menulis `design/DESIGN.md` sendiri dan mengambil screenshot hasil aplikasi untuk QA. |
| B0.5 berhenti jika `design/DESIGN.md` atau screenshot Stitch tidak ada | Ketiadaan keduanya adalah kondisi awal. Buat `DESIGN.md` berdasarkan PRD 10.2 dan brief DS-0; lanjut tanpa screenshot Stitch. |
| Wajib ada S01–S12 di `design/screens/` sebelum batch terkait | ID S01–S12 merujuk brief teks di `docs/PLN_STITCH_PROMPTS.md`. Folder `design/screens/` tidak menjadi prasyarat. |
| Bandingkan UI dengan screenshot Stitch | Bandingkan dengan `design/DESIGN.md`, brief layar, PRD, dan hasil yang tampil pada 390 px serta 1280 px. Simpan screenshot implementasi di `docs/qa/Bx/`. |
| Desain hasil Stitch menang atas PRD untuk tampilan | `design/DESIGN.md` yang disetujui pada B0.5 menjadi acuan konsistensi visual. PRD tetap acuan perilaku, data, isi, dan batasan teknis. |

## B0.5 — setelah B0 selesai

1. Baca `AGENTS.md`, `docs/STATE.md`, `docs/batches/B05_SPEC.md`, PRD bagian 10.2–10.3 dan 12, serta STYLE BLOCK, DS-0, dan S02 dalam `docs/PLN_STITCH_PROMPTS.md`. S02 memberi konteks komponen peta; implementasi petanya tetap B1.
2. Tulis `docs/batches/B05_PLAN.md` sesuai protokol repo, lalu tunggu `SETUJU`. Catat dalam rencana bahwa prasyarat visual Stitch digantikan oleh file ini.
3. Susun `design/DESIGN.md` sendiri: token warna, tipografi, spacing, radius, bayangan, ikon, aturan responsif, state komponen, contoh layout, aksesibilitas. Arah awal: krem `#FFF6E5`, putih `#FFFFFF`, teal `#2C8C99`, laut `#CDEBF3`, teks `#2E2A26`, teks redup `#6B625A`, border `#EADFCB`, error `#C8453B`, sukses `#4C9A5B`. Warna cerita hanya untuk pin/chip: legenda `#D9663F`, mite `#7B5EA7`, fabel `#4C9A5B`, dongeng `#E3A72F`. Fredoka untuk judul/tombol, Nunito untuk isi; teks baca 18 px mobile dan 20 px desktop dengan line-height 1.6. Grid 8 px, radius kartu 16 px, sheet/modal 24 px, target sentuh minimal 44 px, ikon garis membulat, tanpa emoji, teks UI bahasa Indonesia. Penuhi kontras AA; bila perlu sesuaikan warna teks pada permukaan berwarna.
4. Implementasikan token, komponen, dan `/styleguide` dalam batas kepemilikan B05. Tampilkan varian tombol (default, pressed, disabled, loading), chip cerita/tema/wilayah, kartu, input, stepper, segmented control `Baca | Dongeng`, progress bar, sheet, modal, toast, badge `Ada suara`, locked state, avatar, dan toggle gaya peta. Pakai React dengan props/state; tidak perlu backend dan jangan membuat layar fitur pada tahap ini.
5. Perlihatkan `/styleguide` pada 390 px dan 1280 px, simpan screenshot dan review di `docs/qa/B05/`, lalu minta persetujuan arah visual atau revisi. Boleh tawarkan dua varian desain sebelum memfinalkan `DESIGN.md`, tetapi finalnya satu arah yang disetujui. Selesaikan gerbang B05 yang lain seperti semula.

## Batch UI berikutnya

Baca tiap brief layar yang relevan di `docs/PLN_STITCH_PROMPTS.md` termasuk desktop addendum sebagai deskripsi hierarki, teks contoh, dan responsive layout. Terjemahkan menjadi React dengan `design/DESIGN.md`. Jika brief menyebut perilaku atau keadaan yang baru dijadwalkan pada batch berikutnya, tetap ikuti batas batch dalam spesifikasi. Ilustrasi dalam prompt adalah arahan gaya, bukan aset yang sudah tersedia; gunakan ketentuan aset/placeholder dalam spesifikasi.

| Batch | Brief | Penerapan |
| --- | --- | --- |
| B1 | S01, S02, S03a, S03b, S04 | Splash, peta, pencarian, daftar wilayah, kartu cerita. Peta asli mengikuti PRD/B1; peta dalam brief S02 hanya placeholder visual. |
| B3 | S05, S06, S07a, S07b, S09, S10a, S10b | Pilih versi, reader, gerbang login, autentikasi. Varian adaptasi S06 baru aktif di B5. |
| B4 | S11a–S11c, S12a–S12c | Profil, kontribusi, status. Admin dibuat dari design system dan PRD. |
| B5 | S08a, S08b, varian adaptasi S06, S11d | Adaptasi usia dan preferensi. |

Reviewer tiap batch membandingkan implementasi dengan brief teks, `design/DESIGN.md`, dan PRD, menulis hasil di `docs/qa/Bx/REVIEW.md`. Jangan membuat screenshot tiruan atau mengklaim ada desain Stitch. Gerbang teknis dan keputusan pengguna lain tetap berlaku.

## Prompt untuk menggantikan prompt B0.5 di `MULAI.md`

```text
Kamu mengerjakan Batch B0.5 Peta Legenda Nusantara. Baca AGENTS.md, docs/STATE.md, docs/batches/B05_SPEC.md, bagian PRD yang dirujuk, lalu PLN_ANTIGRAVITY_DESIGN_OVERRIDE.md. Untuk instruksi desain yang bertentangan, ikuti file override tersebut. docs/PLN_STITCH_PROMPTS.md adalah brief teks, bukan prasyarat ekspor Stitch. Tulis docs/batches/B05_PLAN.md dan tunggu "SETUJU". Setelah itu rancang design/DESIGN.md sendiri, implementasikan token/komponen dan /styleguide, tampilkan pada 390 px dan 1280 px untuk persetujuan sebelum menutup batch. Jangan kerjakan layar fitur atau batch berikutnya. Ikuti protokol AGENTS.md termasuk "AKHIRI SESI".
```

Pada setiap prompt batch UI berikutnya di `MULAI.md`, tambahkan satu kalimat: **"Baca PLN_ANTIGRAVITY_DESIGN_OVERRIDE.md; gunakan brief layar di docs/PLN_STITCH_PROMPTS.md dan design/DESIGN.md; abaikan syarat screenshot/ekspor Stitch."**
