from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Submission(db.Model):
    __tablename__ = 'submissions'
    
    id = db.Column(db.Integer, primary_key=True)
    lumen_name = db.Column(db.String(100), nullable=False, index=True)
    prompt_text = db.Column(db.Text, nullable=False)
    ai_used = db.Column(db.String(50), nullable=False, index=True)
    ai_agent = db.Column(db.String(50), nullable=True)  # New field for AI agent
    reward_amount = db.Column(db.Float, nullable=False)
    screenshot_path = db.Column(db.String(200), nullable=False)  # Primary file (screenshot or project)
    # New field to store additional screenshot paths (comma-separated)
    # Make it nullable to avoid issues with existing records
    additional_screenshots = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Add validation constraints
    __table_args__ = (
        db.CheckConstraint('reward_amount >= 0', name='check_reward_amount_positive'),
    )
    
    def __repr__(self):
        return f'<Submission {self.lumen_name}>'
    
    def to_dict(self):
        # Parse additional screenshots if they exist
        additional_screenshots_list = []
        if self.additional_screenshots:
            # Handle both string and potential list types
            if isinstance(self.additional_screenshots, str):
                additional_screenshots_list = [s.strip() for s in self.additional_screenshots.split(',') if s.strip()]
            elif isinstance(self.additional_screenshots, list):
                additional_screenshots_list = self.additional_screenshots
        
        return {
            'id': self.id,
            'lumen_name': self.lumen_name,
            'prompt_text': self.prompt_text,
            'ai_used': self.ai_used,
            'ai_agent': self.ai_agent,  # Include new field
            'reward_amount': self.reward_amount,
            'screenshot_path': self.screenshot_path,
            'additional_screenshots': additional_screenshots_list,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

class AdminUser(db.Model):
    __tablename__ = 'admin_users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    
    def __repr__(self):
        return f'<AdminUser {self.username}>'