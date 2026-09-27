CREATE TABLE canonical_master_sheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bible_id UUID REFERENCES story_visual_bibles(id) ON DELETE CASCADE,
    image_path TEXT,
    sheet_rows INTEGER NOT NULL,
    sheet_columns INTEGER NOT NULL,
    entity_count INTEGER NOT NULL,
    layout_metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE canonical_references
ADD COLUMN is_canonical BOOLEAN DEFAULT true,
ADD COLUMN master_sheet_id UUID REFERENCES canonical_master_sheets(id) ON DELETE CASCADE,
ADD COLUMN sheet_row INTEGER,
ADD COLUMN sheet_column INTEGER,
ADD COLUMN crop_metadata JSONB;
