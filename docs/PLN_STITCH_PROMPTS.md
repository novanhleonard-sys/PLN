# Peta Legenda Nusantara: Prompt Stitch

Semua prompt ditulis dalam bahasa Inggris (Stitch lebih stabil), dengan teks antarmuka dalam bahasa Indonesia di dalam tanda kutip. ID layar (S01-S12) mengikuti PRD bagian 10.1.

## Cara pakai

1. Buat satu project Stitch bernama "Peta Legenda Nusantara".
2. Jalankan prompt DS-0 terlebih dahulu. Simpan hasilnya sebagai acuan gaya, lalu ekspor sebagai `DESIGN.md`.
3. Kerjakan layar berurutan mulai S02 (layar peta). Setelah S02 disetujui, jadikan acuan visual untuk layar lain.
4. Sebelum menempel tiap prompt, pilih tipe perangkat di Stitch: Mobile untuk prompt utama, lalu Web (desktop) untuk bagian "Desktop addendum".
5. Bila Stitch tidak konsisten dengan design system, tempel STYLE BLOCK di bawah ini di awal prompt.
6. Ekspor per layar (screenshot dan HTML) dengan nama seperti `S04_kartu_mobile` dan `S04_kartu_desktop`, lalu simpan di `design/screens/` di repo.
7. Layar admin (S13-S15) tidak perlu dibuat di Stitch. Agent membuatnya dari design system.
8. Peta itu sendiri tidak didesain di Stitch. Latar peta di mockup hanya placeholder. Gaya peta asli dibangun dengan kode.

## STYLE BLOCK (tempel di awal prompt bila perlu)

```text
Style: warm, rounded, children's-storybook feel that stays clean and readable for adult users. Cream background #FFF6E5, white surfaces, teal primary #2C8C99, text #2E2A26, muted text #6B625A, borders #EADFCB. Story-type colors (only for map pins and type chips): legenda #D9663F, mite #7B5EA7, fabel #4C9A5B, dongeng #E3A72F. Fonts: Fredoka for headings and buttons, Nunito for body. Card radius 16px, sheets and modals radius 24px, pill chips and buttons, soft warm shadows, 8px spacing grid, tap targets at least 44px. Simple rounded line icons, no emoji. All UI text in Indonesian.
```

---

## DS-0. Design system

```text
Create a design system and style guide for a web app called "Peta Legenda Nusantara", an interactive illustrated map of Indonesian folk tales. Users are parents and teachers who read folk tales to children, so the interface must feel warm, playful and rounded but stay clean and readable for adults. All UI text in Indonesian. No emoji anywhere; use simple rounded line icons (Lucide style).

Colors: background cream #FFF6E5; surface white #FFFFFF; primary (main buttons, links, active states) teal #2C8C99 with a darker pressed shade; ocean tint #CDEBF3; text #2E2A26; muted text #6B625A; border #EADFCB; error #C8453B; success #4C9A5B. Story-type colors used only for map pins and type chips: legenda #D9663F, mite #7B5EA7, fabel #4C9A5B, dongeng #E3A72F.

Typography: Fredoka for headings and buttons, Nunito for body text. Reading text is 18px on mobile and 20px on desktop with line-height 1.6.

Shape and depth: card radius 16px, bottom sheets and modals radius 24px, fully rounded pills for chips and buttons, soft warm shadows, 1px borders in #EADFCB, a subtle paper-texture feel, generous spacing on an 8px grid, tap targets at least 44px.

Show these components on one style guide screen: primary, secondary and text buttons (default, pressed, disabled); pill chips (four story-type colors, neutral theme chips, region chip); story card; text input and number stepper; segmented control "Baca | Dongeng"; progress bar; bottom sheet with drag handle; modal; toast; badge "Ada suara"; locked state with lock icon; circular avatar button; floating square map-style toggle button with a small map thumbnail.
```

---

## S01. Splash awan

