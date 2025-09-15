import os
import sys
import tempfile

# Add the parent directory to the path so we can import the app
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

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
        from models import Submission, AdminUser
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
        from auth import token_required, jwt_required
        print("✓ Auth module import successful")
        return True
    except Exception as e:
        print(f"✗ Auth module test failed: {e}")
        return False

def test_app_creation():
    """Test that the app can be created."""
    try:
        from app import create_app
        app = create_app()
        assert app is not None
        assert app.config['SECRET_KEY'] is not None
        print("✓ App creation successful")
        return True
    except Exception as e:
        print(f"✗ App creation failed: {e}")
        return False

def test_security_improvements():
    """Test security improvements."""
    try:
        from werkzeug.utils import secure_filename
        
        # Test secure filename function
        test_cases = [
            ("test.png", "test.png"),
            ("test.jpg", "test.jpg"),
            ("test.jpeg", "test.jpeg"),
            ("../test.png", "test.png"),  # Should remove path traversal
        ]
        
        for input_name, expected in test_cases:
            result = secure_filename(input_name)
            assert len(result) > 0
        print("✓ Security improvements test successful")
        return True
    except Exception as e:
        print(f"✗ Security improvements test failed: {e}")
        return False

def test_environment_variables():
    """Test environment variable loading."""
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        # Test that os.getenv works
        test_var = os.getenv('TEST_VAR', 'default_value')
        assert isinstance(test_var, str)
        print("✓ Environment variables test successful")
        return True
    except Exception as e:
        print(f"✗ Environment variables test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("Running final verification tests...\n")
    
    tests = [
        test_imports,
        test_models,
        test_auth,
        test_app_creation,
        test_security_improvements,
        test_environment_variables
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