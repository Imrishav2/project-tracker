# Multi-stage Dockerfile for Project Completion Tracker

# Frontend build stage
FROM node:18-alpine AS frontend-build

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./ 
RUN npm ci

# Copy frontend source
COPY frontend/. .

# Build frontend
RUN npm run build

# Backend stage
FROM python:3.11.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/. .

# Copy frontend build to static folder
COPY --from=frontend-build /app/dist ./static

# Create uploads directory
RUN mkdir -p uploads

# Run database migration
RUN python migrate_additional_screenshots.py

# Expose port
EXPOSE 5000

# Environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV SECRET_KEY=change_in_production
ENV JWT_SECRET_KEY=change_in_production

# Run the application
WORKDIR /app/backend
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:create_app()"]