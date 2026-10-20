-- Seed initial story tiers based on canonical folklore prominence and popularity

-- Tier 1: Kanonik Nasional / Legendaris Super Populer (10 Cerita)
UPDATE stories SET tier = 1 WHERE title IN (
  'Malin Kundang',
  'Sangkuriang & Dayang Sumbi',
  'Legenda Danau Toba',
  'Bawang Merah Bawang Putih',
  'Timun Mas',
  'Legenda Rawa Pening',
  'Si Pitung',
  'Keong Mas',
  'Cindelaras',
  'Lutung Kasarung'
);

-- Tier 2: Sangat Terkenal Tingkat Regional / Legenda Besar (12 Cerita)
UPDATE stories SET tier = 2 WHERE title IN (
  'Calon Arang',
  'Kebo Iwa',
  'Si Pahit Lidah',
  'Telaga Warna',
  'Legenda Ikan Patin',
  'Asal Mula Gunung Seulawah',
  'Tuan Tapa dan Putri Naga',
  'Semangka Emas',
  'Legenda Danau Lipan',
  'Terjadinya Selat Bali',
  'Murtado Macan Kemayoran',
  'Legenda Pulau Kemaro'
);

-- Tier 3: Cerita Rakyat Daerah Populer (12 Cerita)
UPDATE stories SET tier = 3 WHERE title IN (
  'Asal-usul Sungai Landak',
  'Legenda Pesut Mahakam',
  'Si Kelingking',
  'Buaya Perompak',
  'Dongeng Bawang dan Kesuna',
  'Putri Kemarau',
  'Putri Mambang Linau',
  'Sangi sang Pemburu',
  'Abo Mamongkuroit dan Tulap si Raksasa',
  'Kisah Burung Kekekow',
  'Legenda Amat Rhang Manyang',
  'Legenda Ular Berkepala Tujuh'
);

-- Tier 4: Cerita Lokal / Khusus (11 Cerita)
UPDATE stories SET tier = 4 WHERE title IN (
  'Putri Ular',
  'Dayang Bandir dan Sandean Raja',
  'Legenda Banta Seudang',
  'Si Lebai yang Malang',
  'Siamang Putih',
  'Sari Bulan',
  'Suri Ikun dan Dua Ekor Burung',
  'Kutukan Raja Pulau Mintin',
  'Lok si Naga',
  'Legenda Gunung Batu Bangkai',
  'Burung Tempua dan Burung Puyuh'
);
