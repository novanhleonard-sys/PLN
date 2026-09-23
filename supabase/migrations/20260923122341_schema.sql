
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Enums
CREATE TYPE story_type AS ENUM ('legenda', 'mite', 'fabel', 'dongeng');
CREATE TYPE region_group AS ENUM ('sumatera', 'jawa', 'bali_nusra', 'kalimantan', 'sulawesi', 'maluku', 'papua');
CREATE TYPE age_band AS ENUM ('asli', '3-4', '5-6', '7-9', '10-12');
CREATE TYPE submission_status AS ENUM ('submitted', 'triaging', 'verifying', 'needs_review', 'approved', 'rejected');
CREATE TYPE version_status AS ENUM ('processing', 'published', 'unpublished');
CREATE TYPE asset_status AS ENUM ('none', 'generating', 'ready', 'partial', 'failed');
CREATE TYPE job_status AS ENUM ('queued', 'running', 'succeeded', 'failed', 'deferred');

-- Tables
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    preferred_map_style TEXT NOT NULL DEFAULT 'kartun',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('provinsi', 'kabupaten', 'kota')),
    parent_id UUID REFERENCES regions(id),
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    bbox JSONB,
    region_group region_group,
    aliases TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    type story_type NOT NULL,
    region_id UUID REFERENCES regions(id),
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    synopsis TEXT,
    themes TEXT[],
    sensitivity INTEGER NOT NULL DEFAULT 0,
    tier INTEGER NOT NULL DEFAULT 4,
    tier_locked BOOLEAN NOT NULL DEFAULT FALSE,
    status version_status NOT NULL DEFAULT 'processing',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE story_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    sources JSONB NOT NULL,
    contributor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    license TEXT NOT NULL DEFAULT 'CC BY-SA 4.0',
    body TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'id',
    status version_status NOT NULL DEFAULT 'processing',
    asset_status asset_status NOT NULL DEFAULT 'none',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE adaptations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL REFERENCES story_versions(id) ON DELETE CASCADE,
    age_band age_band NOT NULL,
    prompt_version TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'ready', 'failed')),
    audio_status asset_status NOT NULL DEFAULT 'none',
    total_pages INTEGER NOT NULL DEFAULT 0,
    requested_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (version_id, age_band, prompt_version)
);

CREATE TABLE scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL REFERENCES story_versions(id) ON DELETE CASCADE,
    idx INTEGER NOT NULL,
    description TEXT NOT NULL,
    character_ids UUID[],
    image_prompt TEXT,
    image_path TEXT,
    image_status asset_status NOT NULL DEFAULT 'none',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adaptation_id UUID NOT NULL REFERENCES adaptations(id) ON DELETE CASCADE,
    idx INTEGER NOT NULL,
    text TEXT NOT NULL,
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (adaptation_id, idx)
);

CREATE TABLE voice_personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    story_type story_type,
    region_group region_group,
    voice_name TEXT NOT NULL,
    style_prompt TEXT NOT NULL,
    sample_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE page_audio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    persona_id UUID NOT NULL REFERENCES voice_personas(id) ON DELETE RESTRICT,
    path TEXT,
    duration_ms INTEGER,
    status asset_status NOT NULL DEFAULT 'none',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    aliases TEXT[],
    descriptor TEXT NOT NULL,
    ref_image_path TEXT,
    scope TEXT NOT NULL CHECK (scope IN ('global', 'version')),
    version_id UUID REFERENCES story_versions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE saved_stories (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, story_id)
);

CREATE TABLE read_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    version_id UUID NOT NULL REFERENCES story_versions(id) ON DELETE CASCADE,
    adaptation_id UUID NOT NULL REFERENCES adaptations(id) ON DELETE CASCADE,
    last_page INTEGER NOT NULL DEFAULT 1,
    total_pages INTEGER NOT NULL DEFAULT 1,
    mode TEXT NOT NULL,
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, adaptation_id)
);

