-- Fixed database refresh for PipeLinePro
-- This version handles the foreign key constraint correctly

-- Step 1: Verify table exists
SELECT 'Table exists' as status 
FROM information_schema.tables 
WHERE table_name = 'pipelines' AND table_schema = 'public';

-- Step 2: Show table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pipelines' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 3: Check if we have any users (for testing)
SELECT COUNT(*) as user_count FROM auth.users LIMIT 1;

-- Step 4: Simple cache refresh - just select from the table
-- This forces Supabase to recognize the table without inserting data
SELECT COUNT(*) as pipeline_count FROM public.pipelines;

-- Step 5: Alternative - If you want to test with a real user, 
-- uncomment and replace with an actual user UUID from your auth.users table
/*
INSERT INTO public.pipelines (user_id, name, platform, language, deployment, pipeline_code)
SELECT 
  id, 
  'Cache Refresh Test', 
  'github-actions', 
  'javascript', 
  'aws-s3', 
  'name: Test\non: push\njobs:\n  build:\n    runs-on: ubuntu-latest'
FROM auth.users 
LIMIT 1;

-- Then clean up
DELETE FROM public.pipelines WHERE name = 'Cache Refresh Test';
*/
