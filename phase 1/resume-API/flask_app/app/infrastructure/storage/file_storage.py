import os
from typing import Optional
from uuid import uuid4
import aiofiles
from PyPDF2 import PdfReader
from docx import Document
from ...config.config import Config

class FileStorage:
    """Service for handling file storage operations"""
    
    def __init__(self, upload_dir: str = None):
        self.upload_dir = upload_dir or Config.UPLOAD_DIR
        os.makedirs(self.upload_dir, exist_ok=True)
    
    async def save(self, filename: str, content: bytes) -> str:
        """Save file content to storage"""
        try:
            # Generate unique filename
            ext = os.path.splitext(filename)[1]
            unique_filename = f"{uuid4()}{ext}"
            file_path = os.path.join(self.upload_dir, unique_filename)
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(content)
            
            return file_path
            
        except Exception as e:
            raise ValueError(f"Failed to save file: {str(e)}")
    
    async def delete(self, file_path: str) -> bool:
        """Delete file from storage"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception as e:
            raise ValueError(f"Failed to delete file: {str(e)}")
    
    async def extract_text(self, file_path: str) -> str:
        """Extract text content from file"""
        try:
            ext = os.path.splitext(file_path)[1].lower()
            
            if ext == '.pdf':
                return await self._extract_from_pdf(file_path)
            elif ext == '.docx':
                return await self._extract_from_docx(file_path)
            else:
                raise ValueError(f"Unsupported file type: {ext}")
                
        except Exception as e:
            raise ValueError(f"Failed to extract text: {str(e)}")
    
    async def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            with open(file_path, 'rb') as file:
                reader = PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text()
                return text
        except Exception as e:
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")
    
    async def _extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = Document(file_path)
            return "\n".join([paragraph.text for paragraph in doc.paragraphs])
        except Exception as e:
            raise ValueError(f"Failed to extract text from DOCX: {str(e)}")
    
    def get_file_path(self, filename: str) -> Optional[str]:
        """Get full path for a file"""
        file_path = os.path.join(self.upload_dir, filename)
        return file_path if os.path.exists(file_path) else None 