# wsgi.py - WSGI entry point for Render deployment
import sys
import os
import logging

# Set up logging to see errors
logging.basicConfig(stream=sys.stderr, level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Try to import psycopg2 and handle potential issues
try:
    import psycopg2
    logger.info("psycopg2 imported successfully")
except ImportError as e:
    logger.warning(f"psycopg2 import failed: {str(e)}")
    try:
        # Try alternative import
        from psycopg2 import extensions
        logger.info("psycopg2 imported successfully (from psycopg2.extensions)")
    except ImportError as e2:
        logger.error(f"psycopg2 import failed: {str(e2)}")
        # Set a flag to indicate database issues
        os.environ['DB_ISSUES'] = 'true'

try:
    # Import and create the Flask application
    from app import create_app
    application = create_app()
    logger.info("Application created successfully")
except Exception as e:
    logger.error(f"Error creating application: {str(e)}")
    logger.exception("Full traceback:")
    # Create a minimal application for debugging
    from flask import Flask
    application = Flask(__name__)
    
    @application.route('/')
    def health_check():
        return "Application is running but there may be database connection issues"
    
    @application.route('/debug')
    def debug_info():
        import subprocess
        try:
            result = subprocess.run(['pip', 'freeze'], capture_output=True, text=True)
            return f"<pre>{result.stdout}</pre>"
        except Exception as e:
            return f"Error getting pip freeze: {str(e)}"

if __name__ == "__main__":
    application.run()