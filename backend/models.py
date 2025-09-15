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
    screenshot_path = db.Column(db.String(200), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Add validation constraints
    __table_args__ = (
        db.CheckConstraint('reward_amount >= 0', name='check_reward_amount_positive'),
    )
    
    def __repr__(self):
        return f'<Submission {self.lumen_name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'lumen_name': self.lumen_name,
            'prompt_text': self.prompt_text,
            'ai_used': self.ai_used,
            'ai_agent': self.ai_agent,  # Include new field
            'reward_amount': self.reward_amount,
            'screenshot_path': self.screenshot_path,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

class AdminUser(db.Model):
    __tablename__ = 'admin_users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    
    def __repr__(self):
        return f'<AdminUser {self.username}>'