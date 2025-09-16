#!/usr/bin/env python3
"""
Test script to verify database connection and psycopg2 import
"""
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_psycopg2_import():
    """Test if we can import psycopg2"""
    try:
        import psycopg2
        print("✅ psycopg2 imported successfully")
        return True
    except ImportError as e:
        print(f"❌ Failed to import psycopg2: {e}")
        return False

def test_database_connection():
    """Test if we can connect to the database"""
    try:
        from app import create_app
        app = create_app()
        with app.app_context():
            # Try to initialize the database
            from models import db
            print("✅ Database initialized successfully")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def main():
    print("Testing database connection and psycopg2 import...")
    print("=" * 50)
    
    psycopg2_ok = test_psycopg2_import()
    print()
    
    db_ok = test_database_connection()
    print()
    
    if psycopg2_ok and db_ok:
        print("🎉 All tests passed!")
        return 0
    else:
        print("💥 Some tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())