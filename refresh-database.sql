-- Refresh and verify pipelines table
-- Run this SQL to refresh the Supabase schema cache

-- First, let's verify the table exists
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'pipelines' AND table_schema = 'public';

-- If the table exists, let's check its structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pipelines' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check RLS status
SELECT tablename, rowsecurity, forcerlspolicy 
FROM pg_tables 
WHERE tablename = 'pipelines' AND schemaname = 'public';

-- Check if RLS policies exist
SELECT policyname, permissive, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'pipelines' AND schemaname = 'public';

-- If everything looks good, try a simple test insert
-- This should work and help refresh the cache
INSERT INTO public.pipelines (user_id, name, platform, language, deployment, pipeline_code)
VALUES (
  gen_random_uuid(), 
  'Test Pipeline', 
  'github-actions', 
  'javascript', 
  'aws-s3', 
  'name: Test Pipeline\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n'
) ON CONFLICT DO NOTHING;

-- Then clean up the test entry
DELETE FROM public.pipelines 
WHERE name = 'Test Pipeline' AND user_id IS NOT NULL;
