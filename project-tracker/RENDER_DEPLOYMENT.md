# Render Deployment Instructions

This document provides the correct deployment instructions for Render to fix the errors you encountered.

## Issues Identified

1. **Requirements file error**:
   ```
   ERROR: Could not open requirements file: [Errno 2] No such file or directory: 'requirements.txt'
   ```

2. **Syntax error with parentheses**:
   ```
   bash: -c: line 1: syntax error near unexpected token `('
   ```

## Solution

I've implemented two fixes:

1. **Added a requirements.txt file to the root directory** - Contains the same dependencies as backend/requirements.txt

2. **Created a wsgi.py file in the backend directory** - This avoids the parentheses issue in the gunicorn command

## Updated Render Configuration

1. **Build Command** (can use default or specify explicitly):
   ```
   pip install -r requirements.txt
   ```

2. **Start Command** (now uses the wsgi.py file):
   ```
   cd backend && gunicorn --bind 0.0.0.0:$PORT wsgi:application
   ```

## Why This Fixes the Issues

1. The requirements.txt file in the root directory allows Render to install dependencies correctly

2. The wsgi.py file provides a clean entry point without parentheses:
   - `wsgi:application` instead of `app:create_app()`
   - This avoids shell parsing issues with parentheses

## Environment Variables

Make sure you have these environment variables set in Render:

```
SECRET_KEY = your-secure-value-here
JWT_SECRET_KEY = your-secure-value-here
```

## Troubleshooting

If you still encounter issues:

1. Check that your Build Command is: `pip install -r requirements.txt`
2. Verify that the Start Command is: `cd backend && gunicorn --bind 0.0.0.0:$PORT wsgi:application`
3. Confirm environment variables are set correctly

This should resolve both the requirements file error and the parentheses syntax error, allowing your application to deploy successfully.