```text
Design a splash screen for "Peta Legenda Nusantara". Full-screen sky-blue gradient covered entirely by layered, fluffy, hand-drawn style clouds in soft white and pale blue with gentle outlines. Compose the clouds as two separate groups, one on the left and one on the right, overlapping in the middle, so they can later be animated to part left and right. Centered on the clouds: the wordmark "Peta Legenda Nusantara" in Fredoka, large, warm dark text, with a small line underneath "Jelajahi cerita dari Sabang sampai Merauke". A small text link at the bottom center: "Lewati". Nothing else on the screen.
```

Desktop addendum:

```text
Same splash for a wide desktop screen. Clouds fill the width, wordmark centered and larger, "Lewati" at the bottom center.
```

---

## S02. Layar peta

```text
Design the main map screen for mobile. The map fills the entire screen. Use a soft illustrated map of the Indonesian archipelago as a placeholder background: pastel green-beige islands with rounded outlines on light blue sea with a subtle wave pattern, and a few small decorative illustrated ships and animals such as a Komodo dragon and an orangutan. No roads, no city labels.

Overlays:
- Floating rounded search bar at the top with a search icon and placeholder "Cari cerita atau daerah".
- Circular profile button at the top right.
- Vertical zoom controls (+ and -) at the bottom right with a "reset to Indonesia" button below them.
- A small square map-style toggle button at the bottom left showing a thumbnail of a watercolor-look map with the label "Lukisan".
- A floating pill button "Kontribusi" with a plus icon at the bottom center.

Show around 8 story pins spread over the islands: circular colored badges with a small icon per story type (legenda terracotta, mite purple, fabel green, dongeng yellow). Some pins have small title labels: "Malin Kundang", "Sangkuriang", "Kancil dan Buaya", "Roro Jonggrang". No bottom sheet on this screen.
```

Desktop addendum:

```text
Same screen for desktop. Floating search card at the top left (about 380px wide). Profile button and a "Kontribusi" button at the top right. Zoom controls at the bottom right. Map-style toggle at the bottom left. More pins visible, about 14, with labels on the larger ones.
```

---

## S03a. Hasil pencarian

```text
Design the search state of the map screen for mobile. The search bar is focused and contains the text "Jawa". Below it, a results list overlays the dimmed map. Section "Wilayah" with rows: "Jawa Barat" (subtitle "Provinsi"), "Jawa Tengah", "Jawa Timur". Section "Cerita" with rows that each show a small type chip, the title and the region: "Sangkuriang - Legenda - Jawa Barat", "Roro Jonggrang - Legenda - Jawa Tengah", "Jaka Tarub - Dongeng - Jawa Tengah". A clear (x) button inside the search bar. Rows are at least 56px tall.
```

Desktop addendum:

```text
Same for desktop: the results appear in a left panel about 420px wide under the search field, over the map.
```

## S03b. Daftar cerita wilayah

```text
Design the region result state for mobile. The user selected "Jawa Barat". The map is zoomed to that region and a bottom sheet at half height lists the stories in the region. Sheet header: "Jawa Barat" with subtitle "12 cerita". Below, a vertical list of story cards, each with a small square illustration thumbnail, title, a type chip and a region chip, and "3 versi" in muted text. Cards shown: "Sangkuriang" (legenda), "Nyi Roro Kidul" (mite), "Kancil dan Buaya" (fabel), "Lutung Kasarung" (dongeng).
```

Desktop addendum:

```text
Same for desktop: the list appears in a left panel about 420px wide with the region title, a collapse arrow, and a scrollable card list. The map stays visible on the right.
```

---

## S04. Kartu cerita

```text
Design the story card for mobile: a bottom sheet at half height over the map, with a drag handle. Content, top to bottom:
- Hero illustration (16:9, rounded 16px) of a boy standing at a seashore near a wooden sailing ship, storybook style, with a small badge "Dibuat AI" at its bottom left.
- Title "Malin Kundang" in Fredoka.
- Chips: type "Legenda" (terracotta) and region "Sumatera Barat".
- Synopsis, three lines: "Seorang anak nelayan merantau dan menjadi kaya, tetapi lupa pada ibunya yang menunggu di kampung."
- Up to three neutral theme chips: "Bakti pada orang tua", "Kesombongan", "Penyesalan".
- An info row with icons: "3 versi", "10 halaman", "sekitar 6 menit", and a badge "Ada suara".
- Muted small text: "Sumber: Cerita rakyat Sumatera Barat".
- Primary full-width button "Lanjut baca" and a secondary button "Simpan" with a bookmark icon.
- Text link "Punya versi lain? Kontribusikan".
```

