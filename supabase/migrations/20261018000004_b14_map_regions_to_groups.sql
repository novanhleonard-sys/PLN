-- Seed region_group_id on regions correctly
DO $$
DECLARE
  v_sumatera UUID;
  v_jawa UUID;
  v_bali_nusra UUID;
  v_kalimantan UUID;
  v_sulawesi UUID;
  v_maluku UUID;
  v_papua UUID;
BEGIN
  SELECT id INTO v_sumatera FROM region_groups WHERE slug = 'sumatera';
  SELECT id INTO v_jawa FROM region_groups WHERE slug = 'jawa';
  SELECT id INTO v_bali_nusra FROM region_groups WHERE slug = 'bali_nusra';
  SELECT id INTO v_kalimantan FROM region_groups WHERE slug = 'kalimantan';
  SELECT id INTO v_sulawesi FROM region_groups WHERE slug = 'sulawesi';
  SELECT id INTO v_maluku FROM region_groups WHERE slug = 'maluku';
  SELECT id INTO v_papua FROM region_groups WHERE slug = 'papua';

  -- Sumatera
  UPDATE regions SET region_group_id = v_sumatera WHERE code IN ('ACEH', 'SUMATERA_UTARA', 'SUMATERA_BARAT', 'RIAU', 'JAMBI', 'SUMATERA_SELATAN', 'BENGKULU', 'LAMPUNG', 'KEPULAUAN_BANGKA_BELITUNG', 'KEPULAUAN_RIAU');
  
  -- Jawa
  UPDATE regions SET region_group_id = v_jawa WHERE code IN ('DKI_JAKARTA', 'JAWA_BARAT', 'JAWA_TENGAH', 'DI_YOGYAKARTA', 'JAWA_TIMUR', 'BANTEN');
  
  -- Bali & Nusa Tenggara
  UPDATE regions SET region_group_id = v_bali_nusra WHERE code IN ('BALI', 'NUSA_TENGGARA_BARAT', 'NUSA_TENGGARA_TIMUR');
  
  -- Kalimantan
  UPDATE regions SET region_group_id = v_kalimantan WHERE code IN ('KALIMANTAN_BARAT', 'KALIMANTAN_TENGAH', 'KALIMANTAN_SELATAN', 'KALIMANTAN_TIMUR', 'KALIMANTAN_UTARA');
  
  -- Sulawesi
  UPDATE regions SET region_group_id = v_sulawesi WHERE code IN ('SULAWESI_UTARA', 'SULAWESI_TENGAH', 'SULAWESI_SELATAN', 'SULAWESI_TENGGARA', 'GORONTALO', 'SULAWESI_BARAT');
  
  -- Maluku
  UPDATE regions SET region_group_id = v_maluku WHERE code IN ('MALUKU', 'MALUKU_UTARA');
  
  -- Papua
  UPDATE regions SET region_group_id = v_papua WHERE code IN ('PAPUA_BARAT', 'PAPUA', 'PAPUA_SELATAN', 'PAPUA_TENGAH', 'PAPUA_PEGUNUNGAN', 'PAPUA_BARAT_DAYA');
END $$;
