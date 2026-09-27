-- B11: Seed kabupaten/kota data (BPS 2023)
-- Total: 514 kabupaten/kota

-- ACEH
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KAB_SIMEULUE', 'Kabupaten Simeulue', 'kabupaten', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KAB_SINGKIL', 'Kabupaten Aceh Singkil', 'kabupaten', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KAB_SELATAN', 'Kabupaten Aceh Selatan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KAB_TENGGARA', 'Kabupaten Aceh Tenggara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KAB_TIMUR', 'Kabupaten Aceh Timur', 'kabupaten', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KAB_TENGAH', 'Kabupaten Aceh Tengah', 'kabupaten', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KAB_BARAT', 'Kabupaten Aceh Barat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KAB_BESAR', 'Kabupaten Aceh Besar', 'kabupaten', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KAB_PIDIE', 'Kabupaten Pidie', 'kabupaten', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KAB_BIREUEN', 'Kabupaten Bireuen', 'kabupaten', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KAB_UTARA', 'Kabupaten Aceh Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KAB_BARAT_DAYA', 'Kabupaten Aceh Barat Daya', 'kabupaten', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KAB_GAYO_LUES', 'Kabupaten Gayo Lues', 'kabupaten', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KAB_TAMIANG', 'Kabupaten Aceh Tamiang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KAB_NAGAN_RAYA', 'Kabupaten Nagan Raya', 'kabupaten', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KAB_JAYA', 'Kabupaten Aceh Jaya', 'kabupaten', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KAB_BENER_MERIAH', 'Kabupaten Bener Meriah', 'kabupaten', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KAB_PIDIE_JAYA', 'Kabupaten Pidie Jaya', 'kabupaten', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KOTA_BANDA_ACEH', 'Kota Banda Aceh', 'kota', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KOTA_SABANG', 'Kota Sabang', 'kota', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KOTA_LANGSA', 'Kota Langsa', 'kota', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KOTA_LHOKSEUMAWE', 'Kota Lhokseumawe', 'kota', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'ACEH_KOTA_SUBULUSSALAM', 'Kota Subulussalam', 'kota', 0, 0, id FROM regions WHERE code = 'ACEH'
ON CONFLICT (code) DO NOTHING;

-- SUMATERA_UTARA
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_NIAS', 'Kabupaten Nias', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_MANDA_NATAL', 'Kabupaten Mandailing Natal', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_TAPSEL', 'Kabupaten Tapanuli Selatan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_TAPTENG', 'Kabupaten Tapanuli Tengah', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_TAPUT', 'Kabupaten Tapanuli Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_TOBA', 'Kabupaten Toba', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_LABUHANBATU', 'Kabupaten Labuhanbatu', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_ASAHAN', 'Kabupaten Asahan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_SIMALUNGUN', 'Kabupaten Simalungun', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_DAIRI', 'Kabupaten Dairi', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_KARO', 'Kabupaten Karo', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_DELI_SERDANG', 'Kabupaten Deli Serdang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_LANGKAT', 'Kabupaten Langkat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_NIAS_SELATAN', 'Kabupaten Nias Selatan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_HUMBANG', 'Kabupaten Humbang Hasundutan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_PAKPAK', 'Kabupaten Pakpak Bharat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_SAMOSIR', 'Kabupaten Samosir', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_SERDANG_BEDAGAI', 'Kabupaten Serdang Bedagai', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_BATU_BARA', 'Kabupaten Batu Bara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_PALUTA', 'Kabupaten Padang Lawas Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_PALAS', 'Kabupaten Padang Lawas', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_LABUSEL', 'Kabupaten Labuhanbatu Selatan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_LABURA', 'Kabupaten Labuhanbatu Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_NIAS_UTARA', 'Kabupaten Nias Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KAB_NIAS_BARAT', 'Kabupaten Nias Barat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KOTA_SIBOLGA', 'Kota Sibolga', 'kota', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KOTA_TANJUNGBALAI', 'Kota Tanjungbalai', 'kota', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KOTA_PEMATANGSIANTAR', 'Kota Pematangsiantar', 'kota', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KOTA_TEBING_TINGGI', 'Kota Tebing Tinggi', 'kota', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KOTA_MEDAN', 'Kota Medan', 'kota', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KOTA_BINJAI', 'Kota Binjai', 'kota', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KOTA_PADANGSIDIMPUAN', 'Kota Padangsidimpuan', 'kota', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMUT_KOTA_GUNUNGSITOLI', 'Kota Gunungsitoli', 'kota', 0, 0, id FROM regions WHERE code = 'SUMATERA_UTARA'
ON CONFLICT (code) DO NOTHING;

-- SUMATERA_BARAT
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMBAR_KAB_MENTAWAI', 'Kabupaten Kepulauan Mentawai', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMBAR_KAB_PESISIR_SELATAN', 'Kabupaten Pesisir Selatan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMBAR_KAB_SOLOK', 'Kabupaten Solok', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMBAR_KAB_SIJUNJUNG', 'Kabupaten Sijunjung', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMBAR_KAB_TANAH_DATAR', 'Kabupaten Tanah Datar', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMBAR_KAB_PADANG_PARIAMAN', 'Kabupaten Padang Pariaman', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMBAR_KAB_AGAM', 'Kabupaten Agam', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMBAR_KAB_50_KOTA', 'Kabupaten Lima Puluh Kota', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMBAR_KAB_PASAMAN', 'Kabupaten Pasaman', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMBAR_KAB_SOLOK_SELATAN', 'Kabupaten Solok Selatan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMBAR_KAB_DHARMASRAYA', 'Kabupaten Dharmasraya', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMBAR_KAB_PASAMAN_BARAT', 'Kabupaten Pasaman Barat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMBAR_KOTA_PADANG', 'Kota Padang', 'kota', 0, 0, id FROM regions WHERE code = 'SUMATERA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMBAR_KOTA_SOLOK', 'Kota Solok', 'kota', 0, 0, id FROM regions WHERE code = 'SUMATERA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMBAR_KOTA_SAWAHLUNTO', 'Kota Sawahlunto', 'kota', 0, 0, id FROM regions WHERE code = 'SUMATERA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMBAR_KOTA_PADANG_PANJANG', 'Kota Padang Panjang', 'kota', 0, 0, id FROM regions WHERE code = 'SUMATERA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMBAR_KOTA_BUKITTINGGI', 'Kota Bukittinggi', 'kota', 0, 0, id FROM regions WHERE code = 'SUMATERA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMBAR_KOTA_PAYAKUMBUH', 'Kota Payakumbuh', 'kota', 0, 0, id FROM regions WHERE code = 'SUMATERA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMBAR_KOTA_PARIAMAN', 'Kota Pariaman', 'kota', 0, 0, id FROM regions WHERE code = 'SUMATERA_BARAT'
ON CONFLICT (code) DO NOTHING;

