#!/usr/bin/env python3
"""
Script to check the database schema
"""
import os
import sys

# Add backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def check_schema():
    """Check the database schema"""
    try:
        from app import create_app
        from models import db, Submission
        
        app = create_app()
        
        with app.app_context():
            print('Columns in submissions table:')
            for column in Submission.__table__.columns:
                print(f"  - {column.name}: {column.type}")
                
    except Exception as e:
        print(f"Error checking schema: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_schema()