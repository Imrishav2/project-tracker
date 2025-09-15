# Netlify Frontend Setup Guide

This guide explains how to connect your React frontend to your Render backend.

## Current Status

Your backend is now live at: https://project-tracker-0ahq.onrender.com/

## Steps to Connect Frontend to Backend

### 1. Update Environment Variable in Netlify

1. Go to your Netlify site settings → "Environment variables"
2. Add the following variable:

| Key | Value |
|-----|-------|
| VITE_API_URL | https://project-tracker-0ahq.onrender.com |

### 2. Verify Frontend Configuration

I've already updated your frontend to use the correct environment variable:

In `frontend/src/apiConfig.js`:
```javascript
const API_BASE = process.env.VITE_API_URL || "http://localhost:5000";
```

This means:
- In production (on Netlify): Uses the VITE_API_URL environment variable
- In development (local): Uses http://localhost:5000 as fallback

### 3. Redeploy Frontend

After adding the environment variable:

1. Trigger a redeploy in Netlify:
   - Click "Deploy site" 
   - OR push a new commit to your repository

Netlify will rebuild the frontend using the new environment variable.

## How It Works

1. The frontend makes API requests to `${API_BASE}/api/...`
2. With VITE_API_URL set to your Render backend URL, requests go to:
   - https://project-tracker-0ahq.onrender.com/api/submit
   - https://project-tracker-0ahq.onrender.com/api/submissions
   - etc.

## Testing the Connection

After redeploying:

1. Visit your Netlify site
2. Open browser developer tools → Network tab
3. Try submitting the form or logging in
4. Check that API requests are going to your Render backend URL

## Troubleshooting

If the frontend still connects to localhost:

1. Verify the environment variable is set correctly in Netlify
2. Check that you triggered a redeploy after adding the variable
3. Clear your browser cache
4. Check the browser console for any errors

The frontend should now successfully communicate with your live backend!