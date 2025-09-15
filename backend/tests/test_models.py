import sys
import os

# Add the parent directory to the path so we can import the app
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from models import Submission, AdminUser
from datetime import datetime

def test_submission_model():
    """Test the Submission model creation and representation"""
    submission = Submission()
    submission.lumen_name = "Test User"
    submission.prompt_text = "This is a test prompt"
    submission.ai_used = "GPT-5"
    submission.reward_amount = 10.50
    submission.screenshot_path = "/uploads/test.png"
    
    assert submission.lumen_name == "Test User"
    assert submission.prompt_text == "This is a test prompt"
    assert submission.ai_used == "GPT-5"
    assert submission.reward_amount == 10.50
    assert submission.screenshot_path == "/uploads/test.png"
    assert submission.timestamp is not None

def test_admin_user_model():
    """Test the AdminUser model creation and representation"""
    user = AdminUser()
    user.username = "admin"
    user.password_hash = "hashed_password"
    
    assert user.username == "admin"
    assert user.password_hash == "hashed_password"

def test_submission_to_dict():
    """Test the to_dict method of Submission model"""
    submission = Submission()
    submission.id = 1
    submission.lumen_name = "Test User"
    submission.prompt_text = "This is a test prompt"
    submission.ai_used = "GPT-5"
    submission.reward_amount = 10.50
    submission.screenshot_path = "/uploads/test.png"
    submission.timestamp = datetime(2023, 1, 1, 12, 0, 0)
    
    result = submission.to_dict()
    
    assert result['id'] == 1
    assert result['lumen_name'] == "Test User"
    assert result['prompt_text'] == "This is a test prompt"
    assert result['ai_used'] == "GPT-5"
    assert result['reward_amount'] == 10.50
    assert result['screenshot_path'] == "/uploads/test.png"
    assert result['timestamp'] == "2023-01-01T12:00:00"