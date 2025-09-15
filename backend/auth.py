from flask import Blueprint, request, jsonify
from models import db, AdminUser
from functools import wraps
import jwt
import os
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

auth_bp = Blueprint('auth', __name__)

# Secret key for JWT
SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'message': 'Token is missing!'}), 401

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = AdminUser.query.filter_by(id=data['user_id']).first()
            if not current_user:
                return jsonify({'message': 'Token is invalid!'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Your session has expired. Please log in again.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid authentication token. Please log in again.'}), 401

        return f(current_user, *args, **kwargs)

    return decorated

def jwt_required(f):
    """Decorator to require JWT authentication for routes"""
    return token_required(f)

def get_current_user():
    """Get current user from request context"""
    token = None
    if 'Authorization' in request.headers:
        auth_header = request.headers['Authorization']
        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            return None

    if not token:
        return None

    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        current_user = AdminUser.query.filter_by(id=data['user_id']).first()
        return current_user
    except:
        return None

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new admin user (for initial setup only)"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Username and password required'}), 400
    
    if AdminUser.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400
    
    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256', salt_length=12)
    
    new_user = AdminUser()
    new_user.username = data['username']
    new_user.password_hash = hashed_password
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login endpoint for admin users"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Username and password required'}), 400
    
    user = AdminUser.query.filter_by(username=data['username']).first()
    
    if not user:
        return jsonify({'message': 'Invalid username or password'}), 401
    if not check_password_hash(user.password_hash, data['password']):
        return jsonify({'message': 'Invalid username or password'}), 401
    
    # Generate JWT token
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, SECRET_KEY, algorithm='HS256')
    
    # Handle both string and bytes tokens (PyJWT compatibility)
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    
    return jsonify({
        'token': token,
        'message': 'Login successful'
    }), 200