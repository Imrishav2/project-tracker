import os
import sys
import tempfile
import unittest
from unittest.mock import patch, MagicMock
import io

# Add the parent directory to the path so we can import the app
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

class FileServingTestCase(unittest.TestCase):
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

    def test_uploaded_file_serving(self):
        """Test that uploaded files are served correctly."""
        # Create a test file
        test_filename = 'test_image.png'
        test_content = b'This is a test image file content'
        
        # Save the test file to the upload folder
        upload_folder = self.app.config['UPLOAD_FOLDER']
        file_path = os.path.join(upload_folder, test_filename)
        
        with open(file_path, 'wb') as f:
            f.write(test_content)
        
        # Test that the file is served correctly
        response = self.client.get(f'/uploads/{test_filename}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, test_content)
        
        # Check that the Content-Disposition header is set correctly for images
        self.assertIn('Content-Disposition', response.headers)
        self.assertEqual(response.headers['Content-Disposition'], 'inline')
        
    def test_uploaded_zip_file_serving(self):
        """Test that ZIP files are served with correct Content-Disposition header."""
        # Create a test ZIP file
        test_filename = 'test_project.zip'
        test_content = b'This is a test ZIP file content'
        
        # Save the test file to the upload folder
        upload_folder = self.app.config['UPLOAD_FOLDER']
        file_path = os.path.join(upload_folder, test_filename)
        
        with open(file_path, 'wb') as f:
            f.write(test_content)
        
        # Test that the ZIP file is served correctly
        response = self.client.get(f'/uploads/{test_filename}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, test_content)
        
        # Check that the Content-Disposition header is set correctly for ZIP files
        self.assertIn('Content-Disposition', response.headers)
        self.assertEqual(response.headers['Content-Disposition'], f'attachment; filename="{test_filename}"')
        
    def test_nonexistent_file_serving(self):
        """Test that requesting a nonexistent file returns 404."""
        response = self.client.get('/uploads/nonexistent_file.png')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data.decode(), 'File not found')

if __name__ == '__main__':
    unittest.main()