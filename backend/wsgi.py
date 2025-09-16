# wsgi.py - WSGI entry point for Render deployment
import sys
import logging

# Set up logging to see errors
logging.basicConfig(stream=sys.stderr, level=logging.DEBUG)
logger = logging.getLogger(__name__)

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

try:
    from app import create_app
    application = create_app()
    logger.info("Application created successfully")
except Exception as e:
    logger.error(f"Error creating application: {str(e)}")
    logger.exception("Full traceback:")
    raise

if __name__ == "__main__":
    application.run()