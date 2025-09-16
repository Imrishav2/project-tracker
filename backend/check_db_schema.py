#!/usr/bin/env python3
"""
Database schema checker - Run this to verify the database schema
"""
import os
import sys
import logging

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_schema():
    """Check database schema"""
    logger.info("Checking database schema...")
    
    try:
        # Import the app
        from app import create_app
        from sqlalchemy import inspect
        
        app = create_app()
        
        with app.app_context():
            # Get table info
            inspector = inspect(app.extensions['sqlalchemy'].db.engine)
            tables = inspector.get_table_names()
            
            logger.info(f"Tables in database: {tables}")
            
            if 'submissions' in tables:
                columns = [col['name'] for col in inspector.get_columns('submissions')]
                logger.info(f"Columns in submissions table: {columns}")
                
                required_columns = ['id', 'lumen_name', 'prompt_text', 'ai_used', 'reward_amount', 
                                  'screenshot_path', 'timestamp', 'ai_agent', 'additional_screenshots']
                
                missing_columns = [col for col in required_columns if col not in columns]
                
                if missing_columns:
                    logger.error(f"❌ Missing columns: {missing_columns}")
                    return False
                else:
                    logger.info("✅ All required columns are present")
                    return True
            else:
                logger.error("❌ Submissions table not found")
                return False
                
    except Exception as e:
        logger.error(f"Error checking schema: {e}")
        logger.exception("Full traceback:")
        return False

if __name__ == "__main__":
    logger.info("=== Database Schema Checker ===")
    success = check_schema()
    
    if success:
        logger.info("✅ Database schema check passed!")
        print("Schema check passed")
    else:
        logger.error("❌ Database schema check failed!")
        print("Schema check failed")
    
    sys.exit(0 if success else 1)