# Deployment Checklist

## Pre-deployment

- [ ] Update version numbers in package.json and requirements.txt if needed
- [ ] Run all tests locally (`npm test` for frontend, `python -m pytest` for backend)
- [ ] Check that all environment variables are properly set
- [ ] Verify database migrations are up to date
- [ ] Review recent code changes for potential issues
- [ ] Ensure all dependencies are properly listed in requirements files

## Backend Deployment (Render)

- [ ] Verify Python version in render.yaml and runtime.txt match (3.11.9)
- [ ] Check that psycopg2-binary version is 2.9.5 (compatible with Python 3.11.9)
- [ ] Ensure build.sh has proper permissions (chmod +x)
- [ ] Verify DATABASE_URL environment variable is set in Render dashboard
- [ ] Check that SECRET_KEY and JWT_SECRET_KEY are properly set
- [ ] Confirm UPLOAD_FOLDER is set correctly

## Frontend Deployment (Netlify)

- [ ] Verify NODE_VERSION is set to 18 in netlify.toml
- [ ] Check that VITE_API_URL points to the correct backend URL
- [ ] Ensure redirects are properly configured in netlify.toml
- [ ] Verify build command is `npm run build`
- [ ] Confirm publish directory is set to `dist`

## Post-deployment

- [ ] Monitor Render logs for any errors during build/deployment
- [ ] Check that the backend health endpoint (/health) is responding
- [ ] Verify that the frontend loads correctly
- [ ] Test form submission functionality
- [ ] Check that file uploads work correctly
- [ ] Verify that public submissions are displayed properly
- [ ] Test admin login and submission management
- [ ] Confirm screenshot previews are working in gallery view

## Troubleshooting

### If deployment fails with psycopg2 errors:
1. Check that psycopg2-binary version is 2.9.5 in requirements.txt
2. Verify Python version is set to 3.11.9
3. Ensure build.sh installs psycopg2-binary before other dependencies
4. Check Render logs for specific error messages

### If frontend doesn't load properly:
1. Check Netlify build logs for errors
2. Verify VITE_API_URL is set correctly
3. Confirm redirects are properly configured
4. Check that all environment variables are set

### If screenshot previews don't work:
1. Verify file paths are stored correctly in the database
2. Check that uploaded files are accessible via the /uploads endpoint
3. Confirm that the frontend is correctly constructing image URLs
4. Test image loading directly in the browser

## Rollback Plan

If deployment fails:
1. Revert to the previous working commit
2. Document the issue and solution
3. Create a hotfix branch for critical issues
4. Test the fix thoroughly before redeploying