-- RIAU
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'RIAU_KAB_KUANSING', 'Kabupaten Kuantan Singingi', 'kabupaten', 0, 0, id FROM regions WHERE code = 'RIAU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'RIAU_KAB_INHU', 'Kabupaten Indragiri Hulu', 'kabupaten', 0, 0, id FROM regions WHERE code = 'RIAU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'RIAU_KAB_INHIL', 'Kabupaten Indragiri Hilir', 'kabupaten', 0, 0, id FROM regions WHERE code = 'RIAU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'RIAU_KAB_PELALAWAN', 'Kabupaten Pelalawan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'RIAU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'RIAU_KAB_SIAK', 'Kabupaten Siak', 'kabupaten', 0, 0, id FROM regions WHERE code = 'RIAU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'RIAU_KAB_KAMPAR', 'Kabupaten Kampar', 'kabupaten', 0, 0, id FROM regions WHERE code = 'RIAU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'RIAU_KAB_ROKANHULU', 'Kabupaten Rokan Hulu', 'kabupaten', 0, 0, id FROM regions WHERE code = 'RIAU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'RIAU_KAB_BENGKALIS', 'Kabupaten Bengkalis', 'kabupaten', 0, 0, id FROM regions WHERE code = 'RIAU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'RIAU_KAB_ROKANHILIR', 'Kabupaten Rokan Hilir', 'kabupaten', 0, 0, id FROM regions WHERE code = 'RIAU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'RIAU_KAB_MERANTI', 'Kabupaten Kepulauan Meranti', 'kabupaten', 0, 0, id FROM regions WHERE code = 'RIAU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'RIAU_KOTA_PEKANBARU', 'Kota Pekanbaru', 'kota', 0, 0, id FROM regions WHERE code = 'RIAU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'RIAU_KOTA_DUMAI', 'Kota Dumai', 'kota', 0, 0, id FROM regions WHERE code = 'RIAU'
ON CONFLICT (code) DO NOTHING;

-- JAMBI
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JAMBI_KAB_KERINCI', 'Kabupaten Kerinci', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAMBI'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JAMBI_KAB_MERANGIN', 'Kabupaten Merangin', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAMBI'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JAMBI_KAB_SAROLANGUN', 'Kabupaten Sarolangun', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAMBI'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JAMBI_KAB_BATANGHARI', 'Kabupaten Batanghari', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAMBI'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JAMBI_KAB_MUARO_JAMBI', 'Kabupaten Muaro Jambi', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAMBI'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JAMBI_KAB_TANJAB_TIMUR', 'Kabupaten Tanjung Jabung Timur', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAMBI'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JAMBI_KAB_TANJAB_BARAT', 'Kabupaten Tanjung Jabung Barat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAMBI'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JAMBI_KAB_TEBO', 'Kabupaten Tebo', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAMBI'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JAMBI_KAB_BUNGO', 'Kabupaten Bungo', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAMBI'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JAMBI_KOTA_JAMBI', 'Kota Jambi', 'kota', 0, 0, id FROM regions WHERE code = 'JAMBI'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JAMBI_KOTA_SUNGAIPENUH', 'Kota Sungai Penuh', 'kota', 0, 0, id FROM regions WHERE code = 'JAMBI'
ON CONFLICT (code) DO NOTHING;

-- SUMATERA_SELATAN
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMSEL_KAB_OKU', 'Kabupaten Ogan Komering Ulu', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMSEL_KAB_OKI', 'Kabupaten Ogan Komering Ilir', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMSEL_KAB_MUARA_ENIM', 'Kabupaten Muara Enim', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMSEL_KAB_LAHAT', 'Kabupaten Lahat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMSEL_KAB_MUSI_RAWAS', 'Kabupaten Musi Rawas', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMSEL_KAB_MUBA', 'Kabupaten Musi Banyuasin', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMSEL_KAB_BANYUASIN', 'Kabupaten Banyuasin', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMSEL_KAB_OKU_SELATAN', 'Kabupaten Ogan Komering Ulu Selatan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMSEL_KAB_OKU_TIMUR', 'Kabupaten Ogan Komering Ulu Timur', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMSEL_KAB_OGAN_ILIR', 'Kabupaten Ogan Ilir', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMSEL_KAB_EMPAT_LAWANG', 'Kabupaten Empat Lawang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMSEL_KAB_PALI', 'Kabupaten Penukal Abab Lematang Ilir', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMSEL_KAB_MURA_UTARA', 'Kabupaten Musi Rawas Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SUMATERA_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMSEL_KOTA_PALEMBANG', 'Kota Palembang', 'kota', 0, 0, id FROM regions WHERE code = 'SUMATERA_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMSEL_KOTA_PRABUMULIH', 'Kota Prabumulih', 'kota', 0, 0, id FROM regions WHERE code = 'SUMATERA_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMSEL_KOTA_PAGAR_ALAM', 'Kota Pagar Alam', 'kota', 0, 0, id FROM regions WHERE code = 'SUMATERA_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SUMSEL_KOTA_LUBUKLINGGAU', 'Kota Lubuklinggau', 'kota', 0, 0, id FROM regions WHERE code = 'SUMATERA_SELATAN'
ON CONFLICT (code) DO NOTHING;

-- BENGKULU
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BENGKULU_KAB_SELATAN', 'Kabupaten Bengkulu Selatan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'BENGKULU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BENGKULU_KAB_REJANG_LEBONG', 'Kabupaten Rejang Lebong', 'kabupaten', 0, 0, id FROM regions WHERE code = 'BENGKULU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BENGKULU_KAB_UTARA', 'Kabupaten Bengkulu Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'BENGKULU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BENGKULU_KAB_KAUR', 'Kabupaten Kaur', 'kabupaten', 0, 0, id FROM regions WHERE code = 'BENGKULU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BENGKULU_KAB_SELUMA', 'Kabupaten Seluma', 'kabupaten', 0, 0, id FROM regions WHERE code = 'BENGKULU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BENGKULU_KAB_MUKOMUKO', 'Kabupaten Mukomuko', 'kabupaten', 0, 0, id FROM regions WHERE code = 'BENGKULU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BENGKULU_KAB_LEBONG', 'Kabupaten Lebong', 'kabupaten', 0, 0, id FROM regions WHERE code = 'BENGKULU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BENGKULU_KAB_KEPAHIANG', 'Kabupaten Kepahiang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'BENGKULU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BENGKULU_KAB_TENGAH', 'Kabupaten Bengkulu Tengah', 'kabupaten', 0, 0, id FROM regions WHERE code = 'BENGKULU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BENGKULU_KOTA_BENGKULU', 'Kota Bengkulu', 'kota', 0, 0, id FROM regions WHERE code = 'BENGKULU'
ON CONFLICT (code) DO NOTHING;

