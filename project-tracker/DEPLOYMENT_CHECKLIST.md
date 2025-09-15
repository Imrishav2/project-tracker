# 🚀 Project Deployment Checklist

Follow this step-by-step checklist to deploy your Project Completion Tracker application.

## ✅ Files Updated

1. **.gitignore** - Added exception for backend/uploads/.gitkeep
2. **frontend/package.json** - Added "start" script
3. **Dockerfile** - Renamed to Dockerfile.bak (to prevent Render from using it)

## 📁 Final Project Structure

```
project-tracker/
├─ Dockerfile.bak           (renamed - ignored by Render)
├─ docker-compose.yml       (for local Docker use)
├─ README.md
├─ .gitignore               (updated with gitkeep exception)
├─ backend/
│  ├─ app.py                (create_app() factory; has /health and /api/... routes)
│  ├─ requirements.txt      (production dependencies)
│  ├─ requirements-dev.txt  (development dependencies)
│  └─ uploads/
│     └─ .gitkeep
└─ frontend/
   ├─ package.json          (updated with start script)
   ├─ src/
   │  ├─ api.js             (uses REACT_APP_API_BASE_URL)
   │  └─ apiConfig.js       (defines API_BASE)
   └─ ... (Vite React app - build output will be dist)
```

## 🔄 Git Commands to Commit Changes

```bash
# Navigate to project directory
cd /path/to/project-tracker

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Fix Render deployment: update deployment instructions"

# Push to GitHub
git push origin main
```

## ☁️ Deploy Backend on Render

1. Go to [Render Dashboard](https://dashboard.render.com) → New → Web Service → Choose your repo `project-tracker`

2. **If Render picks Docker**, change the Language dropdown to **Python** (important)

3. **Branch**: main

4. **Build Command**:
   ```
   pip install -r backend/requirements.txt
   ```

5. **Start Command** (exact command with directory change):
   ```
   cd backend && gunicorn --bind 0.0.0.0:$PORT app:create_app()
   ```
   (This is the key fix for the import error you encountered)

6. **Root Directory**: Leave empty (default)

7. **Environment Variables** (add in Render's UI):
   ```
   SECRET_KEY = your-secure-value-here
   JWT_SECRET_KEY = your-secure-value-here
   ```

8. Click **Create Web Service** and wait for deployment

9. **Test backend health**:
   Open `https://your-app-name.onrender.com/health` (should return JSON)

## 🌐 Deploy Frontend on Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com) → New site from Git → Pick your GitHub repo

2. **Build settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

3. **Environment Variable** (in Netlify site settings → Build & deploy → Environment):
   ```
   REACT_APP_API_BASE_URL = https://your-render-backend-url.onrender.com
   ```
   (Replace with your actual Render backend URL - do NOT add /api at the end)

4. **Deploy** - After build completes you'll have a site URL

## ✅ Quick Testing Checklist

- [ ] Backend health check: `https://<render-url>/health` → Returns JSON
- [ ] Frontend loads: Netlify URL opens UI
- [ ] API requests go to Render URL (check browser devtools network tab)
- [ ] Form submission works
- [ ] Admin dashboard displays submissions

## ⚠️ Important Notes

- **Uploads & Persistence**: Render's filesystem is ephemeral. Files might be lost on redeploy.
- **Error Troubleshooting**: Check Render Logs if deployment fails.
- **Docker**: Dockerfile is temporarily disabled. Can be restored later with proper configuration.

## 🎉 You're Ready!

Your application is now prepared for deployment on Render and Netlify. Follow the steps above and your Project Completion Tracker will be live and accessible to others!