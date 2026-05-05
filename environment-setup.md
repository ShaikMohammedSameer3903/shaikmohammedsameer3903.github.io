# Environment Variables Configuration

## Frontend Environment Variables (.env)

Create `.env` file in project root:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
VITE_API_BASE_URL=http://localhost:3001

# Environment
VITE_NODE_ENV=development
```

### Production Environment Variables
In GitHub repository → Settings → Secrets and variables → Actions:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=https://cicd-builder-api.onrender.com
```

## Backend Environment Variables

Create `backend/.env` file:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Database Configuration
DATABASE_URL=your_database_connection_string

# Security
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:5173
```

### Production Environment Variables (Render/Railway)
In your hosting platform's environment variables section:

```env
PORT=3001
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your_secure_jwt_secret
CORS_ORIGIN=https://yourusername.github.io/cicd-builder
```

## Environment Variable Usage

### Frontend Usage
```javascript
// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Backend Usage
```javascript
// backend/server.js
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}))
```

## Security Best Practices

1. **Never commit .env files** to version control
2. **Use different keys** for development and production
3. **Rotate secrets regularly**
4. **Use environment-specific** configurations
5. **Limit CORS origins** in production

## Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Navigate to Project Settings → API
4. Copy the Project URL and anon key
5. For backend, also get the service_role key
