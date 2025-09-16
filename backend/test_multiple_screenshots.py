#!/usr/bin/env python3
"""
Test script to verify multiple screenshot functionality
"""
import os
import sys
import json
from io import BytesIO

# Add backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_multiple_screenshots():
    """Test the multiple screenshot functionality"""
    try:
        from app import create_app
        from models import db, Submission
        
        app = create_app()
        
        with app.app_context():
            # Create a test submission with multiple screenshots
            submission = Submission(
                lumen_name="TestUser",
                prompt_text="Test prompt for multiple screenshots",
                ai_used="GPT-5",
                ai_agent="Test Agent",
                reward_amount=1.50,
                screenshot_path="uploads/test_screenshot.png",
                additional_screenshots="uploads/test_additional_1.png,uploads/test_additional_2.png"
            )
            
            db.session.add(submission)
            db.session.commit()
            
            # Retrieve the submission and verify the data
            retrieved = Submission.query.get(submission.id)
            if retrieved:
                data = retrieved.to_dict()
                print("Submission data:")
                print(json.dumps(data, indent=2))
                
                # Verify that additional screenshots are properly parsed
                if 'additional_screenshots' in data:
                    print(f"\nAdditional screenshots: {data['additional_screenshots']}")
                    print(f"Type: {type(data['additional_screenshots'])}")
                    if isinstance(data['additional_screenshots'], list):
                        print("✅ Additional screenshots correctly parsed as list")
                    else:
                        print("❌ Additional screenshots not parsed as list")
                else:
                    print("❌ Additional screenshots field missing")
                
                # Clean up
                db.session.delete(retrieved)
                db.session.commit()
                print("\n✅ Test completed successfully")
            else:
                print("❌ Failed to retrieve submission")
                
    except Exception as e:
        print(f"Error during test: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_multiple_screenshots()