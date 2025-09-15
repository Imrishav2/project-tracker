import sys
import os

# Add the parent directory to the path so we can import the app
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def test_app_import():
    """Test that we can import the main app module"""
    try:
        from app import create_app
        assert create_app is not None
    except ImportError as e:
        assert False, f"Failed to import app: {e}"

def test_models_import():
    """Test that we can import the models module"""
    try:
        from models import Submission, AdminUser
        assert Submission is not None
        assert AdminUser is not None
    except ImportError as e:
        assert False, f"Failed to import models: {e}"

def test_auth_import():
    """Test that we can import the auth module"""
    try:
        from auth import jwt_required, token_required
        assert jwt_required is not None
        assert token_required is not None
    except ImportError as e:
        assert False, f"Failed to import auth: {e}"