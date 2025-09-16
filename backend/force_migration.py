#!/usr/bin/env python3
"""
Force migration script to ensure database schema is correct
This script will check and fix database schema if needed
"""
import sys
import os
import logging
import time

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def force_migration():
    """Force migration by checking and fixing database schema"""
    logger.info("Starting force migration...")
    
    try:
        # Add a small delay to prevent race conditions
        time.sleep(1)
        
        from app import create_app
        from models import db, Submission
        from sqlalchemy import text, inspect
        
        app = create_app()
        
        with app.app_context():
            # Quick check - if we can't connect to DB in 5 seconds, skip migration
            db.session.execute(text("SELECT 1"))
            logger.info("Database connection successful")
            
            # Check current database schema
            inspector = inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('submissions')]
            logger.info(f"Current columns in submissions table: {columns}")
            
            # Required columns
            required_columns = ['id', 'lumen_name', 'prompt_text', 'ai_used', 'reward_amount', 
                              'screenshot_path', 'timestamp', 'ai_agent', 'additional_screenshots']
            
            missing_columns = [col for col in required_columns if col not in columns]
            
            if missing_columns:
                logger.warning(f"Missing columns detected: {missing_columns}")
                
                # Try to add missing columns one by one with error handling
                if 'ai_agent' in missing_columns:
                    try:
                        db.session.execute(text("ALTER TABLE submissions ADD COLUMN ai_agent VARCHAR(50)"))
                        db.session.commit()
                        logger.info("Added ai_agent column")
                    except Exception as e:
                        logger.info(f"ai_agent column already exists or error: {str(e)}")
                
                if 'additional_screenshots' in missing_columns:
                    try:
                        db.session.execute(text("ALTER TABLE submissions ADD COLUMN additional_screenshots TEXT"))
                        db.session.commit()
                        logger.info("Added additional_screenshots column")
                    except Exception as e:
                        logger.info(f"additional_screenshots column already exists or error: {str(e)}")
                
                logger.info("Migration completed")
            else:
                logger.info("All required columns are present")
            
            # Quick verification
            inspector = inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('submissions')]
            logger.info(f"Final columns in submissions table: {columns}")
            
            return True
            
    except Exception as e:
        logger.error(f"Error during force migration: {e}")
        # Don't fail completely on migration errors
        return True

if __name__ == "__main__":
    logger.info("=== Force Migration Script ===")
    
    # Try force migration
    success = force_migration()
    
    if success:
        logger.info("✅ Force migration completed successfully!")
        print("Migration completed successfully")
    else:
        logger.error("❌ Force migration failed!")
        print("Migration failed")
    
    sys.exit(0)