-- Drop existing table to recreate with correct schema
DROP TABLE IF EXISTS public.pipelines CASCADE;

-- Create the pipelines table with correct schema
CREATE TABLE public.pipelines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    platform TEXT NOT NULL,
    language TEXT,
    deployment TEXT,
    pipeline_code TEXT NOT NULL,
    description TEXT,
    config JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active'
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can insert their own pipelines" 
ON public.pipelines FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own pipelines" 
ON public.pipelines FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own pipelines" 
ON public.pipelines FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pipelines" 
ON public.pipelines FOR DELETE 
USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.pipelines TO authenticated;
GRANT ALL ON public.pipelines TO service_role;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS pipelines_user_id_idx ON public.pipelines(user_id);
CREATE INDEX IF NOT EXISTS pipelines_created_at_idx ON public.pipelines(created_at DESC);

-- ─── NON-DESTRUCTIVE MIGRATION (for existing tables) ──────────────
-- Run these instead of the DROP/CREATE above if you already have data:
-- ALTER TABLE public.pipelines ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
-- ALTER TABLE public.pipelines ADD COLUMN IF NOT EXISTS description TEXT;
-- ALTER TABLE public.pipelines ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}';
-- ALTER TABLE public.pipelines ALTER COLUMN status SET DEFAULT 'active';
-- ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can access own pipelines" ON public.pipelines FOR ALL USING (auth.uid() = user_id);
