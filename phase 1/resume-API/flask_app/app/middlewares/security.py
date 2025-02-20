from functools import wraps
from flask import request, current_app
from datetime import datetime, timedelta
import jwt
from app.utils.errors import AuthenticationError, AuthorizationError

def require_api_key(f):
    """Decorator to require API key for routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key or api_key != current_app.config['API_KEY']:
            raise AuthenticationError('Invalid API key')
        return f(*args, **kwargs)
    return decorated

def create_token(user_id):
    """Create a JWT token"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=1),
        'iat': datetime.utcnow()
    }
    return jwt.encode(
        payload,
        current_app.config['JWT_SECRET_KEY'],
        algorithm='HS256'
    )

def require_jwt(f):
    """Decorator to require JWT token for routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            raise AuthenticationError('No token provided')
            
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
                
            payload = jwt.decode(
                token,
                current_app.config['JWT_SECRET_KEY'],
                algorithms=['HS256']
            )
            request.user_id = payload['user_id']
        except jwt.ExpiredSignatureError:
            raise AuthenticationError('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationError('Invalid token')
            
        return f(*args, **kwargs)
    return decorated

def rate_limit(f):
    """Basic rate limiting decorator"""
    @wraps(f)
    def decorated(*args, **kwargs):
        # Implement rate limiting logic here
        # This is a placeholder - you should use Redis or a similar solution
        # for production rate limiting
        return f(*args, **kwargs)
    return decorated 