#!/usr/bin/env python3
"""
Diagnostic script to check environment and dependencies
"""
import os
import sys
import logging

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def diagnose_environment():
    """Diagnose the environment and dependencies"""
    logger.info("=== Environment Diagnosis ===")
    
    # Check Python version
    logger.info(f"Python version: {sys.version}")
    
    # Check environment variables
    logger.info("=== Environment Variables ===")
    env_vars = ['DATABASE_URL', 'SECRET_KEY', 'JWT_SECRET_KEY', 'UPLOAD_FOLDER', 'PYTHONPATH']
    for var in env_vars:
        value = os.environ.get(var, 'NOT SET')
        # Mask sensitive values
        if var in ['SECRET_KEY', 'JWT_SECRET_KEY'] and value != 'NOT SET':
            value = f"SET ({len(value)} chars)"
        logger.info(f"{var}: {value}")
    
    # Try to import dependencies
    logger.info("=== Dependency Check ===")
    dependencies = [
        'flask',
        'flask_sqlalchemy',
        'psycopg2',
        'sqlalchemy',
        'gunicorn',
        'jwt',
        'dotenv'
    ]
    
    for dep in dependencies:
        try:
            __import__(dep)
            logger.info(f"✅ {dep}: OK")
        except ImportError as e:
            logger.error(f"❌ {dep}: {str(e)}")
    
    # Try to import psycopg2 specifically and check version
    logger.info("=== Psycopg2 Check ===")
    try:
        import psycopg2
        # Try to get version info
        try:
            version = getattr(psycopg2, '__version__', 'Version info not available')
            logger.info(f"✅ psycopg2 version: {version}")
        except:
            logger.info("✅ psycopg2 imported successfully")
    except ImportError as e:
        logger.error(f"❌ psycopg2 import failed: {str(e)}")
    
    # Try to import our modules
    logger.info("=== Application Module Check ===")
    try:
        from app import create_app
        logger.info("✅ app module: OK")
    except Exception as e:
        logger.error(f"❌ app module import failed: {str(e)}")
        logger.exception("Full traceback:")
        return False
    
    try:
        from models import db, Submission, AdminUser
        logger.info("✅ models module: OK")
    except Exception as e:
        logger.error(f"❌ models module import failed: {str(e)}")
        logger.exception("Full traceback:")
        return False
    
    try:
        from auth import auth_bp
        logger.info("✅ auth module: OK")
    except Exception as e:
        logger.error(f"❌ auth module import failed: {str(e)}")
        logger.exception("Full traceback:")
        return False
    
    return True

if __name__ == "__main__":
    success = diagnose_environment()
    logger.info("=== Diagnosis Complete ===")
    sys.exit(0 if success else 1)