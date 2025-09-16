# Project Deployment Structure

This document explains the deployment structure and configuration files for the Project Completion Tracker application.

## File Structure

```
project-tracker/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── auth.py             # Authentication module
│   ├── models.py           # Database models
│   ├── requirements.txt    # Python dependencies
│   ├── migrate.py          # Database migration script
│   ├── diagnose.py         # Environment diagnosis script
│   ├── runtime.txt         # Python version specification for Render
│   ├── wsgi.py             # WSGI entry point for Render deployment
│   └── uploads/            # Uploaded files (screenshots and projects)
├── frontend/
│   ├── src/                # React source code
│   │   ├── App.jsx         # Main application component
│   │   ├── FormPage.jsx    # Submission form component
│   │   ├── PublicSubmissionsPage.jsx # Public gallery component
│   │   ├── components/     # UI components
│   │   │   ├── LandingPage.jsx # Homepage component
│   │   │   └── ProjectDetailsModal.jsx # Project details modal with carousel
│   │   └── apiConfig.js    # API configuration
│   ├── package.json        # Node.js dependencies
│   └── vite.config.js      # Vite build configuration
├── render.yaml             # Render deployment configuration
├── build.sh                # Build script for Render deployment
├── requirements.txt        # Root requirements for Render deployment
├── netlify.toml            # Netlify deployment configuration
├── Dockerfile              # Production Docker configuration
├── docker-compose.yml      # Multi-container Docker setup
├── README.md               # Project documentation
└── LICENSE                 # License information
```

## Deployment Configuration

### Render (Backend)

**render.yaml**
```yaml
services:
  - type: web
    name: project-tracker
    env: python
    buildCommand: "chmod +x build.sh && ./build.sh"
    startCommand: "gunicorn --bind 0.0.0.0:$PORT backend.wsgi:application"
    envVars:
      - key: PYTHON_VERSION
        value: 3.11
```

**backend/runtime.txt**
```
python-3.11.9
```

**build.sh**
```bash
#!/bin/bash
# Build script for Render deployment

# Install system dependencies for psycopg2
apt-get update
apt-get install -y libpq-dev gcc

# Install Python dependencies
pip install -r requirements.txt

# Run migration to ensure database schema is up to date
echo "Running database migration..."
cd backend
python migrate.py

# Run diagnosis to check environment
echo "Running environment diagnosis..."
python diagnose.py
```

### Netlify (Frontend)

**netlify.toml**
```toml
[build]
  command = "npm run build"
  publish = "dist"
  base = "frontend/"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Key Features

### Multiple Screenshot Support
- Users can upload multiple screenshots when submitting a project
- All screenshots are displayed in a carousel in the project details modal
- Backend stores screenshot paths in the `additional_screenshots` column as comma-separated values
- Frontend parses these values and displays them in a user-friendly carousel

### Database Migration
- Automatic migration script handles schema changes for existing deployments
- Supports both SQLite (development) and PostgreSQL (production)
- Gracefully handles existing columns to avoid duplication errors

### Python Version Compatibility
- Specifies Python 3.11 for Render deployment to avoid compatibility issues
- Uses psycopg2-binary version 2.9.9 which is compatible with Python 3.13

### Enhanced Error Handling
- Improved error messages and logging for debugging deployment issues
- Better handling of database schema changes
- Comprehensive environment diagnosis script

## Testing

All components have been tested locally to ensure:
- Frontend builds successfully
- Backend starts without errors
- Database schema is correctly updated
- Multiple screenshot functionality works
- API endpoints function properly
- Migration scripts run successfully

## Deployment Process

1. Push all changes to the main branch
2. Render will automatically deploy the backend using the configuration in `render.yaml`
3. Netlify will automatically deploy the frontend using the configuration in `netlify.toml`
4. Both services should deploy successfully without the previous errors

This structure ensures reliable deployment on both Render and Netlify platforms.