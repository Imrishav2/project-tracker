#!/usr/bin/env python3
"""
Manual database fix script - Run this directly on Render if the automatic migration fails
"""
import os
import sys
import logging

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def manual_fix():
    """Manual database fix"""
    logger.info("Starting manual database fix...")
    
    try:
        # Import the app
        from app import create_app
        from models import db
        from sqlalchemy import text
        
        app = create_app()
        
        with app.app_context():
            # Try to add the missing columns directly
            try:
                logger.info("Attempting to add ai_agent column...")
                db.session.execute(text("ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ai_agent VARCHAR(50)"))
                logger.info("✅ ai_agent column added or already exists")
            except Exception as e:
                logger.error(f"Error adding ai_agent column: {e}")
            
            try:
                logger.info("Attempting to add additional_screenshots column...")
                db.session.execute(text("ALTER TABLE submissions ADD COLUMN IF NOT EXISTS additional_screenshots TEXT"))
                logger.info("✅ additional_screenshots column added or already exists")
            except Exception as e:
                logger.error(f"Error adding additional_screenshots column: {e}")
            
            # Commit changes
            try:
                db.session.commit()
                logger.info("✅ Database changes committed successfully")
            except Exception as e:
                logger.error(f"Error committing changes: {e}")
                db.session.rollback()
            
            logger.info("Manual fix completed")
            return True
            
    except Exception as e:
        logger.error(f"Error during manual fix: {e}")
        logger.exception("Full traceback:")
        return False

if __name__ == "__main__":
    logger.info("=== Manual Database Fix Script ===")
    success = manual_fix()
    
    if success:
        logger.info("✅ Manual database fix completed successfully!")
        print("Manual fix completed successfully")
    else:
        logger.error("❌ Manual database fix failed!")
        print("Manual fix failed")
    
    sys.exit(0 if success else 1)