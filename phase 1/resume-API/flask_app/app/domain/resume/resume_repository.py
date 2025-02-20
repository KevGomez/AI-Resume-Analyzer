from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from .resume_entity import Resume
from ...infrastructure.database import db
from datetime import datetime

class ResumeRepository(ABC):
    """Abstract base class for resume repository"""
    
    @abstractmethod
    def save(self, resume: Resume) -> Resume:
        """Save a resume"""
        pass
    
    @abstractmethod
    def get_by_id(self, resume_id: UUID) -> Optional[Resume]:
        """Get a resume by ID"""
        pass
    
    @abstractmethod
    def get_by_user_id(self, user_id: str) -> List[Resume]:
        """Get all resumes for a user"""
        pass
    
    @abstractmethod
    def delete(self, resume_id: UUID) -> bool:
        """Delete a resume"""
        pass
    
    @abstractmethod
    def update(self, resume: Resume) -> Resume:
        """Update a resume"""
        pass

class SQLAlchemyResumeRepository(ResumeRepository):
    """SQLAlchemy implementation of resume repository"""
    
    def save(self, resume: Resume) -> Resume:
        """Save a resume to the database"""
        try:
            resume_model = ResumeModel(
                id=resume.id,
                user_id=resume.user_id,
                file_name=resume.file_name,
                file_path=resume.file_path,
                content=resume.content,
                analysis=resume.analysis.to_dict() if resume.analysis else None,
                status=resume.status,
                created_at=resume.created_at,
                updated_at=resume.updated_at
            )
            db.session.add(resume_model)
            db.session.commit()
            return self._to_entity(resume_model)
        except Exception as e:
            db.session.rollback()
            raise ValueError(f"Failed to save resume: {str(e)}")
    
    def get_by_id(self, resume_id: UUID) -> Optional[Resume]:
        """Get a resume by ID from the database"""
        try:
            resume_model = ResumeModel.query.get(resume_id)
            return self._to_entity(resume_model) if resume_model else None
        except Exception as e:
            raise ValueError(f"Failed to get resume: {str(e)}")
    
    def get_by_user_id(self, user_id: str) -> List[Resume]:
        """Get all resumes for a user from the database"""
        try:
            resume_models = ResumeModel.query.filter_by(user_id=user_id).all()
            return [self._to_entity(model) for model in resume_models]
        except Exception as e:
            raise ValueError(f"Failed to get resumes: {str(e)}")
    
    def delete(self, resume_id: UUID) -> bool:
        """Delete a resume from the database"""
        try:
            resume_model = ResumeModel.query.get(resume_id)
            if resume_model:
                db.session.delete(resume_model)
                db.session.commit()
                return True
            return False
        except Exception as e:
            db.session.rollback()
            raise ValueError(f"Failed to delete resume: {str(e)}")
    
    def update(self, resume: Resume) -> Resume:
        """Update a resume in the database"""
        try:
            resume_model = ResumeModel.query.get(resume.id)
            if not resume_model:
                raise ValueError(f"Resume with ID {resume.id} not found")
            
            resume_model.file_name = resume.file_name
            resume_model.file_path = resume.file_path
            resume_model.content = resume.content
            resume_model.analysis = resume.analysis.to_dict() if resume.analysis else None
            resume_model.status = resume.status
            resume_model.updated_at = datetime.utcnow()
            
            db.session.commit()
            return self._to_entity(resume_model)
        except Exception as e:
            db.session.rollback()
            raise ValueError(f"Failed to update resume: {str(e)}")
    
    def _to_entity(self, model: 'ResumeModel') -> Resume:
        """Convert database model to domain entity"""
        from ...infrastructure.models.resume_model import ResumeModel
        if not isinstance(model, ResumeModel):
            raise ValueError("Invalid model type")
            
        return Resume(
            id=model.id,
            user_id=model.user_id,
            file_name=model.file_name,
            file_path=model.file_path,
            content=model.content,
            analysis=model.analysis,
            status=model.status,
            created_at=model.created_at,
            updated_at=model.updated_at
        ) 