from typing import List, Optional
from uuid import UUID
from .resume_entity import Resume, ResumeAnalysis
from .resume_repository import ResumeRepository
from ...infrastructure.storage import FileStorage
from ...infrastructure.nlp import ResumeAnalyzer

class ResumeService:
    """Service for handling resume operations"""
    
    def __init__(self, repository: ResumeRepository, file_storage: FileStorage,
                 resume_analyzer: ResumeAnalyzer):
        self.repository = repository
        self.file_storage = file_storage
        self.resume_analyzer = resume_analyzer
    
    async def upload_resume(self, user_id: str, file_name: str, file_content: bytes) -> Resume:
        """Upload and process a new resume"""
        try:
            # Save file to storage
            file_path = await self.file_storage.save(file_name, file_content)
            
            # Extract text content
            content = await self.file_storage.extract_text(file_path)
            
            # Create resume entity
            resume = Resume(
                id=None,  # Will be generated in __post_init__
                user_id=user_id,
                file_name=file_name,
                file_path=file_path,
                content=content
            )
            
            # Save to database
            saved_resume = self.repository.save(resume)
            
            # Start analysis in background
            self._analyze_resume(saved_resume)
            
            return saved_resume
            
        except Exception as e:
            # Clean up any saved files if there was an error
            if 'file_path' in locals():
                await self.file_storage.delete(file_path)
            raise ValueError(f"Failed to upload resume: {str(e)}")
    
    async def _analyze_resume(self, resume: Resume) -> None:
        """Analyze resume content in background"""
        try:
            resume.mark_as_processing()
            self.repository.update(resume)
            
            # Perform analysis
            analysis_result = await self.resume_analyzer.analyze(resume.content)
            
            # Create analysis entity
            analysis = ResumeAnalysis(
                skills=analysis_result['skills'],
                experience=analysis_result['experience'],
                education=analysis_result['education'],
                score=analysis_result['score']
            )
            
            # Update resume with analysis
            resume.update_analysis(analysis)
            self.repository.update(resume)
            
        except Exception as e:
            resume.mark_as_error()
            self.repository.update(resume)
            raise ValueError(f"Failed to analyze resume: {str(e)}")
    
    def get_resume(self, resume_id: UUID) -> Optional[Resume]:
        """Get a resume by ID"""
        return self.repository.get_by_id(resume_id)
    
    def get_user_resumes(self, user_id: str) -> List[Resume]:
        """Get all resumes for a user"""
        return self.repository.get_by_user_id(user_id)
    
    async def delete_resume(self, resume_id: UUID) -> bool:
        """Delete a resume and its associated file"""
        resume = self.repository.get_by_id(resume_id)
        if resume:
            # Delete file from storage
            await self.file_storage.delete(resume.file_path)
            # Delete from database
            return self.repository.delete(resume_id)
        return False
    
    def update_resume(self, resume: Resume) -> Resume:
        """Update a resume"""
        return self.repository.update(resume) 