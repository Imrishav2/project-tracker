# Render Deployment Troubleshooting Guide

This guide helps resolve common issues encountered when deploying the Project Completion Tracker to Render.

## Common Error: Requirements File Not Found

### Error Message
```
ERROR: Could not open requirements file: [Errno 2] No such file or directory: 'requirements.txt'
```

### Causes and Solutions

#### 1. Missing requirements.txt in Root Directory
**Cause**: Render looks for requirements.txt in the root directory by default.
**Solution**: 
- Ensure a requirements.txt file exists in the project root
- Verify it contains the necessary dependencies
- Confirm it's committed to your Git repository

#### 2. File Not Committed to Repository
**Cause**: The requirements.txt file exists locally but hasn't been committed.
**Solution**:
```bash
git add requirements.txt
git commit -m "Add requirements.txt for Render deployment"
git push origin main
```

#### 3. Incorrect Render Build Command
**Cause**: Render is using a custom build command that doesn't match your setup.
**Solution**:
- In Render dashboard, set Build Command to: `pip install -r requirements.txt`
- Or use the automatic configuration with render.yaml

## Common Error: Syntax Error with Parentheses

### Error Message
```
bash: -c: line 1: syntax error near unexpected token `('
```

### Cause and Solution

#### Parentheses in Gunicorn Command
**Cause**: Shell parsing issues with parentheses in the start command.
**Solution**:
- Use the wsgi.py approach instead of direct function calls
- Set Start Command to: `cd backend && gunicorn --bind 0.0.0.0:$PORT wsgi:application`

## Verification Steps

### 1. Check File Structure
```bash
# In your project root
ls -la requirements.txt
ls -la backend/wsgi.py
```

### 2. Verify File Contents
```bash
# Check requirements.txt
cat requirements.txt

# Check wsgi.py
cat backend/wsgi.py
```

### 3. Confirm Git Status
```bash
git status
git ls-files | grep requirements.txt
```

## Render Configuration Checklist

### Using render.yaml (Recommended)
- [ ] render.yaml file exists in project root
- [ ] render.yaml contains correct build and start commands
- [ ] render.yaml includes necessary environment variables

### Manual Configuration
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `cd backend && gunicorn --bind 0.0.0.0:$PORT wsgi:application`
- [ ] Environment variables properly set:
  - SECRET_KEY
  - JWT_SECRET_KEY
  - DATABASE_URL
  - UPLOAD_FOLDER

## Environment Variables

Ensure these environment variables are set in Render:

```
SECRET_KEY = your-secure-secret-key
JWT_SECRET_KEY = your-secure-jwt-secret-key
DATABASE_URL = sqlite:///database.db  # or PostgreSQL connection string
UPLOAD_FOLDER = uploads
```

## Advanced Troubleshooting

### 1. Check Render Logs
- Go to your Render dashboard
- Navigate to your service
- Check the "Logs" tab for detailed error information

### 2. Test Locally
```bash
# In project root
pip install -r requirements.txt
cd backend
gunicorn --bind 0.0.0.0:8000 wsgi:application
```

### 3. Verify Python Version
Ensure your local Python version matches Render's default or specify in runtime.txt:
```
# Create runtime.txt in project root
python-3.13.4
```

## Deployment Best Practices

### 1. Use Automatic Configuration
- Include render.yaml for consistent deployments
- This prevents manual configuration errors

### 2. Keep Dependencies Updated
- Regularly update requirements.txt
- Test locally before deploying

### 3. Monitor Deployments
- Check logs after each deployment
- Set up notifications for failed builds

## Contact Support

If issues persist:
1. Check Render's official documentation: https://render.com/docs
2. Review the community forum: https://community.render.com/
3. Contact Render support through the dashboard

## Additional Resources

- [Render Python Documentation](https://render.com/docs/python)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Render Deployment Logs](https://render.com/docs/logging)