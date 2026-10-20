-- Map remaining unmapped regions to their proper region groups
UPDATE regions
SET region_group_id = '0a8096c1-f3f7-46ad-b333-bc0c51ebc71e' -- Simalungun
WHERE name = 'Kabupaten Simalungun' AND region_group_id IS NULL;

UPDATE regions
SET region_group_id = 'f4a7d124-49cb-4242-a016-d7facb9a3b25' -- Minangkabau
WHERE name = 'Sumatera Barat' AND region_group_id IS NULL;

UPDATE regions
SET region_group_id = 'acb8f1da-2232-4b8b-82ce-f96df782b2fa' -- Melayu Palembang–Musi
WHERE name = 'Kota Palembang' AND region_group_id IS NULL;
