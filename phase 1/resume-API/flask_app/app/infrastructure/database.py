from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy
db = SQLAlchemy()

def init_db(app):
    """Initialize the database with the Flask app"""
    db.init_app(app)
    
    # Import models to ensure they are registered with SQLAlchemy
    from .models import resume_model  # noqa: F401
    
    # Create tables
    with app.app_context():
        db.create_all() 