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
        db.init_app(app)
        # Configure CORS to allow all origins for all routes (appropriate for a public API)
        CORS(app)
        
        # Create upload folder if it doesn't exist
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])
        
        # Register blueprints
        app.register_blueprint(auth_bp, url_prefix='/api')
        
        # Health check endpoint
        @app.route('/health')
        def health_check():
            return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})
        
        # Serve uploaded files
        @app.route('/uploads/<path:filename>')
        def uploaded_file(filename):
            return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
        
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
                
                # Save file securely
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
                
                # Create submission record with relative path for security
                submission = Submission()
                submission.lumen_name = request.form['lumen_name']
                submission.prompt_text = request.form['prompt_text']
                submission.ai_used = request.form['ai_used']
                submission.ai_agent = request.form['ai_agent']  # Add AI agent field
                submission.reward_amount = reward_amount
                # Store relative path instead of absolute path
                submission.screenshot_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                
                db.session.add(submission)
                db.session.commit()
                
                logger.info(f"New submission received from {request.form['lumen_name']} with {file_type}")
                
                return jsonify({
                    'message': '✅ Submission received. You are responsible for accuracy of details.',
                    'submission_id': submission.id
                }), 201
                
            except Exception as e:
                logger.error(f"Error during submission: {str(e)}")
                db.session.rollback()
                return jsonify({'error': 'An error occurred while processing your submission. Please try again later.'}), 500
        
        @app.route('/api/submissions', methods=['GET'])
        @jwt_required
        def get_submissions():
            try:
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
                return jsonify({'error': 'An error occurred while retrieving submissions. Please try again later.'}), 500
        
        @app.route('/api/public/submissions', methods=['GET'])
        def get_public_submissions():
            try:
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
                return jsonify({'error': 'An error occurred while retrieving submissions. Please try again later.'}), 500
        
        # Create tables
        with app.app_context():
            logger.info("Creating database tables...")
            db.create_all()
            logger.info("Database tables created successfully")
        
        logger.info("Application created successfully")
        return app
        
    except Exception as e:
        logger.error(f"Error creating app: {str(e)}")
        logger.exception("Full traceback:")
        raise

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)