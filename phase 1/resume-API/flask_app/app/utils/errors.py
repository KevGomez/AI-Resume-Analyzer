from flask import jsonify
from werkzeug.exceptions import HTTPException

class APIError(Exception):
    """Base class for API errors"""
    def __init__(self, message, status_code=500, payload=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv

class ValidationError(APIError):
    """Raised when input validation fails"""
    def __init__(self, message, payload=None):
        super().__init__(message, status_code=400, payload=payload)

class ResourceNotFoundError(APIError):
    """Raised when a requested resource is not found"""
    def __init__(self, message, payload=None):
        super().__init__(message, status_code=404, payload=payload)

class AuthenticationError(APIError):
    """Raised when authentication fails"""
    def __init__(self, message, payload=None):
        super().__init__(message, status_code=401, payload=payload)

class AuthorizationError(APIError):
    """Raised when authorization fails"""
    def __init__(self, message, payload=None):
        super().__init__(message, status_code=403, payload=payload)

def register_error_handlers(app):
    """Register error handlers with the Flask app"""
    
    @app.errorhandler(APIError)
    def handle_api_error(error):
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response

    @app.errorhandler(HTTPException)
    def handle_http_error(error):
        response = jsonify({
            'status': 'error',
            'message': error.description,
        })
        response.status_code = error.code
        return response

    @app.errorhandler(Exception)
    def handle_generic_error(error):
        # Log the error here
        response = jsonify({
            'status': 'error',
            'message': 'An unexpected error occurred'
        })
        response.status_code = 500
        return response 