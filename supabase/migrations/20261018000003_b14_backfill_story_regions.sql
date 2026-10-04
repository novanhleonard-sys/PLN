-- Backfill missing region_id from submissions
UPDATE stories s
SET region_id = sub.region_id
FROM submissions sub
WHERE s.id = sub.target_story_id
  AND s.region_id IS NULL;

-- Alternatively, matching by title for new stories that don't have target_story_id properly linked
UPDATE stories s
SET region_id = sub.region_id
FROM submissions sub
WHERE s.title = sub.title
  AND s.region_id IS NULL;
