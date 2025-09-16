# Render Deployment Troubleshooting Guide

This document provides a comprehensive guide to troubleshoot and resolve common Render deployment issues for the Project Completion Tracker application.

## Issue 1: Requirements File Error

### Error Message
```
ERROR: Could not open requirements file: [Errno 2] No such file or directory: 'requirements.txt'
```

### Root Cause
Render looks for the requirements.txt file in the root directory of the repository, but it was initially located in the backend directory.

### Solution
Created a requirements.txt file in the root directory with the same dependencies as backend/requirements.txt.

## Issue 2: Syntax Error with Parentheses

### Error Message
```
bash: -c: line 1: syntax error near unexpected token `('
```

### Root Cause
The gunicorn start command in Render used `app:create_app()` which contains parentheses that can cause shell parsing issues.

### Solution
Created a wsgi.py file in the backend directory that provides a clean entry point without parentheses:
- Changed from `app:create_app()` to `wsgi:application`

## Issue 3: Python Version Compatibility

### Error Message
```
ImportError: /opt/render/project/src/.venv/lib/python3.13/site-packages/psycopg2/_psycopg.cpython-313-x86_64-linux-gnu.so: undefined symbol: _PyInterpreterState_Get
```

### Root Cause
1. Render was using Python 3.13 by default
2. psycopg2-binary version 2.9.6 was not compatible with Python 3.13

### Solutions Applied

#### 1. Updated psycopg2-binary Version
Updated from version 2.9.6 to 2.9.10 in all requirements files:
- [requirements.txt](file:///c:/whitelist%20group%20project/requirements.txt) (root directory)
- [backend/requirements.txt](file:///c:/whitelist%20group%20project/backend/requirements.txt)
- [backend/requirements-dev.txt](file:///c:/whitelist%20group%20project/backend/requirements-dev.txt)

Version 2.9.10 has better compatibility with Python 3.13.

#### 2. Specified Python Version
Multiple methods to specify Python version:

**Method A: Environment Variable**
Added `PYTHON_VERSION = 3.9.18` to render.yaml:
```yaml
envVars:
  - key: PYTHON_VERSION
    value: 3.9.18
```

**Method B: runtime.txt File**
Created [runtime.txt](file:///c:/whitelist%20group%20project/runtime.txt) in root directory with content:
```
python-3.9.18
```

**Method C: Render Dashboard**
Set the PYTHON_VERSION environment variable directly in the Render dashboard.

## Files Modified

1. [requirements.txt](file:///c:/whitelist%20group%20project/requirements.txt) - Moved to root directory and updated psycopg2-binary version
2. [backend/requirements.txt](file:///c:/whitelist%20group%20project/backend/requirements.txt) - Updated psycopg2-binary version
3. [backend/requirements-dev.txt](file:///c:/whitelist%20group%20project/backend/requirements-dev.txt) - Updated psycopg2-binary version
4. [backend/wsgi.py](file:///c:/whitelist%20group%20project/backend/wsgi.py) - Created for clean entry point
5. [runtime.txt](file:///c:/whitelist%20group%20project/runtime.txt) - Added to specify Python version
6. [render.yaml](file:///c:/whitelist%20group%20project/render.yaml) - Updated to include PYTHON_VERSION environment variable
7. [RENDER_DEPLOYMENT.md](file:///c:/whitelist%20group%20project/RENDER_DEPLOYMENT.md) - Updated documentation
8. [RENDER_TROUBLESHOOTING.md](file:///c:/whitelist%20group%20project/RENDER_TROUBLESHOOTING.md) - This file

## Deployment Verification Steps

1. Push all changes to GitHub
2. Trigger a new deployment on Render
3. Monitor the build logs for any errors
4. Verify the application starts successfully

## Additional Recommendations

1. **Database Configuration**: For production deployments, consider using PostgreSQL instead of SQLite:
   ```
   DATABASE_URL = postgresql://username:password@host:port/database_name
   ```

2. **Environment Variables**: Always use strong, unique values for SECRET_KEY and JWT_SECRET_KEY in production.

3. **Build Cache**: If issues persist, try clearing Render's build cache:
   - In Render dashboard, go to your service settings
   - Click "Clear build cache" button
   - Trigger a new deployment

4. **Logs Monitoring**: Always check the full deployment logs in Render for detailed error information.

These fixes should resolve all the deployment issues and allow your application to deploy successfully on Render.