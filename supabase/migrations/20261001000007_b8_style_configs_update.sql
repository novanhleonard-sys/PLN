ALTER TABLE style_configs 
ADD COLUMN name TEXT,
ADD COLUMN reference_paths JSONB DEFAULT '[]'::jsonb;

-- Give default names to existing rows
UPDATE style_configs SET name = 'Gaya ' || story_type::text WHERE name IS NULL;
