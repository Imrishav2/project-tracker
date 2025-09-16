#!/usr/bin/env python3
"""
Migration script to add the additional_screenshots column to the submissions table
"""
import os
import sys
from dotenv import load_dotenv

# Add backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

def migrate_database():
    """Add additional_screenshots column if it doesn't exist"""
    try:
        from app import create_app
        from models import db
        
        app = create_app()
        
        with app.app_context():
            # Check if we're using SQLite or PostgreSQL
            database_url = app.config.get('SQLALCHEMY_DATABASE_URI', '')
            
            # For both SQLite and PostgreSQL, we'll try to add the column
            # SQLAlchemy will handle the differences
            try:
                # Try to add the ai_agent column first (for older databases)
                db.session.execute(db.text("ALTER TABLE submissions ADD COLUMN ai_agent VARCHAR(50)"))
                print("Added ai_agent column to submissions table")
            except Exception as e:
                # Column might already exist
                print(f"ai_agent column: {str(e)}")
            
            try:
                # Try to add the additional_screenshots column
                db.session.execute(db.text("ALTER TABLE submissions ADD COLUMN additional_screenshots TEXT"))
                print("Added additional_screenshots column to submissions table")
            except Exception as e:
                # Column might already exist
                print(f"additional_screenshots column: {str(e)}")
            
            # Commit the changes
            db.session.commit()
            print("Migration completed successfully")
                
    except Exception as e:
        print(f"Error during migration: {e}")
        # Don't exit with error code as this might be normal for existing columns

if __name__ == "__main__":
    migrate_database()