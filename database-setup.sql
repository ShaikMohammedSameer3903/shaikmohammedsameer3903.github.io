-- Create pipelines table for PipeLinePro
-- This SQL should be run in the Supabase SQL Editor

-- Create the pipelines table
CREATE TABLE IF NOT EXISTS public.pipelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  language TEXT NOT NULL,
  deployment TEXT NOT NULL,
  pipeline_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS pipelines_user_id_idx ON public.pipelines(user_id);
CREATE INDEX IF NOT EXISTS pipelines_created_at_idx ON public.pipelines(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- 1. Users can view their own pipelines
CREATE POLICY "Users can view own pipelines" ON public.pipelines
  FOR SELECT USING (auth.uid() = user_id);

-- 2. Users can insert their own pipelines
CREATE POLICY "Users can insert own pipelines" ON public.pipelines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own pipelines
CREATE POLICY "Users can update own pipelines" ON public.pipelines
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. Users can delete their own pipelines
CREATE POLICY "Users can delete own pipelines" ON public.pipelines
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.pipelines
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
