# Rencana Perbaikan UI StoryCard & Info Peta

## Tujuan
Memperbaiki bug visual pada Chip wilayah, menyesuaikan struktur informasi pada kartu cerita sesuai permintaan pengguna, merestrukturisasi layout kartu cerita agar persis dengan desain referensi, dan mengembalikan gaya tombol.

## Langkah-Langkah

### 1. Perbaikan `MainMap.tsx` & `useStories.ts`
- **MainMap.tsx**: Memastikan tidak ada *error* atau dependensi yang terlewat. (Saat ini sudah stabil di commit terakhir).
- **useStories.ts**: 
  - Menambahkan *fetching* kolom `asset_status` dari tabel `story_versions` agar bisa mendeteksi apakah Mode Dongeng sudah *ready* (Tersedia) atau belum.
  - Menyimpan informasi jumlah versi (`versionCount`) ke dalam tipe data `StoryPin`.

### 2. Restrukturisasi Layout `StoryCard.tsx`
- **Cover Image Full Bleed**: Menghapus `p-6` dari kontainer utama `<SidePanel>` agar gambar sampul bisa memenuhi bagian atas panel tanpa jarak/margin.
- **Efek Overlay Melengkung**: Menambahkan div konten berwarna putih dengan kelas `rounded-t-3xl -mt-6 p-6 relative z-10` agar menutupi bagian bawah gambar (memberikan efek kartu yang tumpang tindih dengan gambar).
- **Perbaikan Chip Lingkaran Kosong**: Membungkus `<Chip type="region">` dengan pengecekan kondisional `{story.region && ...}` agar tidak me-render lingkaran kosong jika data wilayah tidak ada.

### 3. Penambahan Detail Info Box
- Membuat sebuah kotak info dengan latar belakang *beige* (`bg-cream`) di bawah sinopsis.
- Kotak ini memuat tiga baris data:
  1. **Durasi**: Ditampilkan statis "10 menit baca" (atau dinamis jika kita menghitung jumlah kata, untuk sementara statis jika payload belum mendukunng).
  2. **Status Mode Dongeng**: Menampilkan "Tersedia" jika `asset_status` adalah `ready`, dan "Belum" jika sebaliknya.
  3. **Versi**: Hanya ditampilkan jika cerita ini memiliki lebih dari 1 versi (jumlah dinamis: "3 versi"). Jika hanya 1, baris ini disembunyikan.

### 4. Pengembalian Tombol Aksi (Lanjut Baca & Simpan)
- Mengembalikan desain tombol "Simpan" agar menggunakan teks + ikon (sesuai *screenshot* sebelumnya), bukan sekadar ikon bulat mengikuti *styleguide* murni secara membabi-buta.
- Tombol `Lanjut Baca` akan diberi ikon `BookOpen` di sebelah kirinya.
- Kedua tombol menggunakan `variant="primary"` dan `variant="secondary"` dari *design system* namun *layout* porsinya dipertahankan setengah-setengah atau proporsional (sesuai gambar referensi 2).

## File yang akan Dimodifikasi
1. `apps/web/src/features/map/useStories.ts` (menambah `versionCount` & status audio)
2. `apps/web/src/features/story-card/StoryCard.tsx` (restrukturisasi UI)

Mohon berikan `SETUJU` jika rencana ini sudah sesuai dengan yang Anda maksud, dan saya akan segera mengeksekusinya.
