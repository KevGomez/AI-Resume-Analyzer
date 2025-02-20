from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from .config.config import config
from .utils.errors import register_error_handlers
import logging
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()

def create_app(config_name=None):
    """Create and configure the Flask application."""
    app = Flask(__name__)
    
    # Load configuration
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    app.config.from_object(config[config_name])
    
    # Initialize CORS with proper configuration
    CORS(app, 
        origins=["http://localhost:3000"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        supports_credentials=True,
        expose_headers=["Content-Type", "Authorization"],
        max_age=3600  # Cache preflight requests for 1 hour
    )
    
    # Add global OPTIONS handler
    @app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
    @app.route('/<path:path>', methods=['OPTIONS'])
    def handle_options(path):
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 200
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Import models to ensure they are registered with SQLAlchemy
    from .models import resume  # Import models after db initialization
    
    # Initialize Firebase Admin
    from .config.firebase_config import firebase_app
    
    # Register error handlers
    register_error_handlers(app)
    
    # Register blueprints
    from .routes import register_routes
    register_routes(app)
    
    # Setup logging
    if not app.debug:
        file_handler = logging.FileHandler('app.log')
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
    
    return app
