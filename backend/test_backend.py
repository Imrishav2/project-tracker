#!/usr/bin/env python3
"""
Simple test script to verify backend components work correctly.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_imports():
    """Test that all required modules can be imported."""
    try:
        from flask import Flask
        print("✓ Flask import successful")
    except ImportError as e:
        print(f"✗ Flask import failed: {e}")
        return False
    
    try:
        from flask_sqlalchemy import SQLAlchemy
        print("✓ SQLAlchemy import successful")
    except ImportError as e:
        print(f"✗ SQLAlchemy import failed: {e}")
        return False
    
    try:
        import jwt
        print("✓ PyJWT import successful")
    except ImportError as e:
        print(f"✗ PyJWT import failed: {e}")
        return False
    
    try:
        from werkzeug.security import generate_password_hash
        print("✓ Werkzeug security import successful")
    except ImportError as e:
        print(f"✗ Werkzeug security import failed: {e}")
        return False
    
    return True

def test_models():
    """Test that models can be imported and instantiated."""
    try:
        # Add backend directory to path
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        
        from models import Submission, AdminUser, db
        print("✓ Models import successful")
        
        # Test model instantiation
        submission = Submission()
        submission.lumen_name = "Test User"
        submission.prompt_text = "Test prompt"
        submission.ai_used = "GPT-5"
        submission.reward_amount = 10.50
        submission.screenshot_path = "/test/path"
        print("✓ Submission model instantiation successful")
        
        user = AdminUser()
        user.username = "testuser"
        user.password_hash = "testhash"
        print("✓ AdminUser model instantiation successful")
        
        return True
    except Exception as e:
        print(f"✗ Models test failed: {e}")
        return False

def test_auth():
    """Test that auth module can be imported."""
    try:
        # Add backend directory to path
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        
        from auth import token_required, jwt_required
        print("✓ Auth module import successful")
        return True
    except Exception as e:
        print(f"✗ Auth module test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("Running backend tests...\n")
    
    tests = [
        test_imports,
        test_models,
        test_auth
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if test():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"✗ Test {test.__name__} failed with exception: {e}")
            failed += 1
        print()
    
    print(f"Tests completed: {passed} passed, {failed} failed")
    
    if failed > 0:
        sys.exit(1)
    else:
        print("All tests passed!")
        sys.exit(0)

if __name__ == '__main__':
    main()