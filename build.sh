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