#!/bin/bash
# Build script for Render deployment

# Install system dependencies for psycopg2
apt-get update
apt-get install -y libpq-dev gcc

# Install Python dependencies
pip install -r requirements.txt

# Run diagnosis to check environment
echo "Running environment diagnosis..."
cd backend
python diagnose.py