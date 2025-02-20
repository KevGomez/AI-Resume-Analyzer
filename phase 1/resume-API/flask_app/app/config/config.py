import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration"""
    # Application
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')
    DEBUG = False
    TESTING = False
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://localhost/resume_analyzer')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Redis
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    REDIS_MAX_CONNECTIONS = int(os.getenv('REDIS_MAX_CONNECTIONS', 10))
    
    # File Upload
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB max file size
    UPLOAD_DIR = os.path.join(Path(__file__).parent.parent.parent, 'uploads')
    ALLOWED_EXTENSIONS = {'pdf', 'docx'}
    
    # Firebase
    FIREBASE_CREDENTIALS = os.getenv('FIREBASE_CREDENTIALS', 'firebase-credentials.json')
    
    # Rate Limiting
    RATE_LIMIT_DEFAULT = int(os.getenv('RATE_LIMIT_DEFAULT', 100))
    RATE_LIMIT_WINDOW = int(os.getenv('RATE_LIMIT_WINDOW', 3600))  # 1 hour
    
    # API Configuration
    API_TITLE = 'Resume Analyzer API'
    API_VERSION = 'v1'
    OPENAPI_VERSION = '3.0.2'
    OPENAPI_URL_PREFIX = '/'
    OPENAPI_SWAGGER_UI_PATH = '/swagger'
    OPENAPI_SWAGGER_UI_URL = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist/'

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv('DEV_DATABASE_URL', 'postgresql://localhost/resume_analyzer_dev')
    REDIS_URL = os.getenv('DEV_REDIS_URL', 'redis://localhost:6379/1')

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.getenv('TEST_DATABASE_URL', 'postgresql://localhost/resume_analyzer_test')
    REDIS_URL = os.getenv('TEST_REDIS_URL', 'redis://localhost:6379/2')

class ProductionConfig(Config):
    """Production configuration"""
    # Override with production settings
    pass

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
} 