-- LAMPUNG
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'LAMPUNG_KAB_BARAT', 'Kabupaten Lampung Barat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'LAMPUNG'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'LAMPUNG_KAB_TANGGAMUS', 'Kabupaten Tanggamus', 'kabupaten', 0, 0, id FROM regions WHERE code = 'LAMPUNG'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'LAMPUNG_KAB_SELATAN', 'Kabupaten Lampung Selatan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'LAMPUNG'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'LAMPUNG_KAB_TIMUR', 'Kabupaten Lampung Timur', 'kabupaten', 0, 0, id FROM regions WHERE code = 'LAMPUNG'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'LAMPUNG_KAB_TENGAH', 'Kabupaten Lampung Tengah', 'kabupaten', 0, 0, id FROM regions WHERE code = 'LAMPUNG'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'LAMPUNG_KAB_UTARA', 'Kabupaten Lampung Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'LAMPUNG'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'LAMPUNG_KAB_WAY_KANAN', 'Kabupaten Way Kanan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'LAMPUNG'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'LAMPUNG_KAB_TULANGBAWANG', 'Kabupaten Tulangbawang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'LAMPUNG'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'LAMPUNG_KAB_PESAWARAN', 'Kabupaten Pesawaran', 'kabupaten', 0, 0, id FROM regions WHERE code = 'LAMPUNG'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'LAMPUNG_KAB_PRINGSEWU', 'Kabupaten Pringsewu', 'kabupaten', 0, 0, id FROM regions WHERE code = 'LAMPUNG'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'LAMPUNG_KAB_MESUJI', 'Kabupaten Mesuji', 'kabupaten', 0, 0, id FROM regions WHERE code = 'LAMPUNG'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'LAMPUNG_KAB_TULANGBAWANG_BARAT', 'Kabupaten Tulang Bawang Barat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'LAMPUNG'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'LAMPUNG_KAB_PESISIR_BARAT', 'Kabupaten Pesisir Barat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'LAMPUNG'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'LAMPUNG_KOTA_BANDAR_LAMPUNG', 'Kota Bandar Lampung', 'kota', 0, 0, id FROM regions WHERE code = 'LAMPUNG'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'LAMPUNG_KOTA_METRO', 'Kota Metro', 'kota', 0, 0, id FROM regions WHERE code = 'LAMPUNG'
ON CONFLICT (code) DO NOTHING;

-- KEPULAUAN_BANGKA_BELITUNG
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BABEL_KAB_BANGKA', 'Kabupaten Bangka', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KEPULAUAN_BANGKA_BELITUNG'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BABEL_KAB_BELITUNG', 'Kabupaten Belitung', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KEPULAUAN_BANGKA_BELITUNG'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BABEL_KAB_BANGKA_BARAT', 'Kabupaten Bangka Barat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KEPULAUAN_BANGKA_BELITUNG'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BABEL_KAB_BANGKA_TENGAH', 'Kabupaten Bangka Tengah', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KEPULAUAN_BANGKA_BELITUNG'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BABEL_KAB_BANGKA_SELATAN', 'Kabupaten Bangka Selatan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KEPULAUAN_BANGKA_BELITUNG'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BABEL_KAB_BELITUNG_TIMUR', 'Kabupaten Belitung Timur', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KEPULAUAN_BANGKA_BELITUNG'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BABEL_KOTA_PANGKALPINANG', 'Kota Pangkalpinang', 'kota', 0, 0, id FROM regions WHERE code = 'KEPULAUAN_BANGKA_BELITUNG'
ON CONFLICT (code) DO NOTHING;

-- KEPULAUAN_RIAU
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KEPRI_KAB_KARIMUN', 'Kabupaten Karimun', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KEPULAUAN_RIAU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KEPRI_KAB_BINTAN', 'Kabupaten Bintan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KEPULAUAN_RIAU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KEPRI_KAB_NATUNA', 'Kabupaten Natuna', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KEPULAUAN_RIAU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KEPRI_KAB_LINGGA', 'Kabupaten Lingga', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KEPULAUAN_RIAU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KEPRI_KAB_ANAMBAS', 'Kabupaten Kepulauan Anambas', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KEPULAUAN_RIAU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KEPRI_KOTA_BATAM', 'Kota Batam', 'kota', 0, 0, id FROM regions WHERE code = 'KEPULAUAN_RIAU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KEPRI_KOTA_TANJUNGPINANG', 'Kota Tanjungpinang', 'kota', 0, 0, id FROM regions WHERE code = 'KEPULAUAN_RIAU'
ON CONFLICT (code) DO NOTHING;

-- DKI_JAKARTA
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JAKARTA_KAB_KEP_SERIBU', 'Kabupaten Administrasi Kepulauan Seribu', 'kabupaten', 0, 0, id FROM regions WHERE code = 'DKI_JAKARTA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JAKARTA_KOTA_SELATAN', 'Kota Administrasi Jakarta Selatan', 'kota', 0, 0, id FROM regions WHERE code = 'DKI_JAKARTA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JAKARTA_KOTA_TIMUR', 'Kota Administrasi Jakarta Timur', 'kota', 0, 0, id FROM regions WHERE code = 'DKI_JAKARTA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JAKARTA_KOTA_PUSAT', 'Kota Administrasi Jakarta Pusat', 'kota', 0, 0, id FROM regions WHERE code = 'DKI_JAKARTA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JAKARTA_KOTA_BARAT', 'Kota Administrasi Jakarta Barat', 'kota', 0, 0, id FROM regions WHERE code = 'DKI_JAKARTA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JAKARTA_KOTA_UTARA', 'Kota Administrasi Jakarta Utara', 'kota', 0, 0, id FROM regions WHERE code = 'DKI_JAKARTA'
ON CONFLICT (code) DO NOTHING;

