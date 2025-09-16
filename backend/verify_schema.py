#!/usr/bin/env python3
"""
Script to verify the database schema and run migrations if needed
"""
import sys
import os
import logging

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def verify_and_migrate():
    """Verify database schema and run migration if needed"""
    logger.info("Starting schema verification...")
    
    try:
        from app import create_app
        from models import db
        from sqlalchemy import inspect
        
        app = create_app()
        
        with app.app_context():
            # Check if required columns exist
            inspector = inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('submissions')]
            
            required_columns = ['additional_screenshots', 'ai_agent']
            missing_columns = [col for col in required_columns if col not in columns]
            
            if missing_columns:
                logger.warning(f"Missing columns detected: {missing_columns}")
                logger.info("Running migration to add missing columns...")
                
                # Import and run migration
                from migrate_additional_screenshots import migrate_database
                success = migrate_database()
                
                if success:
                    logger.info("✅ Migration completed successfully")
                    return True
                else:
                    logger.error("❌ Migration failed")
                    return False
            else:
                logger.info("✅ Database schema is up to date")
                return True
                
    except Exception as e:
        logger.error(f"Error during schema verification: {e}")
        logger.exception("Full traceback:")
        return False

if __name__ == "__main__":
    success = verify_and_migrate()
    if success:
        logger.info("✅ Schema verification completed successfully!")
    else:
        logger.error("❌ Schema verification failed!")
    sys.exit(0 if success else 1)