#!/usr/bin/env python3
"""
Test script to verify API endpoints are working correctly
"""
import sys
import os
import logging

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_api_endpoints():
    """Test API endpoints"""
    logger.info("Testing API endpoints...")
    
    try:
        from app import create_app
        app = create_app()
        
        with app.test_client() as client:
            # Test health check endpoint
            logger.info("Testing /health endpoint...")
            response = client.get('/health')
            logger.info(f"Health check response: {response.status_code} - {response.get_json()}")
            
            # Test debug endpoint
            logger.info("Testing /debug/env endpoint...")
            response = client.get('/debug/env')
            logger.info(f"Debug env response: {response.status_code} - {response.get_json()}")
            
            # Test database health check
            logger.info("Testing /health/db endpoint...")
            response = client.get('/health/db')
            logger.info(f"Database health check response: {response.status_code} - {response.get_json()}")
            
            # Test public submissions endpoint
            logger.info("Testing /api/public/submissions endpoint...")
            response = client.get('/api/public/submissions')
            logger.info(f"Public submissions response: {response.status_code}")
            if response.status_code == 200:
                data = response.get_json()
                logger.info(f"Public submissions data: {data}")
            else:
                logger.error(f"Public submissions error: {response.get_data(as_text=True)}")
                
        return True
    except Exception as e:
        logger.error(f"Error testing API endpoints: {str(e)}")
        logger.exception("Full traceback:")
        return False

if __name__ == "__main__":
    success = test_api_endpoints()
    if success:
        logger.info("✅ All API endpoint tests passed!")
    else:
        logger.error("❌ Some API endpoint tests failed!")
    sys.exit(0 if success else 1)