-- JAWA_BARAT
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KAB_BOGOR', 'Kabupaten Bogor', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KAB_SUKABUMI', 'Kabupaten Sukabumi', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KAB_CIANJUR', 'Kabupaten Cianjur', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KAB_BANDUNG', 'Kabupaten Bandung', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KAB_GARUT', 'Kabupaten Garut', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KAB_TASIKMALAYA', 'Kabupaten Tasikmalaya', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KAB_CIAMIS', 'Kabupaten Ciamis', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KAB_KUNINGAN', 'Kabupaten Kuningan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KAB_CIREBON', 'Kabupaten Cirebon', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KAB_MAJALENGKA', 'Kabupaten Majalengka', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KAB_SUMEDANG', 'Kabupaten Sumedang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KAB_INDRAMAYU', 'Kabupaten Indramayu', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KAB_SUBANG', 'Kabupaten Subang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KAB_PURWAKARTA', 'Kabupaten Purwakarta', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KAB_KARAWANG', 'Kabupaten Karawang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KAB_BEKASI', 'Kabupaten Bekasi', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KAB_BANDUNG_BARAT', 'Kabupaten Bandung Barat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KAB_PANGANDARAN', 'Kabupaten Pangandaran', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KOTA_BOGOR', 'Kota Bogor', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KOTA_SUKABUMI', 'Kota Sukabumi', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KOTA_BANDUNG', 'Kota Bandung', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KOTA_CIREBON', 'Kota Cirebon', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KOTA_BEKASI', 'Kota Bekasi', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KOTA_DEPOK', 'Kota Depok', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KOTA_CIMAHI', 'Kota Cimahi', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KOTA_TASIKMALAYA', 'Kota Tasikmalaya', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JABAR_KOTA_BANJAR', 'Kota Banjar', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_BARAT'
ON CONFLICT (code) DO NOTHING;

-- JAWA_TENGAH
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_CILACAP', 'Kabupaten Cilacap', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_BANYUMAS', 'Kabupaten Banyumas', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_PURBALINGGA', 'Kabupaten Purbalingga', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_BANJARNEGARA', 'Kabupaten Banjarnegara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_KEBUMEN', 'Kabupaten Kebumen', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_PURWOREJO', 'Kabupaten Purworejo', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_WONOSOBO', 'Kabupaten Wonosobo', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_MAGELANG', 'Kabupaten Magelang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_BOYOLALI', 'Kabupaten Boyolali', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_KLATEN', 'Kabupaten Klaten', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_SUKOHARJO', 'Kabupaten Sukoharjo', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_WONOGIRI', 'Kabupaten Wonogiri', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_KARANGANYAR', 'Kabupaten Karanganyar', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_SRAGEN', 'Kabupaten Sragen', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_GROBOGAN', 'Kabupaten Grobogan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_BLORA', 'Kabupaten Blora', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_REMBANG', 'Kabupaten Rembang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_PATI', 'Kabupaten Pati', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_KUDUS', 'Kabupaten Kudus', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_JEPARA', 'Kabupaten Jepara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_DEMAK', 'Kabupaten Demak', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_SEMARANG', 'Kabupaten Semarang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_TEMANGGUNG', 'Kabupaten Temanggung', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_KENDAL', 'Kabupaten Kendal', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_BATANG', 'Kabupaten Batang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_PEKALONGAN', 'Kabupaten Pekalongan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_PEMALANG', 'Kabupaten Pemalang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_TEGAL', 'Kabupaten Tegal', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KAB_BREBES', 'Kabupaten Brebes', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KOTA_MAGELANG', 'Kota Magelang', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KOTA_SURAKARTA', 'Kota Surakarta', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KOTA_SALATIGA', 'Kota Salatiga', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KOTA_SEMARANG', 'Kota Semarang', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KOTA_PEKALONGAN', 'Kota Pekalongan', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATENG_KOTA_TEGAL', 'Kota Tegal', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_TENGAH'
ON CONFLICT (code) DO NOTHING;

-- DI_YOGYAKARTA
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'DIY_KAB_KULONPROGO', 'Kabupaten Kulon Progo', 'kabupaten', 0, 0, id FROM regions WHERE code = 'DI_YOGYAKARTA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'DIY_KAB_BANTUL', 'Kabupaten Bantul', 'kabupaten', 0, 0, id FROM regions WHERE code = 'DI_YOGYAKARTA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'DIY_KAB_GUNUNGKIDUL', 'Kabupaten Gunungkidul', 'kabupaten', 0, 0, id FROM regions WHERE code = 'DI_YOGYAKARTA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'DIY_KAB_SLEMAN', 'Kabupaten Sleman', 'kabupaten', 0, 0, id FROM regions WHERE code = 'DI_YOGYAKARTA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'DIY_KOTA_YOGYAKARTA', 'Kota Yogyakarta', 'kota', 0, 0, id FROM regions WHERE code = 'DI_YOGYAKARTA'
ON CONFLICT (code) DO NOTHING;

-- JAWA_TIMUR
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_PACITAN', 'Kabupaten Pacitan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_PONOROGO', 'Kabupaten Ponorogo', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_TRENGGALEK', 'Kabupaten Trenggalek', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_TULUNGAGUNG', 'Kabupaten Tulungagung', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_BLITAR', 'Kabupaten Blitar', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_KEDIRI', 'Kabupaten Kediri', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_MALANG', 'Kabupaten Malang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_LUMAJANG', 'Kabupaten Lumajang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_JEMBER', 'Kabupaten Jember', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_BANYUWANGI', 'Kabupaten Banyuwangi', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_BONDOWOSO', 'Kabupaten Bondowoso', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_SITUBONDO', 'Kabupaten Situbondo', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_PROBOLINGGO', 'Kabupaten Probolinggo', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_PASURUAN', 'Kabupaten Pasuruan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_SIDOARJO', 'Kabupaten Sidoarjo', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_MOJOKERTO', 'Kabupaten Mojokerto', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_JOMBANG', 'Kabupaten Jombang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_NGANJUK', 'Kabupaten Nganjuk', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_MADIUN', 'Kabupaten Madiun', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_MAGETAN', 'Kabupaten Magetan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_NGAWI', 'Kabupaten Ngawi', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_BOJONEGORO', 'Kabupaten Bojonegoro', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_TUBAN', 'Kabupaten Tuban', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_LAMONGAN', 'Kabupaten Lamongan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_GRESIK', 'Kabupaten Gresik', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_BANGKALAN', 'Kabupaten Bangkalan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_SAMPANG', 'Kabupaten Sampang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_PAMEKASAN', 'Kabupaten Pamekasan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KAB_SUMENEP', 'Kabupaten Sumenep', 'kabupaten', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KOTA_KEDIRI', 'Kota Kediri', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KOTA_BLITAR', 'Kota Blitar', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KOTA_MALANG', 'Kota Malang', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KOTA_PROBOLINGGO', 'Kota Probolinggo', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KOTA_PASURUAN', 'Kota Pasuruan', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KOTA_MOJOKERTO', 'Kota Mojokerto', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KOTA_MADIUN', 'Kota Madiun', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KOTA_SURABAYA', 'Kota Surabaya', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'JATIM_KOTA_BATU', 'Kota Batu', 'kota', 0, 0, id FROM regions WHERE code = 'JAWA_TIMUR'
ON CONFLICT (code) DO NOTHING;

