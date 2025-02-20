from typing import Dict, List
import spacy
from spacy.tokens import Doc
import re
from ...config.config import Config

class ResumeAnalyzer:
    """Service for analyzing resume content using NLP"""
    
    def __init__(self):
        # Load English language model
        self.nlp = spacy.load("en_core_web_lg")
        
        # Load skill patterns
        self.skill_patterns = self._load_skill_patterns()
        
        # Add skill patterns to pipeline
        ruler = self.nlp.add_pipe("entity_ruler", before="ner")
        ruler.add_patterns(self.skill_patterns)
    
    def _load_skill_patterns(self) -> List[Dict]:
        """Load skill patterns for entity ruler"""
        # This is a simplified version. In production, you'd load from a comprehensive database
        skills = [
            "Python", "JavaScript", "Java", "C++", "SQL", "React", "Angular", "Vue",
            "Node.js", "Express", "Django", "Flask", "FastAPI", "Docker", "Kubernetes",
            "AWS", "Azure", "GCP", "Machine Learning", "Deep Learning", "NLP",
            "Data Science", "Data Analysis", "Data Engineering", "DevOps", "CI/CD"
        ]
        
        patterns = []
        for skill in skills:
            patterns.append({
                "label": "SKILL",
                "pattern": skill
            })
        return patterns
    
    async def analyze(self, text: str) -> Dict:
        """Analyze resume content"""
        try:
            # Process text with spaCy
            doc = self.nlp(text)
            
            return {
                "skills": self._extract_skills(doc),
                "experience": self._extract_experience(doc),
                "education": self._extract_education(doc),
                "score": self._calculate_score(doc)
            }
            
        except Exception as e:
            raise ValueError(f"Failed to analyze resume: {str(e)}")
    
    def _extract_skills(self, doc: Doc) -> List[str]:
        """Extract skills from document"""
        skills = set()
        
        # Extract skills from entity ruler
        for ent in doc.ents:
            if ent.label_ == "SKILL":
                skills.add(ent.text)
        
        return list(skills)
    
    def _extract_experience(self, doc: Doc) -> List[str]:
        """Extract work experience from document"""
        experience = []
        
        # Simple regex-based extraction (can be improved with better NLP)
        experience_pattern = re.compile(
            r"(?i)(work experience|professional experience|employment|work history)"
        )
        
        # Split into sections and find experience section
        sections = doc.text.split("\n\n")
        for i, section in enumerate(sections):
            if experience_pattern.search(section):
                # Include next few sections as experience
                experience.extend(sections[i:i+3])
                break
        
        return experience if experience else []
    
    def _extract_education(self, doc: Doc) -> List[str]:
        """Extract education information from document"""
        education = []
        
        # Simple regex-based extraction (can be improved with better NLP)
        education_pattern = re.compile(
            r"(?i)(education|academic|university|college|school|degree|bachelor|master|phd)"
        )
        
        # Split into sections and find education section
        sections = doc.text.split("\n\n")
        for i, section in enumerate(sections):
            if education_pattern.search(section):
                # Include next few sections as education
                education.extend(sections[i:i+2])
                break
        
        return education if education else []
    
    def _calculate_score(self, doc: Doc) -> float:
        """Calculate resume score based on various factors"""
        score = 0.0
        
        # Score based on skills (30%)
        skills = self._extract_skills(doc)
        skill_score = min(len(skills) / 10, 1.0) * 30
        
        # Score based on experience (40%)
        experience = self._extract_experience(doc)
        experience_score = min(len(" ".join(experience).split()) / 500, 1.0) * 40
        
        # Score based on education (30%)
        education = self._extract_education(doc)
        education_score = min(len(" ".join(education).split()) / 200, 1.0) * 30
        
        # Calculate total score
        score = skill_score + experience_score + education_score
        
        return round(score, 2) 