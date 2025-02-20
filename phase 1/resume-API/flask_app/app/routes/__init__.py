from flask import Blueprint
from .resume_routes import resume_bp
from .chatbot_routes import chatbot_bp

def register_routes(app):
    """Register all blueprints/routes with the app"""
    app.register_blueprint(resume_bp)
    app.register_blueprint(chatbot_bp) 