-- BANTEN
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BANTEN_KAB_PANDEGLANG', 'Kabupaten Pandeglang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'BANTEN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BANTEN_KAB_LEBAK', 'Kabupaten Lebak', 'kabupaten', 0, 0, id FROM regions WHERE code = 'BANTEN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BANTEN_KAB_TANGERANG', 'Kabupaten Tangerang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'BANTEN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BANTEN_KAB_SERANG', 'Kabupaten Serang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'BANTEN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BANTEN_KOTA_TANGERANG', 'Kota Tangerang', 'kota', 0, 0, id FROM regions WHERE code = 'BANTEN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BANTEN_KOTA_CILEGON', 'Kota Cilegon', 'kota', 0, 0, id FROM regions WHERE code = 'BANTEN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BANTEN_KOTA_SERANG', 'Kota Serang', 'kota', 0, 0, id FROM regions WHERE code = 'BANTEN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BANTEN_KOTA_TANGSEL', 'Kota Tangerang Selatan', 'kota', 0, 0, id FROM regions WHERE code = 'BANTEN'
ON CONFLICT (code) DO NOTHING;

-- BALI
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BALI_KAB_JEMBRANA', 'Kabupaten Jembrana', 'kabupaten', 0, 0, id FROM regions WHERE code = 'BALI'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BALI_KAB_TABANAN', 'Kabupaten Tabanan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'BALI'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BALI_KAB_BADUNG', 'Kabupaten Badung', 'kabupaten', 0, 0, id FROM regions WHERE code = 'BALI'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BALI_KAB_GIANYAR', 'Kabupaten Gianyar', 'kabupaten', 0, 0, id FROM regions WHERE code = 'BALI'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BALI_KAB_KLUNGKUNG', 'Kabupaten Klungkung', 'kabupaten', 0, 0, id FROM regions WHERE code = 'BALI'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BALI_KAB_BANGLI', 'Kabupaten Bangli', 'kabupaten', 0, 0, id FROM regions WHERE code = 'BALI'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BALI_KAB_KARANGASEM', 'Kabupaten Karangasem', 'kabupaten', 0, 0, id FROM regions WHERE code = 'BALI'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BALI_KAB_BULELENG', 'Kabupaten Buleleng', 'kabupaten', 0, 0, id FROM regions WHERE code = 'BALI'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'BALI_KOTA_DENPASAR', 'Kota Denpasar', 'kota', 0, 0, id FROM regions WHERE code = 'BALI'
ON CONFLICT (code) DO NOTHING;

-- NUSA_TENGGARA_BARAT
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTB_KAB_LOMBOK_BARAT', 'Kabupaten Lombok Barat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTB_KAB_LOMBOK_TENGAH', 'Kabupaten Lombok Tengah', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTB_KAB_LOMBOK_TIMUR', 'Kabupaten Lombok Timur', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTB_KAB_SUMBAWA', 'Kabupaten Sumbawa', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTB_KAB_DOMPU', 'Kabupaten Dompu', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTB_KAB_BIMA', 'Kabupaten Bima', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTB_KAB_SUMBAWA_BARAT', 'Kabupaten Sumbawa Barat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTB_KAB_LOMBOK_UTARA', 'Kabupaten Lombok Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTB_KOTA_MATARAM', 'Kota Mataram', 'kota', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTB_KOTA_BIMA', 'Kota Bima', 'kota', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_BARAT'
ON CONFLICT (code) DO NOTHING;

-- NUSA_TENGGARA_TIMUR
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTT_KAB_SUMBA_BARAT', 'Kabupaten Sumba Barat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTT_KAB_SUMBA_TIMUR', 'Kabupaten Sumba Timur', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTT_KAB_KUPANG', 'Kabupaten Kupang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTT_KAB_TTS', 'Kabupaten Timor Tengah Selatan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTT_KAB_TTU', 'Kabupaten Timor Tengah Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTT_KAB_BELU', 'Kabupaten Belu', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTT_KAB_ALOR', 'Kabupaten Alor', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTT_KAB_LEMBATA', 'Kabupaten Lembata', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTT_KAB_FLORES_TIMUR', 'Kabupaten Flores Timur', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTT_KAB_SIKKA', 'Kabupaten Sikka', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTT_KAB_ENDE', 'Kabupaten Ende', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTT_KAB_NGADA', 'Kabupaten Ngada', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTT_KAB_MANGGARAI', 'Kabupaten Manggarai', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTT_KAB_ROTE_NDAO', 'Kabupaten Rote Ndao', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTT_KAB_MANGGARAI_BARAT', 'Kabupaten Manggarai Barat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTT_KAB_SUMBA_TENGAH', 'Kabupaten Sumba Tengah', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTT_KAB_SUMBA_BARAT_DAYA', 'Kabupaten Sumba Barat Daya', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTT_KAB_NAGEKEO', 'Kabupaten Nagekeo', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTT_KAB_MANGGARAI_TIMUR', 'Kabupaten Manggarai Timur', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTT_KAB_SABU_RAIJUA', 'Kabupaten Sabu Raijua', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTT_KAB_MALAKA', 'Kabupaten Malaka', 'kabupaten', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'NTT_KOTA_KUPANG', 'Kota Kupang', 'kota', 0, 0, id FROM regions WHERE code = 'NUSA_TENGGARA_TIMUR'
ON CONFLICT (code) DO NOTHING;

-- KALIMANTAN_BARAT
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALBAR_KAB_SAMBAS', 'Kabupaten Sambas', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALBAR_KAB_BENGKAYANG', 'Kabupaten Bengkayang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALBAR_KAB_LANDAK', 'Kabupaten Landak', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALBAR_KAB_MEMPAWAH', 'Kabupaten Mempawah', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALBAR_KAB_SANGGAU', 'Kabupaten Sanggau', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALBAR_KAB_KETAPANG', 'Kabupaten Ketapang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALBAR_KAB_SINTANG', 'Kabupaten Sintang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALBAR_KAB_KAPUAS_HULU', 'Kabupaten Kapuas Hulu', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALBAR_KAB_SEKADAU', 'Kabupaten Sekadau', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALBAR_KAB_MELAWI', 'Kabupaten Melawi', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALBAR_KAB_KAYONG_UTARA', 'Kabupaten Kayong Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALBAR_KAB_KUBU_RAYA', 'Kabupaten Kubu Raya', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALBAR_KOTA_PONTIANAK', 'Kota Pontianak', 'kota', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALBAR_KOTA_SINGKAWANG', 'Kota Singkawang', 'kota', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_BARAT'
ON CONFLICT (code) DO NOTHING;

