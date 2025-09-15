import os
import sys
import tempfile
import unittest
from unittest.mock import patch, MagicMock
from datetime import datetime

# Add the parent directory to the path so we can import the app
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

class ComprehensiveTestCase(unittest.TestCase):
    def setUp(self):
        """Set up test environment."""
        from app import create_app
        from models import db
        
        # Create app with test config
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app.config['UPLOAD_FOLDER'] = tempfile.mkdtemp()
        
        self.client = self.app.test_client()
        
        # Create tables
        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        """Clean up test environment."""
        with self.app.app_context():
            from models import db
            db.session.remove()

    def test_app_creation(self):
        """Test that the app can be created."""
        self.assertIsNotNone(self.app)
        self.assertTrue(self.app.config['SECRET_KEY'])
        
    def test_database_creation(self):
        """Test that database tables are created."""
        with self.app.app_context():
            from models import Submission, AdminUser
            # Test that we can query the tables
            self.assertEqual(Submission.query.count(), 0)
            self.assertEqual(AdminUser.query.count(), 0)
            
    def test_admin_user_model(self):
        """Test AdminUser model."""
        with self.app.app_context():
            from models import AdminUser, db
            from werkzeug.security import check_password_hash, generate_password_hash
            
            # Test user creation
            user = AdminUser()
            user.username = 'testuser'
            user.password_hash = generate_password_hash('testpassword')
            
            db.session.add(user)
            db.session.commit()
            
            # Verify user was saved
            saved_user = AdminUser.query.filter_by(username='testuser').first()
            self.assertIsNotNone(saved_user)
            
            # Test password verification
            if saved_user is not None:
                self.assertTrue(check_password_hash(saved_user.password_hash, 'testpassword'))
                self.assertFalse(check_password_hash(saved_user.password_hash, 'wrongpassword'))
            
    def test_submission_model(self):
        """Test Submission model."""
        with self.app.app_context():
            from models import Submission, db
            
            # Create a submission
            submission = Submission()
            submission.lumen_name = 'Test User'
            submission.prompt_text = 'Test prompt text'
            submission.ai_used = 'GPT-5'
            submission.reward_amount = 10.50
            submission.screenshot_path = 'uploads/test.png'
            
            db.session.add(submission)
            db.session.commit()
            
            # Verify the submission was saved
            saved_submission = Submission.query.first()
            self.assertIsNotNone(saved_submission)
            if saved_submission is not None:
                self.assertEqual(saved_submission.lumen_name, 'Test User')
                self.assertEqual(saved_submission.reward_amount, 10.50)
                self.assertEqual(saved_submission.ai_used, 'GPT-5')
                
    def test_auth_registration(self):
        """Test user registration."""
        response = self.client.post('/api/register', 
                                  json={'username': 'testadmin', 'password': 'testpass'})
        # Registration should succeed
        self.assertEqual(response.status_code, 201)
        
        # Try to register the same user again - should fail
        response = self.client.post('/api/register', 
                                  json={'username': 'testadmin', 'password': 'testpass'})
        self.assertEqual(response.status_code, 400)
        
    def test_auth_login_success(self):
        """Test successful login."""
        # First register a user
        self.client.post('/api/register', 
                        json={'username': 'testadmin', 'password': 'testpass'})
        
        # Then try to login
        response = self.client.post('/api/login', 
                                  json={'username': 'testadmin', 'password': 'testpass'})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('token', data)
        self.assertIn('message', data)
        
    def test_auth_login_failure(self):
        """Test failed login."""
        # First register a user
        self.client.post('/api/register', 
                        json={'username': 'testadmin', 'password': 'testpass'})
        
        # Try to login with wrong password
        response = self.client.post('/api/login', 
                                  json={'username': 'testadmin', 'password': 'wrongpass'})
        self.assertEqual(response.status_code, 401)
        
    def test_health_check(self):
        """Test health check endpoint."""
        response = self.client.get('/health')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('status', data)
        self.assertEqual(data['status'], 'healthy')
        
    def test_environment_variables(self):
        """Test environment variable loading."""
        from dotenv import load_dotenv
        # This test just verifies the function exists and works
        load_dotenv()
        self.assertTrue(True)  # If we get here without exception, it worked
        
    def test_security_imports(self):
        """Test that security-related imports work."""
        try:
            from werkzeug.security import generate_password_hash, check_password_hash
            from werkzeug.utils import secure_filename
            import jwt
            self.assertTrue(True)  # If we get here without exception, imports worked
        except ImportError as e:
            self.fail(f"Security imports failed: {e}")

if __name__ == '__main__':
    unittest.main()