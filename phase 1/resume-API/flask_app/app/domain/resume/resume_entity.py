from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4

@dataclass
class ResumeAnalysis:
    skills: List[str]
    experience: List[str]
    education: List[str]
    score: float

    def to_dict(self) -> dict:
        return {
            'skills': self.skills,
            'experience': self.experience,
            'education': self.education,
            'score': self.score
        }

@dataclass
class Resume:
    id: UUID
    user_id: str
    file_name: str
    file_path: str
    content: str
    analysis: Optional[ResumeAnalysis] = None
    status: str = 'pending'
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        if not self.id:
            self.id = uuid4()
        self.created_at = self.created_at or datetime.utcnow()
        self.updated_at = self.updated_at or datetime.utcnow()
        self._validate()

    def _validate(self):
        """Validate resume data"""
        if not self.user_id:
            raise ValueError("User ID is required")
        if not self.file_name:
            raise ValueError("File name is required")
        if not self.file_path:
            raise ValueError("File path is required")
        if not self.content:
            raise ValueError("Content is required")
        if self.status not in ['pending', 'processing', 'completed', 'error']:
            raise ValueError("Invalid status")

    def update_analysis(self, analysis: ResumeAnalysis):
        """Update resume analysis"""
        self.analysis = analysis
        self.status = 'completed'
        self.updated_at = datetime.utcnow()

    def mark_as_processing(self):
        """Mark resume as processing"""
        self.status = 'processing'
        self.updated_at = datetime.utcnow()

    def mark_as_error(self):
        """Mark resume as error"""
        self.status = 'error'
        self.updated_at = datetime.utcnow()

    def to_dict(self) -> dict:
        """Convert resume to dictionary"""
        if not self.created_at or not self.updated_at:
            raise ValueError("Created at and updated at timestamps are required")
            
        return {
            'id': str(self.id),
            'user_id': self.user_id,
            'file_name': self.file_name,
            'content': self.content,
            'analysis': self.analysis.to_dict() if self.analysis else None,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        } 