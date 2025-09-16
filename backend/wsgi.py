# wsgi.py - WSGI entry point for Render deployment
import sys
import logging

# Set up logging to see errors
logging.basicConfig(stream=sys.stderr, level=logging.DEBUG)
logger = logging.getLogger(__name__)

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