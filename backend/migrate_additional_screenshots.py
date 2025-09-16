#!/usr/bin/env python3
"""
Migration script to add additional_screenshots column to submissions table
"""
import sys
import os
import logging

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def migrate_database():
    """Add missing columns to the submissions table"""
    logger.info("Starting database migration...")
    
    try:
        from app import create_app
        from models import db
        
        app = create_app()
        
        with app.app_context():
            # Try to add ai_agent column
            try:
                db.session.execute(db.text("ALTER TABLE submissions ADD COLUMN ai_agent VARCHAR(50)"))
                logger.info("Added ai_agent column to submissions table")
            except Exception as e:
                logger.info(f"ai_agent column already exists or not needed: {str(e)}")
            
            # Try to add additional_screenshots column
            try:
                db.session.execute(db.text("ALTER TABLE submissions ADD COLUMN additional_screenshots TEXT"))
                logger.info("Added additional_screenshots column to submissions table")
            except Exception as e:
                logger.info(f"additional_screenshots column already exists or not needed: {str(e)}")
            
            # Commit the changes
            db.session.commit()
            logger.info("Database migration completed successfully")
            
        return True
    except Exception as e:
        logger.error(f"Error during database migration: {str(e)}")
        logger.exception("Full traceback:")
        return False

if __name__ == "__main__":
    success = migrate_database()
    if success:
        logger.info("✅ Database migration completed successfully!")
        print("Migration completed successfully")
    else:
        logger.error("❌ Database migration failed!")
        print("Migration failed")
    sys.exit(0 if success else 1)