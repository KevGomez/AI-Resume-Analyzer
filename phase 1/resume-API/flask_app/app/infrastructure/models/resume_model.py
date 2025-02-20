from datetime import datetime
from uuid import UUID
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.dialects.postgresql import JSONB
from ..database import db

class ResumeModel(db.Model):
    """SQLAlchemy model for resumes"""
    __tablename__ = 'resumes'

    id = db.Column(PGUUID, primary_key=True)
    user_id = db.Column(db.String(255), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    analysis = db.Column(JSONB, nullable=True)
    status = db.Column(
        db.String(20),
        nullable=False,
        default='pending'
    )
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __init__(self, id: UUID, user_id: str, file_name: str, file_path: str,
                 content: str, analysis: dict = None, status: str = 'pending',
                 created_at: datetime = None, updated_at: datetime = None):
        self.id = id
        self.user_id = user_id
        self.file_name = file_name
        self.file_path = file_path
        self.content = content
        self.analysis = analysis
        self.status = status
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    def __repr__(self):
        return f'<Resume {self.id}>' 