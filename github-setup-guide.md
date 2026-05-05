# GitHub Pages Setup Instructions

## 🚀 Complete CI/CD Setup for PipeLinePro

### Step 1: Repository Configuration

1. **Update vite.config.js**
   - Replace `/cicd-builder/` with your actual repository name
   - Example: If your repo is `username/pipeline-pro`, use `/pipeline-pro/`

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add CI/CD configuration"
   git push origin main
   ```

### Step 2: GitHub Pages Setup

1. **Enable GitHub Pages**
   - Go to your repository → Settings → Pages
   - Source: **Deploy from a branch**
   - Branch: **gh-pages**
   - Folder: **/(root)**
   - Click **Save**

2. **Configure GitHub Actions Permissions**
   - Go to Settings → Actions → General
   - Workflow permissions: **Read and write permissions**
   - Allow GitHub Actions to create and approve pull requests: **Checked**

### Step 3: Add Repository Secrets

1. **Go to Settings → Secrets and variables → Actions**
2. **Add New Repository Secrets**:

   ```
   VITE_SUPABASE_URL
   Value: https://your-project.supabase.co
   
   VITE_SUPABASE_ANON_KEY
   Value: your_supabase_anon_key
   ```

### Step 4: Trigger First Deployment

1. **Push any change to main branch** (or the workflow will run automatically)
2. **Check Actions tab** to see deployment progress
3. **Once complete**, your site will be available at:
   `https://yourusername.github.io/cicd-builder/`

### Step 5: Backend Deployment (Render)

1. **Prepare Backend**
   ```bash
   cd backend
   # Create Procfile
   echo "web: node server.js" > Procfile
   
   # Update package.json engines
   npm pkg set "engines.node=>=18.0.0"
   ```

2. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Connect GitHub repository
   - Create Web Service with:
     - Root Directory: `backend`
     - Runtime: `Node`
     - Build Command: `npm install`
     - Start Command: `node server.js`

3. **Add Environment Variables in Render**
   ```
   PORT=3001
   NODE_ENV=production
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Step 6: Update Frontend API URL

In your frontend code, update the API base URL to use the deployed backend:

```javascript
// src/services/api.js
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-name.onrender.com'
  : 'http://localhost:3001';
```

### Step 7: Verify Complete Setup

1. **Frontend**: Visit your GitHub Pages URL
2. **Backend**: Test API endpoints at your Render URL
3. **Integration**: Ensure frontend can communicate with backend
4. **CI/CD**: Push changes to see automatic deployment

## 🔧 Troubleshooting

### Common Issues

**GitHub Pages 404 Error:**
- Check `base` path in vite.config.js matches repo name
- Ensure GitHub Pages is enabled for gh-pages branch
- Verify workflow completed successfully

**Backend Connection Error:**
- Check backend is running on Render
- Verify CORS settings include your GitHub Pages URL
- Ensure environment variables are correctly set

**Build Failures:**
- Check Actions tab for error logs
- Verify all dependencies are installed
- Ensure environment variables are properly configured

### Debug Commands

```bash
# Check GitHub Actions logs
gh run list

# View specific workflow run
gh run view <run-id>

# Check Render logs
# Go to Render Dashboard → Your Service → Logs
```

## 📊 Deployment URLs

After successful setup:

- **Frontend**: `https://username.github.io/cicd-builder/`
- **Backend**: `https://app-name.onrender.com`
- **API Health Check**: `https://app-name.onrender.com/api/health`

## 🔄 Automatic Deployment Process

1. **Push to main branch** → GitHub Actions builds and deploys frontend
2. **Push to backend folder** → Render auto-deploys backend
3. **Environment changes** → Update secrets/environment variables
4. **Both services update independently** with zero downtime

## 🎯 Next Steps (Optional)

1. **Add custom domain** to GitHub Pages
2. **Set up monitoring** on Render
3. **Add staging environment** for testing
4. **Implement CI testing** pipeline
5. **Add Docker support** for containerization
