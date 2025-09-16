from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from models import db, Submission
from auth import auth_bp, jwt_required, get_current_user
from werkzeug.utils import secure_filename
import os
from datetime import datetime
import logging
from dotenv import load_dotenv
from sqlalchemy import or_
import sys

# Set up logging to see errors
logging.basicConfig(stream=sys.stderr, level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    try:
        # Configuration
        app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
        
        # Check if we have database issues flag set
        db_issues = os.environ.get('DB_ISSUES', 'false').lower() == 'true'
        
        if db_issues:
            logger.warning("Database issues detected, using minimal configuration")
            # Use SQLite in-memory database for debugging
            app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        else:
            # Use PostgreSQL in production, SQLite in development
            database_url = os.environ.get('DATABASE_URL')
            if database_url:
                # Render provides DATABASE_URL for PostgreSQL
                # Handle different URL formats
                if database_url.startswith('postgres://'):
                    # Convert postgres:// to postgresql:// for SQLAlchemy
                    database_url = database_url.replace('postgres://', 'postgresql://', 1)
                app.config['SQLALCHEMY_DATABASE_URI'] = database_url
                logger.info(f"Using PostgreSQL database: {database_url}")
            else:
                # Local development - use SQLite
                app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
                logger.info("Using SQLite database for development")
        
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        app.config['UPLOAD_FOLDER'] = os.environ.get('UPLOAD_FOLDER', 'uploads')
        app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size (increased for project files)
        
        logger.info(f"Database URL: {app.config.get('SQLALCHEMY_DATABASE_URI', 'Not set')}")
        
        # Initialize extensions
        try:
            db.init_app(app)
        except Exception as e:
            logger.error(f"Error initializing database: {str(e)}")
            # Continue without database if there are issues
        
        # Force database schema check and fix
        with app.app_context():
            try:
                from sqlalchemy import inspect, text
                inspector = inspect(db.engine)
                
                # Check if submissions table exists
                if 'submissions' in inspector.get_table_names():
                    # Check columns
                    columns = [col['name'] for col in inspector.get_columns('submissions')]
                    required_columns = ['ai_agent', 'additional_screenshots']
                    missing_columns = [col for col in required_columns if col not in columns]
                    
                    if missing_columns:
                        logger.warning(f"Missing columns in submissions table: {missing_columns}")
                        
                        # Try to add missing columns
                        try:
                            if 'ai_agent' in missing_columns:
                                db.session.execute(text("ALTER TABLE submissions ADD COLUMN ai_agent VARCHAR(50)"))
                                logger.info("Added ai_agent column")
                            
                            if 'additional_screenshots' in missing_columns:
                                db.session.execute(text("ALTER TABLE submissions ADD COLUMN additional_screenshots TEXT"))
                                logger.info("Added additional_screenshots column")
                            
                            db.session.commit()
                            logger.info("Database schema fixed successfully")
                        except Exception as e:
                            logger.error(f"Error fixing database schema: {e}")
                else:
                    logger.info("Submissions table does not exist, will be created automatically")
            except Exception as e:
                logger.error(f"Error checking database schema: {e}")
        
        # Configure CORS to allow all origins for all routes (appropriate for a public API)
        CORS(app)
        
        # Create upload folder if it doesn't exist
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])
        
        # Register blueprints
        app.register_blueprint(auth_bp, url_prefix='/api')
        
        # Serve uploaded files
        @app.route('/uploads/<path:filename>')
        def uploaded_file(filename):
            return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
        
        # Serve frontend static files
        @app.route('/')
        def serve_frontend():
            return send_from_directory('../static', 'index.html')
        
        @app.route('/<path:path>')
        def serve_frontend_files(path):
            # Serve static files (CSS, JS, images, etc.)
            if os.path.exists(os.path.join('../static', path)):
                return send_from_directory('../static', path)
            # For all other routes, serve index.html (for client-side routing)
            else:
                return send_from_directory('../static', 'index.html')
        
        # Health check endpoint
        @app.route('/health')
        def health_check():
            return jsonify({
                'status': 'healthy', 
                'timestamp': datetime.now().isoformat(),
                'db_issues': db_issues,
                'python_version': sys.version
            })
        
        # Enhanced health check endpoint that verifies database schema
        @app.route('/health/schema')
        def schema_health_check():
            if db_issues:
                return jsonify({
                    'status': 'unhealthy',
                    'message': 'Database issues detected',
                    'db_issues': True
                }), 500
            
            try:
                # Check if required columns exist in submissions table
                from models import Submission
                required_columns = ['additional_screenshots', 'ai_agent']
                missing_columns = []
                
                # Get table info
                inspector = db.inspect(db.engine)
                columns = [col['name'] for col in inspector.get_columns('submissions')]
                
                for column in required_columns:
                    if column not in columns:
                        missing_columns.append(column)
                
                if missing_columns:
                    return jsonify({
                        'status': 'unhealthy',
                        'message': f'Missing columns in submissions table: {missing_columns}',
                        'missing_columns': missing_columns
                    }), 500
                else:
                    return jsonify({
                        'status': 'healthy',
                        'message': 'Database schema is correct',
                        'columns': columns
                    })
            except Exception as e:
                return jsonify({
                    'status': 'unhealthy',
                    'message': f'Database schema check failed: {str(e)}',
                    'error': str(e)
                }), 500
        
        # Debug endpoint to check environment
        @app.route('/debug/env')
        def debug_env():
            env_info = {
                'python_version': sys.version,
                'database_url': os.environ.get('DATABASE_URL', 'Not set'),
                'db_issues': os.environ.get('DB_ISSUES', 'Not set'),
                'upload_folder': app.config['UPLOAD_FOLDER'],
                'sqlalchemy_uri': app.config.get('SQLALCHEMY_DATABASE_URI', 'Not set')
            }
            return jsonify(env_info)
        
        # Database recreation endpoint (FOR DEBUGGING ONLY)
        @app.route('/debug/recreate-db', methods=['POST'])
        def recreate_db():
            try:
                logger.warning("Database recreation requested - THIS WILL DELETE ALL DATA")
                
                # Drop all tables
                db.drop_all()
                logger.info("Dropped all tables")
                
                # Create all tables
                db.create_all()
                logger.info("Created all tables")
                
                return jsonify({
                    'status': 'success',
                    'message': 'Database recreated successfully'
                })
            except Exception as e:
                logger.error(f"Error recreating database: {e}")
                return jsonify({
                    'status': 'error',
                    'message': f'Error recreating database: {str(e)}'
                }), 500
        
        # Database health check endpoint
        @app.route('/health/db')
        def db_health_check():
            if db_issues:
                return jsonify({
                    'status': 'unhealthy',
                    'message': 'Database issues detected',
                    'db_issues': True
                }), 500
            
            try:
                # Try to execute a simple query
                from models import db
                db.session.execute(db.text('SELECT 1'))
                return jsonify({
                    'status': 'healthy',
                    'message': 'Database connection successful',
                    'db_issues': False
                })
            except Exception as e:
                return jsonify({
                    'status': 'unhealthy',
                    'message': f'Database connection failed: {str(e)}',
                    'db_issues': True
                }), 500
        
        # Routes
        @app.route('/api/submit', methods=['POST'])
        def submit_form():
            try:
                # Validate required fields
                required_fields = ['lumen_name', 'prompt_text', 'ai_used', 'ai_agent', 'reward_amount']
                for field in required_fields:
                    if field not in request.form or not request.form[field].strip():
                        return jsonify({'error': f'{field} is required'}), 400
                
                # Validate reward amount
                try:
                    reward_amount = float(request.form['reward_amount'])
                    if reward_amount < 0.01:
                        return jsonify({'error': 'Reward amount must be at least 0.01'}), 400
                except ValueError:
                    return jsonify({'error': 'Invalid reward amount'}), 400
                
                # Validate AI used
                valid_ai_options = ['GPT-5', 'Claude', 'LLaMA', 'Gemini', 'Perplexity', 'Other']
                if request.form['ai_used'] not in valid_ai_options:
                    return jsonify({'error': 'Invalid AI option selected'}), 400
                
                # Handle file upload - check for both screenshot and project files
                file = None
                file_type = None
                
                if 'screenshot' in request.files and request.files['screenshot'].filename != '':
                    file = request.files['screenshot']
                    file_type = 'screenshot'
                elif 'project' in request.files and request.files['project'].filename != '':
                    file = request.files['project']
                    file_type = 'project'
                else:
                    return jsonify({'error': 'Either a screenshot or project file is required'}), 400
                
                if not file or not file.filename:
                    return jsonify({'error': 'No file selected'}), 400
                
                # Validate file based on type
                if file_type == 'screenshot':
                    # Validate screenshot file type
                    allowed_extensions = {'png', 'jpg', 'jpeg'}
                    
                    # Check if filename contains extension
                    if '.' not in file.filename:
                        return jsonify({'error': 'Invalid file type. Only .jpg, .jpeg, .png files allowed'}), 400
                    
                    file_ext = file.filename.rsplit('.', 1)[1].lower()
                    if file_ext not in allowed_extensions:
                        return jsonify({'error': 'Invalid file type. Only .jpg, .jpeg, .png files allowed'}), 400
                    
                    # Additional security check for file content
                    if file.content_type not in ['image/png', 'image/jpeg']:
                        return jsonify({'error': 'Invalid file content type'}), 400
                else:  # project file
                    # Validate project file type (zip)
                    allowed_extensions = {'zip'}
                    if '.' not in file.filename:
                        return jsonify({'error': 'Invalid file type. Only .zip files allowed'}), 400
                    
                    file_ext = file.filename.rsplit('.', 1)[1].lower()
                    if file_ext not in allowed_extensions:
                        return jsonify({'error': 'Invalid file type. Only .zip files allowed'}), 400
                    
                    # Additional security check for file content
                    if file.content_type not in ['application/zip', 'application/x-zip-compressed']:
                        return jsonify({'error': 'Invalid file content type. Only ZIP files are allowed'}), 400
                
                # Save primary file securely
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                secure_name = secure_filename(file.filename)
                if not secure_name:
                    secure_name = 'screenshot.png' if file_type == 'screenshot' else 'project.zip'
                
                # Add prefix to distinguish file types
                filename = f"{timestamp}_{file_type}_{secure_name}"
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                
                # Ensure the upload directory exists
                os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
                file.save(file_path)
                
                # Handle additional screenshots
                additional_screenshot_paths = []
                if 'additional_screenshots' in request.files:
                    additional_files = request.files.getlist('additional_screenshots')
                    for i, additional_file in enumerate(additional_files):
                        if additional_file and additional_file.filename:
                            # Validate additional screenshot file type
                            allowed_extensions = {'png', 'jpg', 'jpeg'}
                            
                            # Check if filename contains extension
                            if '.' not in additional_file.filename:
                                continue  # Skip invalid files
                            
                            file_ext = additional_file.filename.rsplit('.', 1)[1].lower()
                            if file_ext not in allowed_extensions:
                                continue  # Skip invalid files
                            
                            # Additional security check for file content
                            if additional_file.content_type not in ['image/png', 'image/jpeg']:
                                continue  # Skip invalid files
                            
                            # Save additional screenshot
                            additional_secure_name = secure_filename(additional_file.filename)
                            if not additional_secure_name:
                                additional_secure_name = f'screenshot_{i+1}.png'
                            
                            additional_filename = f"{timestamp}_additional_{i+1}_{additional_secure_name}"
                            additional_file_path = os.path.join(app.config['UPLOAD_FOLDER'], additional_filename)
                            additional_file.save(additional_file_path)
                            additional_screenshot_paths.append(os.path.join(app.config['UPLOAD_FOLDER'], additional_filename))
                
                # Create submission record with relative path for security
                submission = Submission()
                submission.lumen_name = request.form['lumen_name']
                submission.prompt_text = request.form['prompt_text']
                submission.ai_used = request.form['ai_used']
                submission.ai_agent = request.form['ai_agent']  # Add AI agent field
                submission.reward_amount = reward_amount
                # Store relative path instead of absolute path
                submission.screenshot_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                # Store additional screenshots as comma-separated paths
                if additional_screenshot_paths:
                    submission.additional_screenshots = ','.join(additional_screenshot_paths)
                
                # Only try to save to database if database is working
                if not db_issues:
                    db.session.add(submission)
                    db.session.commit()
                
                logger.info(f"New submission received from {request.form['lumen_name']} with {file_type}")
                
                return jsonify({
                    'message': '✅ Submission received. You are responsible for accuracy of details.',
                    'submission_id': submission.id if not db_issues else None
                }), 201
                
            except Exception as e:
                logger.error(f"Error during submission: {str(e)}")
                logger.exception("Full traceback for submission error:")
                if not db_issues:
                    db.session.rollback()
                return jsonify({'error': f'An error occurred while processing your submission: {str(e)}. Please try again later.'}), 500
        
        @app.route('/api/submissions', methods=['GET'])
        @jwt_required
        def get_submissions():
            try:
                # Return empty list if there are database issues
                if db_issues:
                    return jsonify({
                        'submissions': [],
                        'pagination': {
                            'page': 1,
                            'pages': 1,
                            'per_page': 10,
                            'total': 0
                        },
                        'message': 'Database issues detected, returning empty list'
                    }), 200
                
                # Get pagination parameters
                page = request.args.get('page', 1, type=int)
                per_page = request.args.get('per_page', 10, type=int)
                per_page = min(per_page, 100)  # Limit max items per page
                
                # Get search/filter parameters
                search = request.args.get('search', '')
                sort_by = request.args.get('sort_by', 'timestamp')
                order = request.args.get('order', 'desc')
                
                # Build query
                query = Submission.query
                
                # Apply search filter
                if search:
                    query = query.filter(
                        or_(
                            Submission.lumen_name.like(f'%{search}%'),
                            Submission.ai_used.like(f'%{search}%'),
                            Submission.ai_agent.like(f'%{search}%')  # Add AI agent to search
                        )
                    )
                
                # Apply sorting
                if sort_by == 'reward_amount':
                    if order == 'asc':
                        query = query.order_by(Submission.reward_amount.asc())
                    else:
                        query = query.order_by(Submission.reward_amount.desc())
                elif sort_by == 'lumen_name':
                    if order == 'asc':
                        query = query.order_by(Submission.lumen_name.asc())
                    else:
                        query = query.order_by(Submission.lumen_name.desc())
                elif sort_by == 'ai_agent':  # Add sorting by AI agent
                    if order == 'asc':
                        query = query.order_by(Submission.ai_agent.asc())
                    else:
                        query = query.order_by(Submission.ai_agent.desc())
                else:  # Default sort by timestamp
                    if order == 'asc':
                        query = query.order_by(Submission.timestamp.asc())
                    else:
                        query = query.order_by(Submission.timestamp.desc())
                
                # Paginate results
                paginated = query.paginate(
                    page=page, 
                    per_page=per_page, 
                    error_out=False
                )
                
                # Format submissions for response
                submissions = [sub.to_dict() for sub in paginated.items]  # Use to_dict method
                
                return jsonify({
                    'submissions': submissions,
                    'pagination': {
                        'page': paginated.page,
                        'pages': paginated.pages,
                        'per_page': paginated.per_page,
                        'total': paginated.total
                    }
                }), 200
                
            except Exception as e:
                logger.error(f"Error retrieving submissions: {str(e)}")
                logger.exception("Full traceback for submissions error:")
                return jsonify({'error': f'An error occurred while retrieving submissions: {str(e)}. Please try again later.'}), 500
        
        @app.route('/api/public/submissions', methods=['GET'])
        def get_public_submissions():
            try:
                # Return empty list if there are database issues
                if db_issues:
                    return jsonify({
                        'submissions': [],
                        'pagination': {
                            'page': 1,
                            'pages': 1,
                            'per_page': 10,
                            'total': 0
                        },
                        'message': 'Database issues detected, returning empty list'
                    }), 200
                
                # Get pagination parameters
                page = request.args.get('page', 1, type=int)
                per_page = request.args.get('per_page', 10, type=int)
                per_page = min(per_page, 100)  # Limit max items per page
                
                # Get search/filter parameters
                search = request.args.get('search', '')
                sort_by = request.args.get('sort_by', 'timestamp')
                order = request.args.get('order', 'desc')
                
                # Build query
                query = Submission.query
                
                # Apply search filter
                if search:
                    query = query.filter(
                        or_(
                            Submission.lumen_name.like(f'%{search}%'),
                            Submission.ai_used.like(f'%{search}%'),
                            Submission.ai_agent.like(f'%{search}%')  # Add AI agent to search
                        )
                    )
                
                # Apply sorting
                if sort_by == 'reward_amount':
                    if order == 'asc':
                        query = query.order_by(Submission.reward_amount.asc())
                    else:
                        query = query.order_by(Submission.reward_amount.desc())
                elif sort_by == 'lumen_name':
                    if order == 'asc':
                        query = query.order_by(Submission.lumen_name.asc())
                    else:
                        query = query.order_by(Submission.lumen_name.desc())
                elif sort_by == 'ai_agent':  # Add sorting by AI agent
                    if order == 'asc':
                        query = query.order_by(Submission.ai_agent.asc())
                    else:
                        query = query.order_by(Submission.ai_agent.desc())
                else:  # Default sort by timestamp
                    if order == 'asc':
                        query = query.order_by(Submission.timestamp.asc())
                    else:
                        query = query.order_by(Submission.timestamp.desc())
                
                # Paginate results
                paginated = query.paginate(
                    page=page, 
                    per_page=per_page, 
                    error_out=False
                )
                
                # Format submissions for response (public version - exclude sensitive info)
                submissions = [sub.to_dict() for sub in paginated.items]  # Use to_dict method
                
                return jsonify({
                    'submissions': submissions,
                    'pagination': {
                        'page': paginated.page,
                        'pages': paginated.pages,
                        'per_page': paginated.per_page,
                        'total': paginated.total
                    }
                }), 200
                
            except Exception as e:
                logger.error(f"Error retrieving public submissions: {str(e)}")
                logger.exception("Full traceback for public submissions error:")
                return jsonify({'error': f'An error occurred while retrieving submissions: {str(e)}. Please try again later.'}), 500
        
        # Create tables
        with app.app_context():
            if not db_issues:
                logger.info("Creating database tables...")
                try:
                    # Try to create all tables
                    db.create_all()
                    logger.info("Database tables created successfully")
                except Exception as e:
                    logger.error(f"Error creating database tables: {str(e)}")
                    logger.exception("Full traceback for database table creation error:")
                    # Try to add missing columns if tables already exist
                    try:
                        # For SQLite and PostgreSQL, try to add columns if they don't exist
                        from sqlalchemy import text
                        
                        # Try to add ai_agent column
                        try:
                            db.session.execute(text("ALTER TABLE submissions ADD COLUMN ai_agent VARCHAR(50)"))
                            logger.info("Added ai_agent column to submissions table")
                        except Exception as alter_e:
                            logger.info(f"ai_agent column already exists or not needed: {str(alter_e)}")
                        
                        # Try to add additional_screenshots column
                        try:
                            db.session.execute(text("ALTER TABLE submissions ADD COLUMN additional_screenshots TEXT"))
                            logger.info("Added additional_screenshots column to submissions table")
                        except Exception as alter_e2:
                            logger.info(f"additional_screenshots column already exists or not needed: {str(alter_e2)}")
                        
                        db.session.commit()
                        logger.info("Database schema updated successfully")
                    except Exception as e2:
                        logger.error(f"Error updating database schema: {str(e2)}")
                        logger.exception("Full traceback for database schema update error:")
                        raise e2 from e
            else:
                logger.warning("Skipping database initialization due to database issues")
        
        logger.info("Application created successfully")
        return app
        
    except Exception as e:
        logger.error(f"Error creating app: {str(e)}")
        logger.exception("Full traceback:")
        
        # Create a minimal application for debugging
        app = Flask(__name__)
        
        @app.route('/')
        def fallback_health_check():
            return "Application is running but there may be database connection issues"
        
        @app.route('/debug')
        def debug_info():
            import subprocess
            try:
                result = subprocess.run(['pip', 'freeze'], capture_output=True, text=True)
                return f"<pre>{result.stdout}</pre>"
            except Exception as e:
                return f"Error getting pip freeze: {str(e)}"
        
        return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)