CREATE TABLE story_stats (
    story_id UUID PRIMARY KEY REFERENCES stories(id) ON DELETE CASCADE,
    reads_count INTEGER NOT NULL DEFAULT 0,
    saves_count INTEGER NOT NULL DEFAULT 0,
    score FLOAT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    type story_type NOT NULL,
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    lat FLOAT,
    lng FLOAT,
    version_label TEXT NOT NULL,
    body TEXT NOT NULL,
    sources JSONB NOT NULL,
    rights_declared BOOLEAN NOT NULL DEFAULT FALSE,
    status submission_status NOT NULL DEFAULT 'submitted',
    reject_reason TEXT,
    admin_note TEXT,
    version_id UUID REFERENCES story_versions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE verification_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    stage TEXT NOT NULL CHECK (stage IN ('triage', 'verify')),
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    verdict TEXT NOT NULL,
    confidence FLOAT NOT NULL,
    output JSONB NOT NULL,
    matched_sources JSONB,
    cost_usd FLOAT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE corpus_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    source TEXT NOT NULL,
    url TEXT,
    license TEXT,
    region_group region_group,
    tale_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE corpus_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_id UUID NOT NULL REFERENCES corpus_docs(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(768) NOT NULL,
    meta JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE style_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_type story_type NOT NULL,
    region_group region_group,
    descriptor TEXT NOT NULL,
    palette JSONB NOT NULL,
    negative_prompt TEXT NOT NULL,
    anchor_image_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE fallback_backgrounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_type story_type,
    path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE age_band_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    band age_band NOT NULL UNIQUE,
    max_sentence_words INTEGER NOT NULL,
    vocab_note TEXT NOT NULL,
    soften_rules TEXT NOT NULL,
    must_keep TEXT NOT NULL,
    prompt_version TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kind TEXT NOT NULL,
    ref_type TEXT NOT NULL,
    ref_id UUID NOT NULL,
    status job_status NOT NULL DEFAULT 'queued',
    attempts INTEGER NOT NULL DEFAULT 0,
    run_after TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    idempotency_key TEXT UNIQUE NOT NULL,
    error TEXT,
    cost_usd FLOAT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    units_in INTEGER NOT NULL DEFAULT 0,
    units_out INTEGER NOT NULL DEFAULT 0,
    cost_usd FLOAT NOT NULL DEFAULT 0,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ref TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Functions
CREATE OR REPLACE FUNCTION free_page_limit(p_adaptation_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_total_pages INTEGER;
BEGIN
    SELECT total_pages INTO v_total_pages FROM adaptations WHERE id = p_adaptation_id;
    RETURN GREATEST(1, FLOOR(0.1 * COALESCE(v_total_pages, 10))::INTEGER);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION claim_job(p_kinds TEXT[], p_limit INTEGER DEFAULT 1)
RETURNS SETOF jobs AS $$
BEGIN
    RETURN QUERY
    UPDATE jobs
    SET status = 'running',
        attempts = attempts + 1,
        run_after = NOW() + INTERVAL '5 minutes'
    WHERE id IN (
        SELECT id
        FROM jobs
        WHERE status = 'queued'
          AND run_after <= NOW()
          AND kind = ANY(p_kinds)
        ORDER BY created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT p_limit
    )
    RETURNING *;
END;
$$ LANGUAGE plpgsql;

-- Trigger for story_stats
CREATE OR REPLACE FUNCTION update_story_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'read_history' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE story_stats SET reads_count = reads_count + 1 WHERE story_id = NEW.story_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'saved_stories' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE story_stats SET saves_count = saves_count + 1 WHERE story_id = NEW.story_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE story_stats SET saves_count = saves_count - 1 WHERE story_id = OLD.story_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_read_history_insert
AFTER INSERT ON read_history
FOR EACH ROW EXECUTE FUNCTION update_story_stats();

CREATE TRIGGER on_saved_stories_change
AFTER INSERT OR DELETE ON saved_stories
FOR EACH ROW EXECUTE FUNCTION update_story_stats();

-- RLS Enablement
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE adaptations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_audio ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE read_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE corpus_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE corpus_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fallback_backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE age_band_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
