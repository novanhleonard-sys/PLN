CREATE POLICY "Admins can insert app_settings" ON app_settings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seed defaults
INSERT INTO app_settings (key, value)
VALUES (
  'umum_gambar',
  '{"prompt": "Gaya ilustrasi storybook kartunis yang hangat, ramah anak, mudah dikenali, dan kuat secara naratif. Gaya tidak photorealistic, tidak chibi ekstrem, tidak menyerupai poster film, dan tidak terasa seperti generic AI fantasy art.\nTujuan utama ilustrasi adalah membantu anak memahami cerita. Karena itu, setiap gambar harus memiliki fokus utama yang jelas: siapa yang sedang melakukan apa, di mana, dan dengan emosi apa. Komposisi harus sederhana, terbaca, dan tidak membingungkan.\nPrioritaskan kejelasan naratif dibanding kemegahan visual. Gambar boleh memiliki whitespace yang cukup luas. Tidak semua area harus diisi. Hindari kecenderungan AI untuk memenuhi seluruh frame dengan detail. Ruang kosong yang terkontrol diperbolehkan dan sering lebih baik agar fokus adegan tetap kuat.\nGunakan detail secara selektif. Setiap elemen visual harus punya fungsi: menjelaskan aksi, membangun dunia, atau mendukung emosi. Hindari elemen dekoratif yang tidak perlu, seperti ornamen random, hewan tambahan random, efek cahaya berlebihan, partikel magis berlebihan, atau background terlalu ramai jika tidak relevan dengan cerita.\nKarakter harus mudah dikenali, konsisten, dan ekspresif. Sebelum membuat ilustrasi adegan, lakukan pemetaan tokoh terlebih dahulu. Identifikasi tokoh utama, tokoh pendukung, antagonis atau ancaman, serta ciri visual penting mereka. Bangun desain karakter yang konsisten terlebih dahulu sebelum membuat scene. Semua halaman harus mengikuti identitas karakter yang sudah ditetapkan.\nManusia, hewan, bangunan, pakaian, benda, dan lingkungan boleh disederhanakan secara kartunis, tetapi identitasnya harus tetap jelas dan recognizable. Fantasi hanya diterapkan pada unsur yang memang fantastis dalam cerita. Unsur dunia nyata harus tetap terasa membumi dan masuk akal.\nEkspresi wajah, gesture, postur, dan hubungan spasial antar tokoh harus membantu pembaca anak memahami emosi dan situasi. Emosi harus terbaca jelas, tetapi tidak slapstick dan tidak terlalu bayi.\nHindari gaya AI generik: jangan terlalu penuh, jangan terlalu sinematik, jangan terlalu dramatis, jangan terlalu glowing, jangan terlalu \"epic\", dan jangan mencampur identitas budaya secara acak.\nIlustrasi harus terasa seperti halaman buku cerita anak, bukan poster promosi. Gambar harus kaya secukupnya, tetapi tetap ringan dibaca, fokus, dan nyaman untuk anak.", "references": []}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

INSERT INTO app_settings (key, value)
VALUES (
  'umum_suara',
  '{"prompt": "Prompt dasar suara akan diisi kemudian.", "references": []}'::jsonb
)
ON CONFLICT (key) DO NOTHING;
