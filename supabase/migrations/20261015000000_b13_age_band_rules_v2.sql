INSERT INTO age_band_rules (band, max_sentence_words, vocab_note, soften_rules, must_keep, prompt_version)
VALUES 
(
  '3-4', 
  10, 
  'Gunakan kalimat pendek dan jelas (satu gagasan per kalimat). Gunakan kosakata konkret dan sehari-hari. Istilah budaya penting dipertahankan dengan konteks.', 
  'Kematian, kutukan, hukuman boleh disebut jika penting. Hilangkan detail grafis dan ketakutan berkepanjangan.', 
  'Nama tokoh, urutan peristiwa inti, sebab-akibat, konflik, ending, pesan moral.', 
  'age-adapt-v2'
),
(
  '5-6', 
  14, 
  'Gunakan kalimat pendek-sedang, simple compound sentence. Vocabulary umum dominan, istilah budaya dipertahankan. Jangan over-explain.', 
  'Kematian, kutukan, hukuman, konflik boleh disebut tanpa detail grafis.', 
  'Nama tokoh, urutan peristiwa inti, sebab-akibat, konflik, ending, pesan moral.', 
  'age-adapt-v2'
),
(
  '7-9', 
  18, 
  'Pertahankan pengalaman utuh. Boleh pakai compound/complex sentence sederhana. Metafora/idiom sederhana dan istilah budaya/ritual/supernatural dipertahankan.', 
  'Kurangi hanya detail grafis atau disturbing sensory detail.', 
  'Nama tokoh, urutan peristiwa inti, sebab-akibat, konflik, ending, pesan moral.', 
  'age-adapt-v2'
),
(
  '10-12', 
  999, 
  'PRESERVATION-FIRST. Sederhanakan hanya jika ada hambatan nyata (syntax panjang, vocabulary sangat arkais). Pertahankan vocabulary kaya, metafora, idiom, tone, mood, subtext.', 
  'Kematian, hukuman, pengkhianatan, tragedi, konflik boleh ada. Kurangi hanya detail grafis yang berlebihan.', 
  'Nama tokoh, urutan peristiwa inti, sebab-akibat, konflik, ending, pesan moral.', 
  'age-adapt-v2'
)
ON CONFLICT (band) DO UPDATE SET
  max_sentence_words = EXCLUDED.max_sentence_words,
  vocab_note = EXCLUDED.vocab_note,
  soften_rules = EXCLUDED.soften_rules,
  must_keep = EXCLUDED.must_keep,
  prompt_version = EXCLUDED.prompt_version;