-- KALIMANTAN_TENGAH
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTENG_KAB_KOBAR', 'Kabupaten Kotawaringin Barat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTENG_KAB_KOTIM', 'Kabupaten Kotawaringin Timur', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTENG_KAB_KAPUAS', 'Kabupaten Kapuas', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTENG_KAB_BARITO_SELATAN', 'Kabupaten Barito Selatan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTENG_KAB_BARITO_UTARA', 'Kabupaten Barito Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTENG_KAB_SUKAMARA', 'Kabupaten Sukamara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTENG_KAB_LAMANDAU', 'Kabupaten Lamandau', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTENG_KAB_SERUYAN', 'Kabupaten Seruyan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTENG_KAB_KATINGAN', 'Kabupaten Katingan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTENG_KAB_PULANG_PISAU', 'Kabupaten Pulang Pisau', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTENG_KAB_GUNUNG_MAS', 'Kabupaten Gunung Mas', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTENG_KAB_BARITO_TIMUR', 'Kabupaten Barito Timur', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTENG_KAB_MURUNG_RAYA', 'Kabupaten Murung Raya', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTENG_KOTA_PALANGKARAYA', 'Kota Palangka Raya', 'kota', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TENGAH'
ON CONFLICT (code) DO NOTHING;

-- KALIMANTAN_SELATAN
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALSEL_KAB_TANAH_LAUT', 'Kabupaten Tanah Laut', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALSEL_KAB_KOTABARU', 'Kabupaten Kotabaru', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALSEL_KAB_BANJAR', 'Kabupaten Banjar', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALSEL_KAB_BARITO_KUALA', 'Kabupaten Barito Kuala', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALSEL_KAB_TAPIN', 'Kabupaten Tapin', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALSEL_KAB_HSS', 'Kabupaten Hulu Sungai Selatan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALSEL_KAB_HST', 'Kabupaten Hulu Sungai Tengah', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALSEL_KAB_HSU', 'Kabupaten Hulu Sungai Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALSEL_KAB_TABALONG', 'Kabupaten Tabalong', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALSEL_KAB_TANAH_BUMBU', 'Kabupaten Tanah Bumbu', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALSEL_KAB_BALANGAN', 'Kabupaten Balangan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALSEL_KOTA_BANJARMASIN', 'Kota Banjarmasin', 'kota', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALSEL_KOTA_BANJARBARU', 'Kota Banjarbaru', 'kota', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_SELATAN'
ON CONFLICT (code) DO NOTHING;

-- KALIMANTAN_TIMUR
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTIM_KAB_PASER', 'Kabupaten Paser', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTIM_KAB_KUBAR', 'Kabupaten Kutai Barat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTIM_KAB_KUKAR', 'Kabupaten Kutai Kartanegara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTIM_KAB_KUTIM', 'Kabupaten Kutai Timur', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTIM_KAB_BERAU', 'Kabupaten Berau', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTIM_KAB_PPU', 'Kabupaten Penajam Paser Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTIM_KAB_MAHULU', 'Kabupaten Mahakam Ulu', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTIM_KOTA_BALIKPAPAN', 'Kota Balikpapan', 'kota', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTIM_KOTA_SAMARINDA', 'Kota Samarinda', 'kota', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TIMUR'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTIM_KOTA_BONTANG', 'Kota Bontang', 'kota', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_TIMUR'
ON CONFLICT (code) DO NOTHING;

-- KALIMANTAN_UTARA
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTARA_KAB_BULUNGAN', 'Kabupaten Bulungan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTARA_KAB_MALINAU', 'Kabupaten Malinau', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTARA_KAB_NUNUKAN', 'Kabupaten Nunukan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTARA_KAB_TANA_TIDUNG', 'Kabupaten Tana Tidung', 'kabupaten', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'KALTARA_KOTA_TARAKAN', 'Kota Tarakan', 'kota', 0, 0, id FROM regions WHERE code = 'KALIMANTAN_UTARA'
ON CONFLICT (code) DO NOTHING;

-- SULAWESI_UTARA
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULUT_KAB_BOLMONG', 'Kabupaten Bolaang Mongondow', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULUT_KAB_MINAHASA', 'Kabupaten Minahasa', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULUT_KAB_SANGIHE', 'Kabupaten Kepulauan Sangihe', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULUT_KAB_TALAUD', 'Kabupaten Kepulauan Talaud', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULUT_KAB_MINSEL', 'Kabupaten Minahasa Selatan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULUT_KAB_MINUT', 'Kabupaten Minahasa Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULUT_KAB_BOLMUT', 'Kabupaten Bolaang Mongondow Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULUT_KAB_SITARO', 'Kabupaten Kepulauan Siau Tagulandang Biaro', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULUT_KAB_MITRA', 'Kabupaten Minahasa Tenggara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULUT_KAB_BOLMONG_TIMUR', 'Kabupaten Bolaang Mongondow Timur', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULUT_KAB_BOLMONG_SELATAN', 'Kabupaten Bolaang Mongondow Selatan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULUT_KOTA_MANADO', 'Kota Manado', 'kota', 0, 0, id FROM regions WHERE code = 'SULAWESI_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULUT_KOTA_BITUNG', 'Kota Bitung', 'kota', 0, 0, id FROM regions WHERE code = 'SULAWESI_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULUT_KOTA_TOMOHON', 'Kota Tomohon', 'kota', 0, 0, id FROM regions WHERE code = 'SULAWESI_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULUT_KOTA_KOTAMOBAGU', 'Kota Kotamobagu', 'kota', 0, 0, id FROM regions WHERE code = 'SULAWESI_UTARA'
ON CONFLICT (code) DO NOTHING;

-- SULAWESI_TENGAH
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTENG_KAB_BANGGAI', 'Kabupaten Banggai', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTENG_KAB_POSO', 'Kabupaten Poso', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTENG_KAB_DONGGALA', 'Kabupaten Donggala', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTENG_KAB_TOLITOLI', 'Kabupaten Toli-Toli', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTENG_KAB_BUOL', 'Kabupaten Buol', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTENG_KAB_MOROWALI', 'Kabupaten Morowali', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTENG_KAB_BANGGAI_KEP', 'Kabupaten Banggai Kepulauan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTENG_KAB_PARIMO', 'Kabupaten Parigi Moutong', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTENG_KAB_TOUNA', 'Kabupaten Tojo Una-Una', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTENG_KAB_SIGI', 'Kabupaten Sigi', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTENG_KAB_BANGGAI_LAUT', 'Kabupaten Banggai Laut', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTENG_KAB_MOROWALI_UTARA', 'Kabupaten Morowali Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTENG_KOTA_PALU', 'Kota Palu', 'kota', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGAH'
ON CONFLICT (code) DO NOTHING;

