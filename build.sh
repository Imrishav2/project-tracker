#!/bin/bash

# Exit on any error
set -e

# Navigate to the project root
cd "$(dirname "$0")"

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build

# Go back to root
cd ..

# Set up backend
echo "Setting up backend..."
cd backend

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Build completed successfully!"