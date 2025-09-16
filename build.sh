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
echo "Installing psycopg2-binary..."
pip install --no-cache-dir psycopg2-binary==2.9.5

# Install other Python dependencies
echo "Installing other dependencies..."
pip install --no-cache-dir -r requirements.txt

# Run migration to ensure database schema is up to date
echo "Running database migration..."
cd backend
python migrate.py

# Run diagnosis to check environment
echo "Running environment diagnosis..."
python diagnose.py

echo "Build completed successfully!"