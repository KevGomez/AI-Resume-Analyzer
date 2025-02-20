from typing import Dict, Any, Optional
from flask import jsonify
from werkzeug.exceptions import HTTPException
import logging

# Configure logger
logger = logging.getLogger(__name__)

class APIError(Exception):
    """Base API Error class"""
    def __init__(self, message: str, status_code: int = 400,
                 error_code: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or 'API_ERROR'
        self.details = details

    def to_dict(self) -> Dict[str, Any]:
        """Convert error to dictionary"""
        error_dict = {
            'error': self.error_code,
            'message': self.message,
            'status_code': self.status_code
        }
        if self.details:
            error_dict['details'] = self.details
        return error_dict

class ValidationError(APIError):
    """Validation error"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=400,
            error_code='VALIDATION_ERROR',
            details=details
        )

class AuthenticationError(APIError):
    """Authentication error"""
    def __init__(self, message: str = 'Authentication required'):
        super().__init__(
            message=message,
            status_code=401,
            error_code='AUTHENTICATION_ERROR'
        )

class AuthorizationError(APIError):
    """Authorization error"""
    def __init__(self, message: str = 'Permission denied'):
        super().__init__(
            message=message,
            status_code=403,
            error_code='AUTHORIZATION_ERROR'
        )

class NotFoundError(APIError):
    """Resource not found error"""
    def __init__(self, message: str = 'Resource not found'):
        super().__init__(
            message=message,
            status_code=404,
            error_code='NOT_FOUND_ERROR'
        )

class FileUploadError(APIError):
    """File upload error"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=400,
            error_code='FILE_UPLOAD_ERROR',
            details=details
        )

def register_error_handlers(app):
    """Register error handlers for the application"""
    
    @app.errorhandler(APIError)
    def handle_api_error(error: APIError):
        """Handle custom API errors"""
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        
        # Log error
        logger.error(f"API Error: {error.message}", extra={
            'error_code': error.error_code,
            'status_code': error.status_code,
            'details': error.details
        })
        
        return response

    @app.errorhandler(HTTPException)
    def handle_http_error(error: HTTPException):
        """Handle HTTP errors"""
        response = jsonify({
            'error': 'HTTP_ERROR',
            'message': error.description,
            'status_code': error.code
        })
        response.status_code = error.code
        
        # Log error
        logger.error(f"HTTP Error: {error.description}", extra={
            'status_code': error.code
        })
        
        return response

    @app.errorhandler(Exception)
    def handle_generic_error(error: Exception):
        """Handle all other exceptions"""
        response = jsonify({
            'error': 'INTERNAL_SERVER_ERROR',
            'message': 'An unexpected error occurred',
            'status_code': 500
        })
        response.status_code = 500
        
        # Log error with traceback
        logger.exception("Unexpected error occurred")
        
        return response 