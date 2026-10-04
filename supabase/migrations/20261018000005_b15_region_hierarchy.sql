-- Add parent_id to region_groups for two-level hierarchy
ALTER TABLE region_groups ADD COLUMN parent_id UUID REFERENCES region_groups(id) ON DELETE CASCADE;
