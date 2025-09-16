#!/bin/bash
# Build script for Render deployment

# Exit on any error
set -e

# Install system dependencies for psycopg2
echo "Installing system dependencies..."
apt-get update
apt-get install -y libpq-dev gcc postgresql-server-dev-all

# Upgrade pip to latest version
echo "Upgrading pip..."
pip install --upgrade pip

# Try to install psycopg2-binary first
echo "Installing psycopg2-binary..."
pip install --no-cache-dir psycopg2-binary

# Verify the installation
echo "Verifying psycopg2-binary installation..."
pip show psycopg2-binary

# Install other Python dependencies
echo "Installing other dependencies..."
pip install --no-cache-dir Flask==2.3.2 Flask-SQLAlchemy==3.0.5 Flask-CORS==4.0.0 PyJWT==2.7.0 Werkzeug==2.3.6 python-dotenv==1.0.0 gunicorn==21.2.0

# Freeze the installed packages to verify versions
echo "Installed packages:"
pip freeze

# Run migration to ensure database schema is up to date
echo "Running database migration..."
cd backend
python migrate.py

# Run diagnosis to check environment
echo "Running environment diagnosis..."
python diagnose.py

echo "Build completed successfully!"