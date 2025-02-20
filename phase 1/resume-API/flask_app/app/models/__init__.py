# Import all models here to ensure they are registered with SQLAlchemy
from .resume import Resume, Skill, ResumeSkill, ChatHistory

__all__ = ['Resume', 'Skill', 'ResumeSkill', 'ChatHistory'] 