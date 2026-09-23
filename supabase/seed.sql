-- Default app settings
INSERT INTO app_settings (key, value) VALUES
('auto_publish_enabled', 'true'),
('auto_publish_min_confidence', '0.85'),
('submissions_per_day', '3'),
('adaptations_per_day', '10'),
('pages_min', '6'),
('pages_max', '14'),
('tier_zoom_map', '{"5": 1, "7": 2, "9": 3, "default": 4}'),
('tier_percentiles', '{"1": 5, "2": 15, "3": 30}'),
('tier_min_reads', '10'),
('score_weights', '{"read": 1, "save": 3}'),
('concurrency', '{"image": 3, "tts": 3, "text": 5}')
ON CONFLICT (key) DO NOTHING;

-- Initial style configs (draft)
INSERT INTO style_configs (story_type, descriptor, palette, negative_prompt) VALUES
('legenda', 'Gaya legenda klasik', '{"primary": "#D9663F"}', 'modern, text, watermark'),
('mite', 'Gaya mite gelap', '{"primary": "#7B5EA7"}', 'modern, text, watermark'),
('fabel', 'Gaya fabel ceria', '{"primary": "#4C9A5B"}', 'modern, text, watermark'),
('dongeng', 'Gaya dongeng ajaib', '{"primary": "#E3A72F"}', 'modern, text, watermark');

-- Age band rules (draft)
INSERT INTO age_band_rules (band, max_sentence_words, vocab_note, soften_rules, must_keep, prompt_version) VALUES
('3-4', 8, 'Sederhana, sehari-hari', 'Tanpa kekerasan eksplisit', 'Nama tokoh, pesan moral', 'v1'),
('5-6', 12, 'Sederhana', 'Akibat boleh disebut tanpa detail', 'Nama tokoh, alur inti', 'v1'),
('7-9', 16, 'Istilah baru dijelaskan', 'Tanpa detail grafis', 'Nama tokoh, alur inti', 'v1'),
('10-12', 20, 'Mendekati asli', 'Mendekati asli', 'Semua', 'v1');

-- Voice personas (draft)
INSERT INTO voice_personas (name, voice_name, style_prompt) VALUES
('Bapak Tua', 'id-ID-Wavenet-B', 'Suara berat, pelan, mengayomi'),
('Ibu Lembut', 'id-ID-Wavenet-A', 'Suara lembut, sabar'),
('Pemuda Ceria', 'id-ID-Wavenet-C', 'Suara ceria, bersemangat');

-- Fallback backgrounds (draft)
INSERT INTO fallback_backgrounds (story_type, path) VALUES
('legenda', 'fallback/legenda.webp'),
('mite', 'fallback/mite.webp'),
('fabel', 'fallback/fabel.webp'),
('dongeng', 'fallback/dongeng.webp'),
(NULL, 'fallback/umum.webp');