-- SULAWESI_SELATAN
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KAB_SELAYAR', 'Kabupaten Kepulauan Selayar', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KAB_BULUKUMBA', 'Kabupaten Bulukumba', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KAB_BANTAENG', 'Kabupaten Bantaeng', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KAB_JENEPONTO', 'Kabupaten Jeneponto', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KAB_TAKALAR', 'Kabupaten Takalar', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KAB_GOWA', 'Kabupaten Gowa', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KAB_SINJAI', 'Kabupaten Sinjai', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KAB_MAROS', 'Kabupaten Maros', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KAB_PANGKEP', 'Kabupaten Pangkajene dan Kepulauan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KAB_BARRU', 'Kabupaten Barru', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KAB_BONE', 'Kabupaten Bone', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KAB_SOPPENG', 'Kabupaten Soppeng', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KAB_WAJO', 'Kabupaten Wajo', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KAB_SIDRAP', 'Kabupaten Sidenreng Rappang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KAB_PINRANG', 'Kabupaten Pinrang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KAB_ENREKANG', 'Kabupaten Enrekang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KAB_LUWU', 'Kabupaten Luwu', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KAB_TANA_TORAJA', 'Kabupaten Tana Toraja', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KAB_LUWU_UTARA', 'Kabupaten Luwu Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KAB_LUWU_TIMUR', 'Kabupaten Luwu Timur', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KAB_TORAJA_UTARA', 'Kabupaten Toraja Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KOTA_MAKASSAR', 'Kota Makassar', 'kota', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KOTA_PAREPARE', 'Kota Parepare', 'kota', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULSEL_KOTA_PALOPO', 'Kota Palopo', 'kota', 0, 0, id FROM regions WHERE code = 'SULAWESI_SELATAN'
ON CONFLICT (code) DO NOTHING;

-- SULAWESI_TENGGARA
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTRA_KAB_BUTON', 'Kabupaten Buton', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGGARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTRA_KAB_MUNA', 'Kabupaten Muna', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGGARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTRA_KAB_KONAWE', 'Kabupaten Konawe', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGGARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTRA_KAB_KOLAKA', 'Kabupaten Kolaka', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGGARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTRA_KAB_KONSEL', 'Kabupaten Konawe Selatan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGGARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTRA_KAB_BOMBANA', 'Kabupaten Bombana', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGGARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTRA_KAB_WAKATOBI', 'Kabupaten Wakatobi', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGGARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTRA_KAB_KOLUT', 'Kabupaten Kolaka Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGGARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTRA_KAB_BUTON_UTARA', 'Kabupaten Buton Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGGARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTRA_KAB_KONUT', 'Kabupaten Konawe Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGGARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTRA_KAB_KOLTIM', 'Kabupaten Kolaka Timur', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGGARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTRA_KAB_KONKEP', 'Kabupaten Konawe Kepulauan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGGARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTRA_KAB_MUNA_BARAT', 'Kabupaten Muna Barat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGGARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTRA_KAB_BUTON_TENGAH', 'Kabupaten Buton Tengah', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGGARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTRA_KAB_BUTON_SELATAN', 'Kabupaten Buton Selatan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGGARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTRA_KOTA_KENDARI', 'Kota Kendari', 'kota', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGGARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULTRA_KOTA_BAUBAU', 'Kota Bau-Bau', 'kota', 0, 0, id FROM regions WHERE code = 'SULAWESI_TENGGARA'
ON CONFLICT (code) DO NOTHING;

-- GORONTALO
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'GORUT_KAB_BOALEMO', 'Kabupaten Boalemo', 'kabupaten', 0, 0, id FROM regions WHERE code = 'GORONTALO'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'GORUT_KAB_GORONTALO', 'Kabupaten Gorontalo', 'kabupaten', 0, 0, id FROM regions WHERE code = 'GORONTALO'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'GORUT_KAB_POHUWATO', 'Kabupaten Pohuwato', 'kabupaten', 0, 0, id FROM regions WHERE code = 'GORONTALO'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'GORUT_KAB_BONEBOLANGO', 'Kabupaten Bone Bolango', 'kabupaten', 0, 0, id FROM regions WHERE code = 'GORONTALO'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'GORUT_KAB_GORUT', 'Kabupaten Gorontalo Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'GORONTALO'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'GORUT_KOTA_GORONTALO', 'Kota Gorontalo', 'kota', 0, 0, id FROM regions WHERE code = 'GORONTALO'
ON CONFLICT (code) DO NOTHING;

-- SULAWESI_BARAT
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULBAR_KAB_MAMUJU', 'Kabupaten Mamuju', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULBAR_KAB_MAJENE', 'Kabupaten Majene', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULBAR_KAB_POLMAN', 'Kabupaten Polewali Mandar', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULBAR_KAB_MAMASA', 'Kabupaten Mamasa', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULBAR_KAB_PASANGKAYU', 'Kabupaten Pasangkayu', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'SULBAR_KAB_MAMUJU_TENGAH', 'Kabupaten Mamuju Tengah', 'kabupaten', 0, 0, id FROM regions WHERE code = 'SULAWESI_BARAT'
ON CONFLICT (code) DO NOTHING;

-- MALUKU
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'MALUKU_KAB_KEP_TANIMBAR', 'Kabupaten Kepulauan Tanimbar', 'kabupaten', 0, 0, id FROM regions WHERE code = 'MALUKU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'MALUKU_KAB_MALRA', 'Kabupaten Maluku Tenggara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'MALUKU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'MALUKU_KAB_MALTENG', 'Kabupaten Maluku Tengah', 'kabupaten', 0, 0, id FROM regions WHERE code = 'MALUKU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'MALUKU_KAB_BURU', 'Kabupaten Buru', 'kabupaten', 0, 0, id FROM regions WHERE code = 'MALUKU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'MALUKU_KAB_ARU', 'Kabupaten Kepulauan Aru', 'kabupaten', 0, 0, id FROM regions WHERE code = 'MALUKU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'MALUKU_KAB_SBB', 'Kabupaten Seram Bagian Barat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'MALUKU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'MALUKU_KAB_SBT', 'Kabupaten Seram Bagian Timur', 'kabupaten', 0, 0, id FROM regions WHERE code = 'MALUKU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'MALUKU_KAB_MBD', 'Kabupaten Maluku Barat Daya', 'kabupaten', 0, 0, id FROM regions WHERE code = 'MALUKU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'MALUKU_KAB_BURU_SELATAN', 'Kabupaten Buru Selatan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'MALUKU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'MALUKU_KOTA_AMBON', 'Kota Ambon', 'kota', 0, 0, id FROM regions WHERE code = 'MALUKU'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'MALUKU_KOTA_TUAL', 'Kota Tual', 'kota', 0, 0, id FROM regions WHERE code = 'MALUKU'
ON CONFLICT (code) DO NOTHING;

