# Menghubungkan Supabase ke Antigravity (MCP)

Tujuan: agent bisa membuat tabel, menjalankan migrasi, dan mengecek data langsung ke database, tanpa kamu mengetik command Supabase CLI satu-satu di terminal terpisah.

Ini terpisah dari `supabase login` dan `supabase link` yang sudah kamu lakukan. Login dan link tadi membuat CLI di komputermu bisa push migrasi (agent akan memakai ini lewat terminal). MCP di bawah ini membuat agent bisa membaca dan query database secara langsung, lebih cepat untuk debugging dan verifikasi.

## 1. Ambil connection string

1. Buka dashboard project Supabase-mu (`zitycekoaftocdwofgnz`).
2. Project Settings > Database > Connection string.
3. Pilih mode **Session pooler** (lebih stabil untuk koneksi dari tool seperti ini dibanding direct connection).
4. Copy string-nya, lalu ganti bagian `[YOUR-PASSWORD]` dengan password database project ini (bukan password akun Supabase-mu).

Simpan string ini hanya di file konfigurasi lokal langkah berikutnya. **Jangan tempel string ini di chat ke saya atau ke agent manapun sebagai teks biasa.**

## 2. Isi konfigurasi MCP di Antigravity

Di Antigravity desktop, buka pengaturan MCP servers (biasanya lewat menu Settings atau file `mcp_config.json` yang bisa dibuka dari dalam aplikasi). Tambahkan:

```json
{
  "mcpServers": {
    "supabase-db": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "ISI_CONNECTION_STRING_DI_SINI"
      ]
    }
  }
}
```

File ini tersimpan di pengaturan lokal Antigravity, bukan di dalam folder repo, jadi tidak akan ikut ke-commit ke GitHub. Tetap jangan sengaja copy isinya ke tempat lain.

Simpan, lalu refresh daftar MCP servers di Antigravity. Kalau muncul `supabase-db` di daftar tools yang tersedia, koneksinya berhasil.

## 3. Uji koneksi

Di percakapan Antigravity (belum masuk instruksi batch apa pun), coba:

```
Cek koneksi Supabase: tampilkan daftar tabel yang ada sekarang di database ini.
```

Kalau database masih kosong (belum dijalankan B0), hasilnya wajar kosong atau hanya tabel bawaan Supabase (`auth`, `storage`, dll). Yang penting tidak error koneksi.

## Catatan keamanan

- Connection string ini punya password database. Kalau bocor, orang lain bisa baca dan ubah datamu.
- Karena ini project dev untuk capstone, risiko utamanya cuma kamu sendiri yang dirugikan (data rusak, biaya AI kepakai lewat query aneh). Tetap jangan publish connection string ini di mana pun, termasuk screenshot yang kamu unggah ke saya.
- Kalau curiga bocor, reset password database di Settings > Database, lalu update ulang connection string di `mcp_config.json`.
