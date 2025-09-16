#!/usr/bin/env python3
"""
Simple test script to verify database functionality
"""
import os
import sys

# Add backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_database():
    """Test the database functionality"""
    try:
        from app import create_app
        from models import db, Submission
        
        app = create_app()
        
        with app.app_context():
            # Create all tables
            db.create_all()
            
            # Check if the database file was created
            print("Database tables created successfully")
            
            # Check the schema
            print("Columns in submissions table:")
            for column in Submission.__table__.columns:
                print(f"  - {column.name}: {column.type}")
                
            # Run migration to ensure all columns exist
            try:
                from migrate import migrate_database
                migrate_database()
            except Exception as e:
                print(f"Migration step: {str(e)}")
            
            # Test creating a submission
            submission = Submission(
                lumen_name="TestUser",
                prompt_text="Test prompt",
                ai_used="GPT-5",
                ai_agent="Test Agent",
                reward_amount=1.50,
                screenshot_path="uploads/test_screenshot.png",
                additional_screenshots="uploads/test_additional_1.png,uploads/test_additional_2.png"
            )
            
            db.session.add(submission)
            db.session.commit()
            
            # Test retrieving the submission
            retrieved = Submission.query.get(submission.id)
            if retrieved:
                data = retrieved.to_dict()
                print("Submission data:")
                print(f"  - lumen_name: {data['lumen_name']}")
                print(f"  - ai_agent: {data['ai_agent']}")
                print(f"  - additional_screenshots: {data['additional_screenshots']}")
                print("✅ Test completed successfully")
                
                # Clean up
                db.session.delete(retrieved)
                db.session.commit()
            else:
                print("❌ Failed to retrieve submission")
                
    except Exception as e:
        print(f"Error during test: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_database()