-- Simple database refresh for PipeLinePro
-- Run this step by step

-- Step 1: Verify table exists
SELECT 'Table exists' as status 
FROM information_schema.tables 
WHERE table_name = 'pipelines' AND table_schema = 'public';

-- Step 2: Show table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pipelines' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 3: Test insert (this forces cache refresh)
-- Note: This will create a test entry that we'll clean up
INSERT INTO public.pipelines (user_id, name, platform, language, deployment, pipeline_code)
VALUES (
  '00000000-0000-0000-0000-000000000001', 
  'Cache Refresh Test', 
  'github-actions', 
  'javascript', 
  'aws-s3', 
  'name: Test\non: push\njobs:\n  build:\n    runs-on: ubuntu-latest'
);

-- Step 4: Clean up test entry
DELETE FROM public.pipelines 
WHERE user_id = '00000000-0000-0000-0000-000000000001';