Desktop addendum:

```text
Same card for desktop as a left panel about 420px wide, full height, scrollable, with a collapse arrow at its top right edge. The map remains visible on the right with the selected pin highlighted. Also show, as a variant, the primary button labeled "Lanjutkan halaman 4".
```

---

## S05. Pilih versi

```text
Design a "Pilih versi cerita" bottom sheet for mobile, over a dimmed reader background. Three version cards stacked vertically. Each card shows: version label, source, contributor, page count, and an audio status. Card 1: "Versi Minangkabau", "Sumber: tutur lisan, Padang", "oleh Bu Rina", "10 halaman", badge "Ada suara", and a small tag "Terakhir dibaca". Card 2: "Versi Buku Sekolah", "Sumber: Badan Bahasa", "oleh Pak Dedi", "8 halaman", badge "Ada suara". Card 3: "Versi Pesisir Utara", "Sumber: arsip daerah", "oleh Sari", "12 halaman", muted status "Suara sedang disiapkan". A text button "Batal" at the bottom.
```

Desktop addendum:

```text
Same as a centered modal about 520px wide over the dimmed reader.
```

---

## S06. Reader mode Baca

```text
Design the story reader in "Baca" mode for mobile portrait. Top bar: back arrow, story title "Malin Kundang", and a small pill button "Sesuaikan" with a sliders icon at the right. Below it, a segmented control "Baca | Dongeng" with "Baca" active. The upper part of the screen (about 45% of the height) is a storybook illustration with rounded bottom corners: a fishing village on a beach at sunrise, a boy helping his mother carry baskets, with a small badge "Dibuat AI". Below the illustration, the page text at 18px with generous line height: "Di sebuah desa nelayan di tepi pantai, hiduplah seorang anak bernama Malin Kundang bersama ibunya. Setiap hari ibunya bekerja keras agar Malin bisa makan kenyang." A fixed bottom bar with a previous button, the label "Halaman 3 dari 10" over a thin progress bar, and a next button.
```

Desktop addendum:

```text
Same reader for wide desktop (landscape): a 50/50 split. The left half is a full-height illustration. The right half holds the header (back, title, "Sesuaikan"), the segmented control "Baca | Dongeng", the page text at 20px in a comfortable measure, and at the bottom the previous and next buttons with "Halaman 3 dari 10" and a progress bar.
```

Variant (adaptasi aktif):

```text
Variant of this screen with an adaptation banner just under the header: a soft teal pill banner "Disesuaikan untuk usia 5-6 tahun (dibuat AI)" with a text link "Lihat versi asli". The page text is shorter and simpler.
```

---

## S07a. Reader mode Dongeng (memutar)

```text
Design the story reader in "Dongeng" mode for mobile portrait. The illustration fills the whole screen (full-bleed, a boy on a beach looking at a ship on the horizon). Top overlay: back arrow, title "Malin Kundang", and the segmented control "Baca | Dongeng" with "Dongeng" active. At the bottom, a translucent rounded subtitle bar with the page text at 18px: "Malin berdiri di pantai dan memandangi kapal yang berlayar jauh." Below it, playback controls: previous, a large round play/pause button (showing pause), next, a speed chip "1x", and a subtitle on/off icon button. A thin progress bar above the controls with "Halaman 3 dari 10".
```

Desktop addendum:

```text
Same for desktop: full-bleed illustration, subtitle bar centered at the bottom with a maximum width of 800px, controls beneath it.
```

## S07b. Dongeng terkunci

