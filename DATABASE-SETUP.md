# Database Setup Instructions for PipeLinePro

## Quick Setup (5 minutes)

### 1. Run SQL in Supabase Dashboard
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Copy and paste the contents of `database-setup.sql`
4. Click "Run" to execute the SQL

### 2. Verify Table Creation
After running the SQL, you should see:
- ✅ `pipelines` table created
- ✅ Indexes created
- ✅ Row Level Security enabled
- ✅ RLS policies created

### 3. Test the Setup
The "My Pipelines" page should now work without the database error.

---

## What the SQL Does

### Creates the pipelines table:
```sql
CREATE TABLE public.pipelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  language TEXT NOT NULL,
  deployment TEXT NOT NULL,
  pipeline_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Enables Security:
- **Row Level Security**: Users can only access their own pipelines
- **RLS Policies**: Automatic filtering by user_id
- **Indexes**: Fast queries for user-specific data

### Features:
- **Automatic timestamps**: created_at and updated_at
- **User isolation**: Complete data separation
- **Referential integrity**: Clean user deletion

---

## Troubleshooting

If you still see errors after running the SQL:

1. **Check the SQL Editor** for any syntax errors
2. **Verify permissions** - make sure you have admin access
3. **Refresh the page** - sometimes the browser cache needs clearing
4. **Check the Supabase logs** in the dashboard

---

## Alternative: Manual Setup

If the SQL doesn't work, you can also:

1. **Use Supabase Table Editor**:
   - Click "Table Editor" → "New table"
   - Name: `pipelines`
   - Add columns as shown above
   - Enable RLS manually

2. **Use Supabase CLI**:
   ```bash
   supabase db push
   ```

The database setup is one-time only. Once completed, your PipeLinePro application will have full pipeline saving functionality.
