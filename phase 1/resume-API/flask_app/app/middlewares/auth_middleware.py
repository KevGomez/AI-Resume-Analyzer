from functools import wraps
from flask import request, jsonify, g
from firebase_admin import auth
from app.utils.errors import AuthenticationError

def verify_firebase_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'No token provided'}), 401
            
        try:
            # Remove 'Bearer ' prefix if present
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]
            else:
                token = auth_header
                
            # Verify the token with Firebase
            decoded_token = auth.verify_id_token(token)
            
            # Add user info to Flask's g object
            g.user = {
                'uid': decoded_token['uid'],
                'email': decoded_token.get('email'),
            }
            g.user_id = decoded_token['uid']  # Set user_id directly for easier access
            
            return f(*args, **kwargs)
            
        except auth.ExpiredIdTokenError:
            return jsonify({'error': 'Token has expired'}), 401
        except auth.RevokedIdTokenError:
            return jsonify({'error': 'Token has been revoked'}), 401
        except auth.InvalidIdTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'error': str(e)}), 401
            
    return decorated_function 