```text
Variant of the "Dongeng" reader screen where audio is not ready. The illustration is replaced by a soft illustrated forest background (fallback background) with a darker overlay. In the center, a rounded card with a lock icon, the title "Suara sedang disiapkan", the text "Kamu tetap bisa membaca ceritanya sekarang.", and a secondary button "Kembali ke mode Baca". Top overlay stays the same. Also show a second small variant of the card with the primary button "Buat suara" and the text "Suara untuk versi yang disesuaikan belum dibuat."
```

---

## S08a. Modal Sesuaikan usia

```text
Design a modal "Sesuaikan dengan usia" over the dimmed reader (bottom sheet on mobile). Subtitle: "Cerita akan ditulis ulang agar lebih mudah dipahami. Usia tidak disimpan." An age stepper in the middle: minus button, a large number "6", plus button, and the label "tahun". Under it, a chip preview "Disesuaikan untuk usia 5-6 tahun". A soft info box with an info icon: "Teks disusun ulang oleh AI dan bisa berbeda dari cerita asli. Kamu selalu bisa kembali ke versi asli." Buttons: primary "Sesuaikan" and text button "Batal".
```

Desktop addendum:

```text
Same as a centered modal about 480px wide.
```

## S08b. Menyesuaikan (memuat)

```text
Variant of the "Sesuaikan dengan usia" modal in a loading state: a friendly small illustration of a book with a pencil, the title "Menyesuaikan cerita...", a progress indicator, and the text "Biasanya sekitar setengah menit. Kamu bisa menutup ini dan membaca versi asli dulu." A text button "Baca versi asli".
```

---

## S09. Modal gerbang login

```text
Design a login gate modal (bottom sheet on mobile) shown when an anonymous reader reaches the free page limit. A small illustration of an open book with a small cloud at the top. Title "Masuk untuk lanjut membaca". Text: "Kamu sudah membaca halaman gratis dari 'Malin Kundang'. Masuk untuk membaca sampai selesai, menyimpan cerita, dan melanjutkan kapan saja." Buttons: a white button "Lanjutkan dengan Google" with a placeholder Google logo, a secondary button "Masuk dengan email", and a text link "Belum punya akun? Daftar". Small muted text: "Akun untuk orang tua dan guru (18 tahun ke atas)". A low-emphasis text button "Nanti saja".
```

Desktop addendum:

```text
Same as a centered modal about 460px wide.
```

---

## S10a. Daftar

```text
Design the sign-up screen for mobile. Wordmark "Peta Legenda Nusantara" at the top. Tabs "Masuk | Daftar" with "Daftar" active. Fields: "Nama tampilan", "Email", "Kata sandi" with a show/hide icon. Checkbox: "Saya berusia 18 tahun ke atas dan menyetujui Ketentuan dan Kebijakan Privasi" (the two names as links). Primary button "Daftar". A divider "atau", then a white button "Lanjutkan dengan Google". Small muted note: "Akun ini untuk orang tua atau guru. Kami tidak menyimpan data anak."
```

Desktop addendum:

```text
Same as a centered card about 440px wide on a cream background with a few soft cloud illustrations in the corners.
```

## S10b. Cek email

```text
Variant screen after sign-up: an illustration of an envelope with a small cloud, title "Cek emailmu", text "Kami mengirim tautan verifikasi ke ria@contoh.id. Buka tautan itu untuk mulai menyimpan dan menyumbang cerita.", a secondary button "Kirim ulang email" and a text link "Kembali ke peta".
```

---

## S11a. Profil: Riwayat

```text
Design the profile screen for mobile. Header: circular avatar with initials "BR", display name "Bu Rina", a text button "Keluar". Tabs: "Riwayat | Tersimpan | Kontribusi saya | Preferensi" (scrollable) with "Riwayat" active. Section "Lanjutkan membaca": vertical cards, each with a square illustration thumbnail, title, a type chip, a thin progress bar with "Halaman 4 dari 10", and a small primary button "Lanjutkan". Cards: "Malin Kundang" (legenda), "Kancil dan Buaya" (fabel, "Halaman 2 dari 8"), "Timun Mas" (dongeng, "Selesai", with a check icon and the button "Baca lagi").
```

