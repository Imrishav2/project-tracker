"""
WSGI config for project tracker app.
This module contains the WSGI application used by Gunicorn.
"""
import os
import sys
import logging

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_pre_start_checks():
    """Run pre-start checks including database migration"""
    try:
        logger.info("Running pre-start checks...")
        
        # Import and run migration
        from migrate_additional_screenshots import migrate_database
        success = migrate_database()
        if success:
            logger.info("✅ Database migration completed successfully")
        else:
            logger.warning("⚠️ Database migration reported issues")
            
    except Exception as e:
        logger.error(f"Error during pre-start checks: {e}")
        # Don't fail startup on migration errors to avoid deployment loops
        pass

# Run pre-start checks
run_pre_start_checks()

# Import the app after pre-start checks
from app import create_app

# Create the application
application = create_app()

if __name__ == "__main__":
    application.run()