-- MALUKU_UTARA
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'MALUT_KAB_HALBAR', 'Kabupaten Halmahera Barat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'MALUKU_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'MALUT_KAB_HALTENG', 'Kabupaten Halmahera Tengah', 'kabupaten', 0, 0, id FROM regions WHERE code = 'MALUKU_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'MALUT_KAB_KEP_SULA', 'Kabupaten Kepulauan Sula', 'kabupaten', 0, 0, id FROM regions WHERE code = 'MALUKU_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'MALUT_KAB_HALSEL', 'Kabupaten Halmahera Selatan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'MALUKU_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'MALUT_KAB_HALUT', 'Kabupaten Halmahera Utara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'MALUKU_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'MALUT_KAB_HALTIM', 'Kabupaten Halmahera Timur', 'kabupaten', 0, 0, id FROM regions WHERE code = 'MALUKU_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'MALUT_KAB_MOROTAI', 'Kabupaten Pulau Morotai', 'kabupaten', 0, 0, id FROM regions WHERE code = 'MALUKU_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'MALUT_KAB_TALIABU', 'Kabupaten Pulau Taliabu', 'kabupaten', 0, 0, id FROM regions WHERE code = 'MALUKU_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'MALUT_KOTA_TERNATE', 'Kota Ternate', 'kota', 0, 0, id FROM regions WHERE code = 'MALUKU_UTARA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'MALUT_KOTA_TIDORE', 'Kota Tidore Kepulauan', 'kota', 0, 0, id FROM regions WHERE code = 'MALUKU_UTARA'
ON CONFLICT (code) DO NOTHING;

-- PAPUA_BARAT
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PABAR_KAB_MANOKWARI', 'Kabupaten Manokwari', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PABAR_KAB_FAKFAK', 'Kabupaten Fakfak', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PABAR_KAB_KAIMANA', 'Kabupaten Kaimana', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PABAR_KAB_TELUK_WONDAMA', 'Kabupaten Teluk Wondama', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PABAR_KAB_TELUK_BINTUNI', 'Kabupaten Teluk Bintuni', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PABAR_KAB_MANOKWARI_SELATAN', 'Kabupaten Manokwari Selatan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_BARAT'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PABAR_KAB_PEGUNUNGAN_ARFAK', 'Kabupaten Pegunungan Arfak', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_BARAT'
ON CONFLICT (code) DO NOTHING;

-- PAPUA_BARAT_DAYA
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PABARDA_KAB_SORONG', 'Kabupaten Sorong', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_BARAT_DAYA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PABARDA_KAB_SORONG_SELATAN', 'Kabupaten Sorong Selatan', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_BARAT_DAYA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PABARDA_KAB_RAJA_AMPAT', 'Kabupaten Raja Ampat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_BARAT_DAYA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PABARDA_KAB_TAMBRAUW', 'Kabupaten Tambrauw', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_BARAT_DAYA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PABARDA_KAB_MAYBRAT', 'Kabupaten Maybrat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_BARAT_DAYA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PABARDA_KOTA_SORONG', 'Kota Sorong', 'kota', 0, 0, id FROM regions WHERE code = 'PAPUA_BARAT_DAYA'
ON CONFLICT (code) DO NOTHING;

-- PAPUA
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PAPUA_KAB_JAYAPURA', 'Kabupaten Jayapura', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PAPUA_KAB_SARMI', 'Kabupaten Sarmi', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PAPUA_KAB_KEEROM', 'Kabupaten Keerom', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PAPUA_KAB_MAMBERAMO_RAYA', 'Kabupaten Mamberamo Raya', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PAPUA_KAB_WAROPEN', 'Kabupaten Waropen', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PAPUA_KAB_KEP_YAPEN', 'Kabupaten Kepulauan Yapen', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PAPUA_KAB_BIAK_NUMFOR', 'Kabupaten Biak Numfor', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PAPUA_KAB_SUPIORI', 'Kabupaten Supiori', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PAPUA_KOTA_JAYAPURA', 'Kota Jayapura', 'kota', 0, 0, id FROM regions WHERE code = 'PAPUA'
ON CONFLICT (code) DO NOTHING;

-- PAPUA_SELATAN
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PASEL_KAB_MERAUKE', 'Kabupaten Merauke', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PASEL_KAB_BOVEN_DIGOEL', 'Kabupaten Boven Digoel', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PASEL_KAB_MAPPI', 'Kabupaten Mappi', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_SELATAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PASEL_KAB_ASMAT', 'Kabupaten Asmat', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_SELATAN'
ON CONFLICT (code) DO NOTHING;

-- PAPUA_TENGAH
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PATENG_KAB_NABIRE', 'Kabupaten Nabire', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PATENG_KAB_DEIYAI', 'Kabupaten Deiyai', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PATENG_KAB_DOGIYAI', 'Kabupaten Dogiyai', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PATENG_KAB_INTAN_JAYA', 'Kabupaten Intan Jaya', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PATENG_KAB_MIMIKA', 'Kabupaten Mimika', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PATENG_KAB_PANIAI', 'Kabupaten Paniai', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PATENG_KAB_PUNCAK', 'Kabupaten Puncak', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_TENGAH'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PATENG_KAB_PUNCAK_JAYA', 'Kabupaten Puncak Jaya', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_TENGAH'
ON CONFLICT (code) DO NOTHING;

-- PAPUA_PEGUNUNGAN
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PAPEG_KAB_JAYAWIJAYA', 'Kabupaten Jayawijaya', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_PEGUNUNGAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PAPEG_KAB_LANNY_JAYA', 'Kabupaten Lanny Jaya', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_PEGUNUNGAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PAPEG_KAB_MAMBERAMO_TENGAH', 'Kabupaten Mamberamo Tengah', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_PEGUNUNGAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PAPEG_KAB_NDUGA', 'Kabupaten Nduga', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_PEGUNUNGAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PAPEG_KAB_PEG_BINTANG', 'Kabupaten Pegunungan Bintang', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_PEGUNUNGAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PAPEG_KAB_TOLIKARA', 'Kabupaten Tolikara', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_PEGUNUNGAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PAPEG_KAB_YAHUKIMO', 'Kabupaten Yahukimo', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_PEGUNUNGAN'
ON CONFLICT (code) DO NOTHING;
INSERT INTO regions (code, name, level, lat, lng, parent_id)
SELECT 'PAPEG_KAB_YALIMO', 'Kabupaten Yalimo', 'kabupaten', 0, 0, id FROM regions WHERE code = 'PAPUA_PEGUNUNGAN'
ON CONFLICT (code) DO NOTHING;

