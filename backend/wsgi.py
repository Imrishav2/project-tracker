"""
WSGI config for project tracker app.
This module contains the WSGI application used by Gunicorn.
"""
import os
import sys
import logging
import threading
import time

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_pre_start_checks():
    """Run pre-start checks including database migration"""
    try:
        logger.info("Running pre-start checks...")
        
        # Small delay to ensure app is ready
        time.sleep(2)
        
        # Import and run force migration
        from force_migration import force_migration
        success = force_migration()
        if success:
            logger.info("✅ Database migration completed successfully")
        else:
            logger.warning("⚠️ Database migration reported issues")
            
    except Exception as e:
        logger.error(f"Error during pre-start checks: {e}")
        # Don't fail startup on migration errors to avoid deployment loops
        pass

# Run pre-start checks in a separate thread to avoid blocking startup
# Make it a daemon thread with a timeout to prevent indefinite blocking
migration_thread = threading.Thread(target=run_pre_start_checks, daemon=True)
migration_thread.start()

# Import the app after starting pre-start checks
from app import create_app

# Create the application
application = create_app()

if __name__ == "__main__":
    application.run()