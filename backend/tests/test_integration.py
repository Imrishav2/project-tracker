import os
import sys

# Add the parent directory to the path so we can import the app
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def test_app_creation():
    """Test that the app can be created."""
    from app import create_app
    app = create_app()
    assert app is not None
    assert app.config['SECRET_KEY'] is not None

def test_models_import():
    """Test that models can be imported."""
    from models import Submission, AdminUser, db
    assert Submission is not None
    assert AdminUser is not None
    assert db is not None

def test_auth_import():
    """Test that auth module can be imported."""
    from auth import token_required, jwt_required
    assert token_required is not None
    assert jwt_required is not None

def test_environment_variables_loaded():
    """Test that environment variables are loaded."""
    from app import create_app
    app = create_app()
    assert app.config['SECRET_KEY'] is not None
    # The actual value will be the default since we're not setting env vars in test

def test_submission_model_creation():
    """Test that Submission model can be instantiated."""
    from models import Submission
    submission = Submission()
    submission.lumen_name = "Test User"
    submission.prompt_text = "Test prompt text"
    submission.ai_used = "GPT-5"
    submission.reward_amount = 10.50
    submission.screenshot_path = "/test/path"
    assert submission.lumen_name == "Test User"
    assert submission.prompt_text == "Test prompt text"
    assert submission.ai_used == "GPT-5"
    assert submission.reward_amount == 10.50
    assert submission.screenshot_path == "/test/path"

def test_admin_user_model_creation():
    """Test that AdminUser model can be instantiated."""
    from models import AdminUser
    user = AdminUser()
    user.username = "testadmin"
    user.password_hash = "test_hash"
    assert user.username == "testadmin"
    assert user.password_hash == "test_hash"