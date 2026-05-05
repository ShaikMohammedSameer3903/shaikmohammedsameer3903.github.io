-- Create the pipelines table with correct schema
CREATE TABLE IF NOT EXISTS public.pipelines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    platform TEXT NOT NULL,
    language TEXT NOT NULL,
    deployment TEXT NOT NULL,
    pipeline_code TEXT NOT NULL,
    status TEXT DEFAULT 'success'
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;

-- Allow users to manage only their own data
-- We drop existing policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Users can manage their own pipelines" ON public.pipelines;
DROP POLICY IF EXISTS "Users can create their own pipelines" ON public.pipelines;
DROP POLICY IF EXISTS "Users can view their own pipelines" ON public.pipelines;
DROP POLICY IF EXISTS "Users can delete their own pipelines" ON public.pipelines;
DROP POLICY IF EXISTS "Users can update their own pipelines" ON public.pipelines;

CREATE POLICY "Users can manage their own pipelines" 
ON public.pipelines FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT ALL ON public.pipelines TO authenticated;
GRANT ALL ON public.pipelines TO service_role;
