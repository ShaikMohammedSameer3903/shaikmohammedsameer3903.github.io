-- Check if pipelines table exists and its structure
-- If it doesn't exist, create it with the correct schema
CREATE TABLE IF NOT EXISTS public.pipelines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    platform TEXT NOT NULL,
    language TEXT NOT NULL,
    deployment TEXT NOT NULL,
    pipeline_code TEXT NOT NULL,
    status TEXT DEFAULT 'pending'
);

-- Enable Row Level Security
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
DO dev 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'pipelines' AND policyname = 'Users can create their own pipelines'
    ) THEN
        CREATE POLICY "Users can create their own pipelines" 
        ON public.pipelines FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'pipelines' AND policyname = 'Users can view their own pipelines'
    ) THEN
        CREATE POLICY "Users can view their own pipelines" 
        ON public.pipelines FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'pipelines' AND policyname = 'Users can delete their own pipelines'
    ) THEN
        CREATE POLICY "Users can delete their own pipelines" 
        ON public.pipelines FOR DELETE 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'pipelines' AND policyname = 'Users can update their own pipelines'
    ) THEN
        CREATE POLICY "Users can update their own pipelines" 
        ON public.pipelines FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;
END dev;
