from app import db
from app.models.resume import Skill, ResumeSkill
from typing import Dict, List
import re
from sqlalchemy.exc import IntegrityError
from sqlalchemy import and_
from app.utils.logger import skill_logger, log_function_call

class SkillService:
    def __init__(self):
        # Define skill categories and their patterns
        self.skill_patterns = {
            "technical_skills": [
                "Python", "JavaScript", "Java", "C++", "SQL", "React", "Angular",
                "Node.js", "Docker", "Kubernetes", "AWS", "Azure", "Git",
                "Machine Learning", "Data Science", "AI", "DevOps", "CI/CD",
                "HTML", "CSS", "TypeScript", "Ruby", "PHP", "Swift", "Kotlin",
                "Go", "Rust", "R", "Scala", "MongoDB", "PostgreSQL", "MySQL",
                "Redis", "GraphQL", "REST API", "Microservices", "Linux", "Unix"
            ],
            "soft_skills": [
                "Leadership", "Communication", "Teamwork", "Problem Solving",
                "Time Management", "Project Management", "Analytical Skills",
                "Critical Thinking", "Adaptability", "Creativity", "Collaboration",
                "Organization", "Decision Making", "Presentation", "Negotiation",
                "Mentoring", "Conflict Resolution", "Strategic Planning"
            ],
            "tools": [
                "Microsoft Office", "Excel", "PowerPoint", "Photoshop",
                "Illustrator", "JIRA", "Slack", "Trello", "GitHub", "BitBucket",
                "VS Code", "Visual Studio", "IntelliJ", "Eclipse", "Postman",
                "Jenkins", "Travis CI", "CircleCI", "AWS Tools", "Azure DevOps",
                "Google Cloud Platform", "Kubernetes", "Docker", "Git"
            ]
        }

    @log_function_call(skill_logger)
    def extract_skills(self, text: str) -> Dict[str, List[str]]:
        """Extract skills from text using pattern matching"""
        if not text:
            skill_logger.warning("Empty text provided for skill extraction")
            return {}

        # Initialize results dictionary
        skills = {
            "technical_skills": set(),
            "soft_skills": set(),
            "tools": set()
        }
        
        # Convert text to lowercase for case-insensitive matching
        text_lower = text.lower()
        skill_logger.info(f"Processing text of length: {len(text)}")
        
        # Extract skills from each category
        for category, skill_list in self.skill_patterns.items():
            skill_logger.debug(f"Processing category: {category}")
            for skill in skill_list:
                # Create a regex pattern that matches whole words
                pattern = r'\b' + re.escape(skill.lower()) + r'\b'
                if re.search(pattern, text_lower):
                    skills[category].add(skill)
                    skill_logger.debug(f"Found skill: {skill} in category: {category}")
        
        # Convert sets to lists for JSON serialization
        result = {k: list(v) for k, v in skills.items() if v}
        skill_logger.info(f"Extracted skills: {result}")
        return result

    @log_function_call(skill_logger)
    def save_skills(self, resume, extracted_skills: Dict[str, List[str]]):
        """Save extracted skills to database"""
        try:
            skill_logger.info(f"Starting to save skills for resume ID: {resume.id}")
            skill_logger.debug(f"Extracted skills to save: {extracted_skills}")
            
            with db.session.no_autoflush:
                # Keep track of processed skills to avoid duplicates
                processed_skills = set()
                
                for category, skills in extracted_skills.items():
                    skill_logger.info(f"Processing category: {category} with {len(skills)} skills")
                    
                    for skill_name in skills:
                        if skill_name in processed_skills:
                            skill_logger.debug(f"Skipping duplicate skill: {skill_name}")
                            continue
                            
                        processed_skills.add(skill_name)
                        
                        # Check if skill already exists
                        skill = Skill.query.filter_by(name=skill_name).first()
                        if not skill:
                            # Create new skill
                            skill_logger.info(f"Creating new skill: {skill_name}")
                            skill = Skill(name=skill_name, category=category)
                            db.session.add(skill)
                            db.session.flush()
                        
                        # Check if resume-skill association already exists
                        existing_association = ResumeSkill.query.filter(
                            and_(
                                ResumeSkill.resume_id == resume.id,
                                ResumeSkill.skill_id == skill.id
                            )
                        ).first()
                        
                        if not existing_association:
                            # Create new resume-skill association
                            skill_logger.info(f"Creating new resume-skill association for: {skill_name}")
                            resume_skill = ResumeSkill(
                                resume_id=resume.id,
                                skill_id=skill.id,
                                confidence_score=0.8
                            )
                            db.session.add(resume_skill)
                        else:
                            skill_logger.debug(f"Skill association already exists for: {skill_name}")
                
                skill_logger.info("Committing skill changes to database")
                db.session.commit()
                skill_logger.info("Successfully saved all skills")
                
        except IntegrityError as e:
            db.session.rollback()
            skill_logger.error(f"IntegrityError while saving skills: {str(e)}", exc_info=True)
            raise
        except Exception as e:
            db.session.rollback()
            skill_logger.error(f"Error saving skills: {str(e)}", exc_info=True)
            raise 