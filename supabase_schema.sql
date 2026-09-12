-- ==============================================================================
-- SatQuery AI — Supabase Database DDL & Storage Bucket Initialization
-- Run this complete script in your Supabase project's SQL Editor
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Users table (synchronized with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    username VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'analyst',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create User Settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    theme VARCHAR(32) DEFAULT 'dark',
    language VARCHAR(10) DEFAULT 'en',
    map_provider VARCHAR(64) DEFAULT 'esri-satellite',
    voice_enabled BOOLEAN DEFAULT true,
    auto_tts BOOLEAN DEFAULT false,
    confidence_threshold DOUBLE PRECISION DEFAULT 60.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Images table (satellite rasters)
CREATE TABLE IF NOT EXISTS public.images (
    id VARCHAR(64) PRIMARY KEY,
    project_id INTEGER REFERENCES public.projects(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(1024) NOT NULL,
    preview_path VARCHAR(1024),
    file_size BIGINT DEFAULT 0,
    file_format VARCHAR(32) DEFAULT 'GeoTIFF',
    modality VARCHAR(32) DEFAULT 'Optical',
    sensor VARCHAR(64) DEFAULT 'Sentinel-2',
    acquisition_date VARCHAR(64),
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Image Metadata table
CREATE TABLE IF NOT EXISTS public.image_metadata (
    id SERIAL PRIMARY KEY,
    image_id VARCHAR(64) REFERENCES public.images(id) ON DELETE CASCADE,
    width INTEGER DEFAULT 0,
    height INTEGER DEFAULT 0,
    bands INTEGER DEFAULT 3,
    crs VARCHAR(64) DEFAULT 'EPSG:4326',
    resolution_m DOUBLE PRECISION DEFAULT 10.0,
    min_lat DOUBLE PRECISION,
    max_lat DOUBLE PRECISION,
    min_lon DOUBLE PRECISION,
    max_lon DOUBLE PRECISION,
    cloud_cover DOUBLE PRECISION DEFAULT 0.0,
    mean_brightness DOUBLE PRECISION DEFAULT 128.0,
    contrast_score DOUBLE PRECISION DEFAULT 50.0,
    is_georeferenced BOOLEAN DEFAULT true,
    extra_tags_json TEXT DEFAULT '{}'
);

-- 7. Create Analysis Sessions table
CREATE TABLE IF NOT EXISTS public.analysis_sessions (
    id VARCHAR(64) PRIMARY KEY,
    project_id INTEGER REFERENCES public.projects(id) ON DELETE SET NULL,
    image_id VARCHAR(64) REFERENCES public.images(id) ON DELETE SET NULL,
    secondary_image_id VARCHAR(64),
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    title VARCHAR(255) DEFAULT 'Satellite Analysis Session',
    analysis_type VARCHAR(64) DEFAULT 'General',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create Queries table (conversation query logs)
CREATE TABLE IF NOT EXISTS public.queries (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(64) REFERENCES public.analysis_sessions(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    source VARCHAR(20) DEFAULT 'text',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Create Analysis Results table (multimodal AI answers)
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) REFERENCES public.analysis_sessions(id) ON DELETE CASCADE,
    query_id INTEGER REFERENCES public.queries(id) ON DELETE SET NULL,
    task_type VARCHAR(64) DEFAULT 'VQA',
    answer_text TEXT NOT NULL,
    answer_hindi TEXT,
    answer_kannada TEXT,
    confidence_score DOUBLE PRECISION DEFAULT 85.0,
    reliability_score VARCHAR(32) DEFAULT 'High',
    reliability_reason TEXT,
    model_name VARCHAR(128) DEFAULT 'SatQuery RS-VLM',
    execution_time_ms INTEGER DEFAULT 450,
    timeline_json TEXT DEFAULT '[]',
    metrics_json TEXT DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Create Evidence Regions table (GIS vector polygons)
CREATE TABLE IF NOT EXISTS public.evidence_regions (
    id SERIAL PRIMARY KEY,
    result_id VARCHAR(64) REFERENCES public.analysis_results(id) ON DELETE CASCADE,
    label VARCHAR(128) NOT NULL,
    region_type VARCHAR(64) DEFAULT 'polygon',
    geojson TEXT NOT NULL,
    confidence DOUBLE PRECISION DEFAULT 90.0,
    area_sqm DOUBLE PRECISION DEFAULT 0.0,
    attributes_json TEXT DEFAULT '{}'
);

-- 11. Create Reports table (PDF intelligence reports)
CREATE TABLE IF NOT EXISTS public.reports (
    id VARCHAR(64) PRIMARY KEY,
    project_id INTEGER REFERENCES public.projects(id) ON DELETE SET NULL,
    session_id VARCHAR(64) REFERENCES public.analysis_sessions(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(1024) NOT NULL,
    file_size BIGINT DEFAULT 0,
    summary_text TEXT,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Create Model Runs table (audit log)
CREATE TABLE IF NOT EXISTS public.model_runs (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(128) NOT NULL,
    model_version VARCHAR(32) DEFAULT '1.0.0',
    task VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'SUCCESS',
    duration_ms INTEGER DEFAULT 0,
    input_shape VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 13. Enable Row Level Security (RLS) on all tables
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_runs ENABLE ROW LEVEL SECURITY;

-- Create permissive RLS policies for seamless platform access
DO $$
BEGIN
    -- users
    EXECUTE 'CREATE POLICY "Allow public read on users" ON public.users FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Allow authenticated insert on users" ON public.users FOR INSERT WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow update own user" ON public.users FOR UPDATE USING (true)';

    -- user_settings
    EXECUTE 'CREATE POLICY "Allow public read on user_settings" ON public.user_settings FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Allow upsert on user_settings" ON public.user_settings FOR ALL USING (true)';

    -- projects
    EXECUTE 'CREATE POLICY "Allow public read on projects" ON public.projects FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Allow public insert on projects" ON public.projects FOR INSERT WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow public update on projects" ON public.projects FOR UPDATE USING (true)';

    -- images
    EXECUTE 'CREATE POLICY "Allow public read on images" ON public.images FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Allow public insert on images" ON public.images FOR INSERT WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow public update on images" ON public.images FOR UPDATE USING (true)';
    EXECUTE 'CREATE POLICY "Allow public delete on images" ON public.images FOR DELETE USING (true)';

    -- image_metadata
    EXECUTE 'CREATE POLICY "Allow public read on image_metadata" ON public.image_metadata FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Allow public insert on image_metadata" ON public.image_metadata FOR INSERT WITH CHECK (true)';

    -- analysis_sessions
    EXECUTE 'CREATE POLICY "Allow public read on analysis_sessions" ON public.analysis_sessions FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Allow public insert on analysis_sessions" ON public.analysis_sessions FOR INSERT WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow public update on analysis_sessions" ON public.analysis_sessions FOR UPDATE USING (true)';
    EXECUTE 'CREATE POLICY "Allow public delete on analysis_sessions" ON public.analysis_sessions FOR DELETE USING (true)';

    -- queries
    EXECUTE 'CREATE POLICY "Allow public read on queries" ON public.queries FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Allow public insert on queries" ON public.queries FOR INSERT WITH CHECK (true)';

    -- analysis_results
    EXECUTE 'CREATE POLICY "Allow public read on analysis_results" ON public.analysis_results FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Allow public insert on analysis_results" ON public.analysis_results FOR INSERT WITH CHECK (true)';

    -- evidence_regions
    EXECUTE 'CREATE POLICY "Allow public read on evidence_regions" ON public.evidence_regions FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Allow public insert on evidence_regions" ON public.evidence_regions FOR INSERT WITH CHECK (true)';

    -- reports
    EXECUTE 'CREATE POLICY "Allow public read on reports" ON public.reports FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Allow public insert on reports" ON public.reports FOR INSERT WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow public delete on reports" ON public.reports FOR DELETE USING (true)';

    -- model_runs
    EXECUTE 'CREATE POLICY "Allow public read on model_runs" ON public.model_runs FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Allow public insert on model_runs" ON public.model_runs FOR INSERT WITH CHECK (true)';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ==============================================================================
-- 14. Create Supabase Storage Bucket for Satellite Rasters & Reports
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('satellite-images', 'satellite-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS policies for satellite-images
DO $$
BEGIN
    EXECUTE 'CREATE POLICY "Allow public read on satellite-images" ON storage.objects FOR SELECT USING (bucket_id = ''satellite-images'')';
    EXECUTE 'CREATE POLICY "Allow public insert into satellite-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''satellite-images'')';
    EXECUTE 'CREATE POLICY "Allow public update on satellite-images" ON storage.objects FOR UPDATE USING (bucket_id = ''satellite-images'')';
    EXECUTE 'CREATE POLICY "Allow public delete from satellite-images" ON storage.objects FOR DELETE USING (bucket_id = ''satellite-images'')';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ==============================================================================
-- 15. Automatic User Sync Trigger (from Supabase Auth to public.users)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, username)
    VALUES (
        NEW.id::text,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id::text)
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
