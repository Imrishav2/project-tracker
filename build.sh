#!/bin/bash
# Build script for Render deployment

# Exit on any error
set -e

# Install system dependencies for psycopg2
echo "Installing system dependencies..."
apt-get update
apt-get install -y libpq-dev gcc

# Upgrade pip to latest version
echo "Upgrading pip..."
pip install --upgrade pip

# Install psycopg2-binary first to avoid conflicts
echo "Installing psycopg2-binary version 2.9.5..."
pip install --no-cache-dir psycopg2-binary==2.9.5

# Verify the installation
echo "Verifying psycopg2-binary installation..."
pip show psycopg2-binary

# Install other Python dependencies (without psycopg2-binary)
echo "Installing other dependencies..."
pip install --no-cache-dir Flask==2.3.2 Flask-SQLAlchemy==3.0.5 Flask-CORS==4.0.0 PyJWT==2.7.0 Werkzeug==2.3.6 python-dotenv==1.0.0 gunicorn==21.2.0

# Run migration to ensure database schema is up to date
echo "Running database migration..."
cd backend
python migrate.py

# Run diagnosis to check environment
echo "Running environment diagnosis..."
python diagnose.py

echo "Build completed successfully!"