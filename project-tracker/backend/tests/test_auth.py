import sys
import os

# Add the parent directory to the path so we can import the app
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from auth import token_required, jwt_required

def test_jwt_required_exists():
    """Test that jwt_required function exists"""
    assert jwt_required is not None
    assert callable(jwt_required)

def test_token_required_exists():
    """Test that token_required function exists"""
    assert token_required is not None
    assert callable(token_required)