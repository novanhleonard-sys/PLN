-- B13: AI Process Runs for Grouping & Configuration

-- 1. Create Enums
CREATE TYPE process_run_scope AS ENUM ('all', 'text_only', 'image_only', 'audio_only');
CREATE TYPE process_run_status AS ENUM ('queued', 'running', 'partially_completed', 'completed', 'failed');

-- 2. Create ai_process_runs table
CREATE TABLE ai_process_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_version_id UUID NOT NULL REFERENCES story_versions(id) ON DELETE CASCADE,
    scope process_run_scope NOT NULL DEFAULT 'all',
    config_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    status process_run_status NOT NULL DEFAULT 'queued',
    total_jobs INTEGER NOT NULL DEFAULT 0,
    completed_jobs INTEGER NOT NULL DEFAULT 0,
    total_attempts INTEGER NOT NULL DEFAULT 0,
    total_cost NUMERIC(10, 5) NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT now(),
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Update jobs table
ALTER TABLE jobs ADD COLUMN process_run_id UUID REFERENCES ai_process_runs(id) ON DELETE CASCADE;

-- 4. Update version_status ENUM
ALTER TYPE version_status ADD VALUE IF NOT EXISTS 'pending_review';
ALTER TYPE version_status ADD VALUE IF NOT EXISTS 'rejected';
ALTER TYPE version_status ADD VALUE IF NOT EXISTS 'ready_to_process';
ALTER TYPE version_status ADD VALUE IF NOT EXISTS 'partially_completed';
ALTER TYPE version_status ADD VALUE IF NOT EXISTS 'completed';
ALTER TYPE version_status ADD VALUE IF NOT EXISTS 'hidden';

-- Add RLS for process_runs
ALTER TABLE ai_process_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read ai_process_runs" ON ai_process_runs FOR SELECT USING (true);
CREATE POLICY "Admin full ai_process_runs" ON ai_process_runs FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

