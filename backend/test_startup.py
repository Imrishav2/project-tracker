#!/usr/bin/env python3
"""
Test script to check if the Flask application can start properly
"""
import os
import sys
import logging

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def test_app_startup():
    """Test if the Flask app can be created and started"""
    try:
        logger.info("Testing application startup...")
        
        # Import the create_app function
        from app import create_app
        
        # Create the app
        logger.info("Creating Flask application...")
        app = create_app()
        
        # Test if app was created successfully
        if app:
            logger.info("✅ Flask application created successfully")
            
            # Test database connection
            with app.app_context():
                from models import db
                logger.info("Testing database connection...")
                # Try to execute a simple query using text()
                from sqlalchemy import text
                result = db.session.execute(text('SELECT 1')).fetchone()
                logger.info("✅ Database connection successful")
                
            return True
        else:
            logger.error("❌ Failed to create Flask application")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error during application startup: {str(e)}")
        logger.exception("Full traceback:")
        return False

if __name__ == "__main__":
    success = test_app_startup()
    sys.exit(0 if success else 1)