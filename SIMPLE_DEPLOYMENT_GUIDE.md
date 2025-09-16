# Simple Deployment Guide

This guide provides the minimal steps needed to deploy the application successfully.

## Backend Deployment (Render)

### Essential Fixes Applied

1. **Requirements File Location**: 
   - Moved requirements.txt to the root directory
   - This allows Render to find and install dependencies correctly

2. **WSGI Entry Point**:
   - Created backend/wsgi.py for clean application entry
   - This avoids shell parsing issues with parentheses in commands

3. **Database Compatibility**:
   - Updated psycopg2-binary to version 2.8.6
   - This version is stable and compatible with older Python versions

### Render Configuration

1. **Build Command**:
   ```
   pip install -r requirements.txt
   ```

2. **Start Command**:
   ```
   cd backend && gunicorn --bind 0.0.0.0:$PORT wsgi:application
   ```

### Environment Variables

Set these in your Render dashboard:

```
SECRET_KEY = your-secure-value-here
JWT_SECRET_KEY = your-secure-value-here
DATABASE_URL = sqlite:///database.db  # or PostgreSQL for production
UPLOAD_FOLDER = uploads
```

## Frontend Deployment (Netlify)

### Essential Fixes Applied

1. **Corrected Import Paths**:
   - Fixed component import paths in frontend/src/components/
   - Components now correctly import from './EnhancedUI.module.css' instead of './components/EnhancedUI.module.css'

2. **Build Command**:
   ```
   npm run build
   ```

3. **Publish Directory**:
   ```
   dist
   ```

## Deployment Steps

1. Push all changes to GitHub
2. Connect your GitHub repository to Render (backend) and Netlify (frontend)
3. Configure environment variables as specified above
4. Deploy

These minimal changes should get your application working properly without unnecessary complexity.