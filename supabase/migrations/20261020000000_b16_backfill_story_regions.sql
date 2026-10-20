-- Backfill missing region_id on stories from submissions
UPDATE stories s
SET region_id = sub.region_id
FROM submissions sub
WHERE (s.id = sub.target_story_id OR lower(trim(s.title)) = lower(trim(sub.title)))
  AND s.region_id IS NULL
  AND sub.region_id IS NOT NULL;

-- Backfill stories without submission region_id (Jakarta area)
UPDATE stories
SET region_id = '159fffb6-f63f-46e5-9535-ab3b2f9c4014'
WHERE title = 'Murtado Macan Kemayoran' AND region_id IS NULL;

UPDATE stories
SET region_id = '40243218-99e4-4fd4-be70-b8a07d917aa8'
WHERE title = 'Si Pitung' AND region_id IS NULL;
