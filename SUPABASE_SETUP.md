# Supabase Database Setup for PipeLinePro

## 1. Create the pipelines table

```sql
-- Create pipelines table
CREATE TABLE pipelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  language TEXT NOT NULL,
  deployment TEXT NOT NULL,
  pipeline_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_pipelines_user_id ON pipelines(user_id);
CREATE INDEX idx_pipelines_created_at ON pipelines(created_at);
```

## 2. Enable Row Level Security (RLS)

```sql
-- Enable RLS on the pipelines table
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
```

## 3. Create RLS Policies

```sql
-- Users can only see their own pipelines
CREATE POLICY "Users can view their own pipelines" ON pipelines
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own pipelines
CREATE POLICY "Users can insert their own pipelines" ON pipelines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own pipelines
CREATE POLICY "Users can update their own pipelines" ON pipelines
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own pipelines
CREATE POLICY "Users can delete their own pipelines" ON pipelines
  FOR DELETE USING (auth.uid() = user_id);
```

## 4. Setup Google Authentication

In your Supabase project:

1. Go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Add your Google OAuth credentials:
   - Client ID from Google Cloud Console
   - Client Secret from Google Cloud Console
4. Add your redirect URL: `http://localhost:5175/*` (for development)

## 5. Environment Variables

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from:
- Supabase Dashboard → Project Settings → API
- Copy the Project URL and Anon Key

## 6. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `https://your-project-ref.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret to Supabase

## 7. Testing the Setup

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:5175`
3. Click "Get Started" → "Continue with Google"
4. Test pipeline creation and saving
5. Check "My Pipelines" page

## 8. Database Verification

You can verify the setup in Supabase Dashboard:

1. Go to **Table Editor** → **pipelines**
2. Check that records are being created
3. Verify user_id matches authenticated user
4. Test RLS policies by trying to access other users' data

## 9. Production Deployment

For production:

1. Update redirect URLs in Google OAuth:
   - `https://your-domain.com/*`
   - `https://your-project-ref.supabase.co/auth/v1/callback`
2. Update environment variables with production values
3. Ensure HTTPS is enabled
4. Test authentication flow thoroughly
