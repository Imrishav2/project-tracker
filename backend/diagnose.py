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
    env_vars = ['DATABASE_URL', 'SECRET_KEY', 'JWT_SECRET_KEY', 'UPLOAD_FOLDER', 'PYTHONPATH', 'DB_ISSUES']
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
        # Try importing psycopg2-binary as fallback
        try:
            import importlib
            psycopg2_binary = importlib.import_module('psycopg2-binary')
            logger.info("✅ psycopg2-binary imported successfully")
        except ImportError as e2:
            logger.error(f"❌ psycopg2-binary import failed: {str(e2)}")
            # Try importing from psycopg2.extensions
            try:
                from psycopg2 import extensions
                logger.info("✅ psycopg2 imported successfully (from psycopg2.extensions)")
            except ImportError as e3:
                logger.error(f"❌ psycopg2 import failed: {str(e3)}")
    
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
    
    # Test database connection
    logger.info("=== Database Connection Test ===")
    try:
        app = create_app()
        with app.app_context():
            # Try to query the database
            from models import Submission
            try:
                count = Submission.query.count()
                logger.info(f"✅ Database connection successful. Found {count} submissions.")
            except Exception as e:
                logger.warning(f"⚠️  Database query failed (might be empty database): {str(e)}")
                logger.info("✅ Database connection successful.")
    except Exception as e:
        logger.error(f"❌ Database connection failed: {str(e)}")
        logger.exception("Full traceback:")
        return False
    
    # Test database schema
    logger.info("=== Database Schema Test ===")
    try:
        app = create_app()
        with app.app_context():
            from models import db
            # Try to get table info
            try:
                inspector = db.inspect(db.engine)
                tables = inspector.get_table_names()
                logger.info(f"✅ Database tables: {tables}")
                
                # Check if submissions table exists
                if 'submissions' in tables:
                    columns = inspector.get_columns('submissions')
                    column_names = [col['name'] for col in columns]
                    logger.info(f"✅ Submissions table columns: {column_names}")
                else:
                    logger.warning("⚠️  Submissions table not found")
            except Exception as e:
                logger.warning(f"⚠️  Database schema inspection failed: {str(e)}")
    except Exception as e:
        logger.error(f"❌ Database schema test failed: {str(e)}")
        logger.exception("Full traceback:")
    
    return True

if __name__ == "__main__":
    success = diagnose_environment()
    logger.info("=== Diagnosis Complete ===")
    if success:
        logger.info("✅ All checks passed!")
    else:
        logger.error("❌ Some checks failed!")
    sys.exit(0 if success else 1)