Desktop addendum:

```text
Same for desktop: a centered content column of about 880px, cards in a two-column grid.
```

## S11b. Profil: Tersimpan

```text
Variant of the profile screen with "Tersimpan" active: a grid of story cards (2 columns on mobile), each with an illustration, title, a type chip and a filled bookmark icon button at its top right to remove it from saved. Show 6 cards.
```

## S11c. Profil: Kontribusi saya

```text
Variant of the profile screen with "Kontribusi saya" active: a list of contribution rows, each with the story title, the version label and a status chip. Show: "Sangkuriang - Versi Kasunanan" with chip "Diterima" (green); "Asal Usul Danau Toba - Versi Batak Toba" with chip "Diperiksa" (teal); "Cerita Baru" with chip "Perlu tinjauan admin" (amber); "Kisah Puteri Hijau" with chip "Ditolak" (soft red), an expandable reason "Sumber belum cukup jelas. Tambahkan minimal satu sumber tertulis atau narasumber." and a button "Kirim ulang". A floating button "Tambah kontribusi".
```

## S11d. Profil: Preferensi

```text
Variant of the profile screen with "Preferensi" active. Section "Gaya peta default": two selectable cards with map thumbnails, "Kartun" (selected) and "Lukisan". Section "Akun": a text row "Ketentuan dan Kebijakan Privasi". A separated danger area at the bottom: "Hapus akun" with the explanation "Semua simpanan dan riwayat baca akan dihapus. Cerita yang kamu sumbangkan tetap tampil tanpa nama." and a red outlined button "Hapus akun".
```

---

## S12a. Form kontribusi: langkah 1

```text
Design step 1 of a multi-step contribution form for mobile. A stepper at the top: "Info, Teks, Sumber, Hak, Tinjau" with step 1 active. A soft info banner: "Menambah versi untuk: Malin Kundang" (show as a dismissible banner). Fields: "Judul cerita"; "Jenis cerita" as four selectable cards, each with a colored icon and a one-line helper: Legenda (asal-usul tempat atau tokoh), Mite (dewa dan makhluk gaib), Fabel (tokoh hewan), Dongeng (cerita rakyat umum); "Provinsi" dropdown; "Kabupaten/Kota" dropdown; an optional row "Tentukan titik lokasi di peta" with a small map preview placeholder and a pin; "Label versi" with helper "Contoh: Versi Kasunanan". Bottom buttons: "Batal" and primary "Lanjut".
```

Desktop addendum:

```text
Same for desktop: a centered form card about 720px wide, the four story-type cards in a single row, the stepper as a horizontal bar.
```

## S12b. Form kontribusi: sumber dan hak

```text
Design steps 3 and 4 of the contribution form on one screen for mobile, with the stepper showing "Sumber" active. Section "Sumber cerita": two source entry cards, each with a "Jenis" dropdown (Buku, Arsip, Web, Lisan/narasumber), "Sitasi atau URL", and "Penulis dan tahun", with a remove icon; a text button "Tambah sumber". Section "Pernyataan hak" with two checkboxes: "Ini adalah ceritaan ulang dengan kata sendiri atau berstatus domain publik" and "Saya setuju konten ini dilisensikan CC BY-SA 4.0 dengan atribusi". Bottom buttons: "Kembali" and primary "Lanjut".
```

## S12c. Detail status kontribusi

```text
Design a contribution status detail screen for mobile. Header: "Sangkuriang - Versi Kasunanan". A vertical timeline with four steps: "Dikirim", "Diperiksa AI", "Tinjauan", "Diterima", with the first two completed (check icons), the third current (highlighted, label "Perlu tinjauan admin") and the last upcoming. Under the timeline, a card "Hasil pemeriksaan" with the text "Cerita sesuai dengan tipe legenda yang dikenal. Sumber perlu dilengkapi." Below it, a rejected variant of the same screen with a soft red card "Ditolak" showing the reason and a primary button "Kirim ulang dengan perbaikan".
```
