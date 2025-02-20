from datetime import datetime
from app import db
from sqlalchemy.orm import relationship

class Resume(db.Model):
    """Resume model for storing uploaded resumes and their extracted information"""
    __tablename__ = 'resumes'
    
    id = db.Column(db.Integer, primary_key=True)
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(10), nullable=False)
    extracted_text = db.Column(db.Text, nullable=True)
    user_id = db.Column(db.String(128), nullable=False)  # Firebase UID
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # New fields for filtering
    years_of_experience = db.Column(db.Float, nullable=True)
    education_level = db.Column(db.String(50), nullable=True)  # e.g., "Bachelor's", "Master's", "PhD"
    
    # Relationships
    resume_skills = relationship('ResumeSkill', back_populates='resume', cascade='all, delete-orphan')
    skills = relationship('Skill', secondary='resume_skills', back_populates='resumes')
    chat_history = relationship('ChatHistory', back_populates='resume', cascade='all, delete-orphan')
    education = relationship('Education', back_populates='resume', cascade='all, delete-orphan')
    experience = relationship('Experience', back_populates='resume', cascade='all, delete-orphan')
    
    def __init__(self, file_name=None, file_path=None, file_type=None, extracted_text=None, user_id=None, years_of_experience=0.0, education_level="High School"):
        self.file_name = file_name
        self.file_path = file_path
        self.file_type = file_type
        self.extracted_text = extracted_text
        self.user_id = user_id
        self.years_of_experience = years_of_experience
        self.education_level = education_level

    def __repr__(self):
        return f'<Resume {self.file_name}>'

class Skill(db.Model):
    __tablename__ = 'skills'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    category = db.Column(db.String(50))  # e.g., Technical, Soft Skills, Tools
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    resumes = relationship('Resume', secondary='resume_skills', back_populates='skills')

class ResumeSkill(db.Model):
    __tablename__ = 'resume_skills'

    resume_id = db.Column(db.Integer, db.ForeignKey('resumes.id'), primary_key=True)
    skill_id = db.Column(db.Integer, db.ForeignKey('skills.id'), primary_key=True)
    confidence_score = db.Column(db.Float)  # Score from NER
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Add relationships
    resume = relationship('Resume', back_populates='resume_skills')
    skill = relationship('Skill', backref='resume_skills')

class ChatHistory(db.Model):
    __tablename__ = 'chat_history'

    id = db.Column(db.Integer, primary_key=True)
    resume_id = db.Column(db.Integer, db.ForeignKey('resumes.id'), nullable=False)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    resume = relationship('Resume', back_populates='chat_history')

class Education(db.Model):
    """Education model for storing educational qualifications"""
    __tablename__ = 'education'

    id = db.Column(db.Integer, primary_key=True)
    resume_id = db.Column(db.Integer, db.ForeignKey('resumes.id'), nullable=False)
    degree = db.Column(db.String(100), nullable=False)  # e.g., "Bachelor of Science"
    field = db.Column(db.String(100), nullable=False)   # e.g., "Computer Science"
    institution = db.Column(db.String(200), nullable=False)
    graduation_year = db.Column(db.Integer, nullable=True)
    gpa = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    resume = relationship('Resume', back_populates='education')

class Experience(db.Model):
    """Experience model for storing work experience"""
    __tablename__ = 'experience'

    id = db.Column(db.Integer, primary_key=True)
    resume_id = db.Column(db.Integer, db.ForeignKey('resumes.id'), nullable=False)
    company = db.Column(db.String(200), nullable=False)
    position = db.Column(db.String(200), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=True)  # Null if current position
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    resume = relationship('Resume', back_populates='experience') 