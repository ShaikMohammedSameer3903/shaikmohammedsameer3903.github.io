# Quick Database Fix for PipeLinePro

## Issue: Supabase Table Cache Problem

The error "Could not find the table 'public.pipelines' in the schema cache" indicates that Supabase hasn't refreshed its internal cache after creating the table.

## Quick Fix (2 minutes)

### Step 1: Refresh Schema Cache
1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Copy and paste the contents of `refresh-database.sql`
4. Click **"Run"** to execute

### Step 2: Refresh the Application
1. **Hard refresh** your browser (Ctrl+F5 or Cmd+Shift+R)
2. Or **clear browser cache** for the application
3. Navigate to **"My Pipelines"** page

### Step 3: Test the Fix
- The database error should be gone
- You should see "No pipelines yet" instead of the error
- Try saving a pipeline to test full functionality

---

## What the Refresh Script Does

1. **Verifies table exists** - Checks if pipelines table was created
2. **Shows table structure** - Confirms all columns are present  
3. **Checks RLS status** - Verifies security policies are enabled
4. **Test insert/delete** - Forces Supabase to refresh the schema cache
5. **Cleans up** - Removes test data

---

## If It Still Doesn't Work

### Alternative Solution:
1. **Restart Supabase**: In dashboard → Settings → Database → Restart project
2. **Wait 2-3 minutes**: Sometimes schema updates take time to propagate
3. **Check permissions**: Ensure your API key has table access

### Manual Table Creation:
If the SQL doesn't work, create the table manually:
1. **Table Editor** → **New table**
2. **Name**: `pipelines`
3. **Columns**: Add all fields from the original schema
4. **Enable RLS**: Toggle Row Level Security
5. **Add policies**: Create user-specific access policies

---

## Expected Result

After running the refresh script:
- ✅ No more "Could not find table" errors
- ✅ My Pipelines page loads correctly  
- ✅ Save pipeline functionality works
- ✅ Full CRUD operations available

The schema cache refresh should resolve the database issue immediately.
