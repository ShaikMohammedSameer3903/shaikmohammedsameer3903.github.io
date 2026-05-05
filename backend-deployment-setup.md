# Backend Deployment Configuration

## Render Deployment (Recommended)

### 1. Prepare Backend for Deployment

Create `backend/Procfile`:
```
web: node server.js
```

### 2. Update backend/package.json

Ensure your backend package.json has:
```json
{
  "name": "cicd-pipeline-builder-backend",
  "version": "1.0.0",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 3. Deploy to Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select only the `backend/` folder
   - Set:
     - **Name**: `cicd-builder-api`
     - **Runtime**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
     - **Instance Type**: `Free`

3. **Add Environment Variables**
   In Render Dashboard → Service → Environment:
   ```
   PORT=3001
   NODE_ENV=production
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 4. Update Frontend API URL

In your frontend, update the API base URL:
```javascript
// src/services/api.js
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://cicd-builder-api.onrender.com'
  : 'http://localhost:3001';
```

## Railway Deployment (Alternative)

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login and Deploy
```bash
railway login
cd backend
railway init
railway up
```

### 3. Set Environment Variables
```bash
railway variables set PORT=3001
railway variables set NODE_ENV=production
railway variables set SUPABASE_URL=your_supabase_url
railway variables set SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Docker Support (Optional)

### 1. Create backend/Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
```

### 2. Create .dockerignore
```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
```

### 3. Build and Run
```bash
cd backend
docker build -t cicd-builder-api .
docker run -p 3001:3001 cicd-builder-api
```
