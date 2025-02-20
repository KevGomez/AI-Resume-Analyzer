from flask import Blueprint, request, jsonify, g
from app.models.resume import Resume, ChatHistory
from app.services.chatbot_service import ChatbotService
from app import db
from flask_cors import cross_origin
from app.middlewares.auth_middleware import verify_firebase_token
from app.utils.logger import resume_logger, log_function_call
from app.utils.errors import APIError

chatbot_bp = Blueprint('chatbot', __name__, url_prefix='/api/chat')

@chatbot_bp.route('/ask', methods=['POST'])
@cross_origin()
@verify_firebase_token
@log_function_call(resume_logger)
def ask_question():
    """Ask a question about a specific resume"""
    try:
        # Log the incoming request
        resume_logger.info(f"Received chat request: {request.get_json()}")
        
        data = request.get_json()
        if not data:
            resume_logger.error("No data provided in request")
            return jsonify({'error': 'No data provided'}), 400
            
        resume_id = data.get('resume_id')
        question = data.get('question')
        
        resume_logger.info(f"Extracted resume_id: {resume_id}, question: {question}")
        
        if not resume_id or not question:
            resume_logger.error("Missing required fields: resume_id or question")
            return jsonify({'error': 'Resume ID and question are required'}), 400
            
        # Log user information
        resume_logger.info(f"User ID from token: {g.user_id}")
        
        # Query the resume
        resume = Resume.query.filter_by(id=resume_id, user_id=g.user_id).first()
        if not resume:
            resume_logger.error(f"Resume not found: {resume_id} for user: {g.user_id}")
            return jsonify({'error': 'Resume not found'}), 404
            
        # Log resume details
        resume_logger.info(f"Found resume: {resume.id}, filename: {resume.file_name}")
        
        # Check if resume has extracted text
        if not resume.extracted_text:
            resume_logger.error(f"No extracted text found for resume: {resume_id}")
            return jsonify({'error': 'No text content available for this resume'}), 400
            
        resume_logger.info(f"Resume text length: {len(resume.extracted_text)}")
        
        try:
            chatbot_service = ChatbotService()
            resume_logger.info(f"ChatbotService initialized successfully")
        except Exception as service_error:
            resume_logger.error(f"Failed to initialize ChatbotService: {str(service_error)}", exc_info=True)
            return jsonify({'error': 'Failed to initialize chat service'}), 500
        
        resume_logger.info(f"Processing question for resume {resume_id}: {question}")
        
        try:
            answer = chatbot_service.get_response(resume, question)
            if not answer:
                resume_logger.error("Empty response received from chatbot service")
                return jsonify({'error': 'Failed to generate response'}), 500
                
            resume_logger.info(f"Successfully generated response of length: {len(answer)}")
            
            return jsonify({
                'resume_id': resume_id,
                'question': question,
                'answer': answer
            })
            
        except APIError as api_error:
            resume_logger.error(f"API Error in chatbot service: {str(api_error)}", exc_info=True)
            return jsonify({'error': str(api_error)}), api_error.status_code
            
    except Exception as e:
        resume_logger.error(f"Unexpected error in ask_question: {str(e)}", exc_info=True)
        return jsonify({'error': 'An unexpected error occurred'}), 500

@chatbot_bp.route('/analyze/<int:resume_id>', methods=['GET'])
@cross_origin()
@verify_firebase_token
@log_function_call(resume_logger)
def analyze_resume(resume_id):
    """Get a comprehensive analysis of a resume"""
    try:
        resume = Resume.query.filter_by(id=resume_id, user_id=g.user_id).first()
        if not resume:
            resume_logger.error(f"Resume not found: {resume_id} for user: {g.user_id}")
            return jsonify({'error': 'Resume not found'}), 404
            
        if not resume.extracted_text:
            resume_logger.error(f"No extracted text found for resume: {resume_id}")
            return jsonify({'error': 'No text content available for this resume'}), 400
            
        try:
            chatbot_service = ChatbotService()
            resume_logger.info(f"ChatbotService initialized successfully")
        except Exception as service_error:
            resume_logger.error(f"Failed to initialize ChatbotService: {str(service_error)}", exc_info=True)
            return jsonify({'error': 'Failed to initialize chat service'}), 500
            
        resume_logger.info(f"Analyzing resume: {resume_id}")
        
        try:
            analysis = chatbot_service.get_resume_analysis(resume)
            if not analysis:
                resume_logger.error("Empty analysis received from chatbot service")
                return jsonify({'error': 'Failed to generate analysis'}), 500
                
            return jsonify({
                'resume_id': resume_id,
                'analysis': analysis
            })
            
        except APIError as api_error:
            resume_logger.error(f"API Error in chatbot service: {str(api_error)}", exc_info=True)
            return jsonify({'error': str(api_error)}), api_error.status_code
            
    except Exception as e:
        resume_logger.error(f"Unexpected error in analyze_resume: {str(e)}", exc_info=True)
        return jsonify({'error': 'An unexpected error occurred'}), 500

@chatbot_bp.route('/history/<int:resume_id>', methods=['GET'])
@cross_origin()
@verify_firebase_token
@log_function_call(resume_logger)
def get_chat_history(resume_id):
    """Get chat history for a specific resume"""
    try:
        resume = Resume.query.filter_by(id=resume_id, user_id=g.user_id).first()
        if not resume:
            resume_logger.error(f"Resume not found: {resume_id} for user: {g.user_id}")
            return jsonify({'error': 'Resume not found'}), 404
            
        chat_history = ChatHistory.query.filter_by(resume_id=resume_id)\
            .order_by(ChatHistory.created_at.desc())\
            .all()
        
        history = [{
            'id': chat.id,
            'question': chat.question,
            'answer': chat.answer,
            'created_at': chat.created_at.isoformat()
        } for chat in chat_history]
        
        resume_logger.info(f"Retrieved {len(history)} chat history entries for resume: {resume_id}")
        return jsonify(history)
        
    except Exception as e:
        resume_logger.error(f"Error in get_chat_history: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to retrieve chat history'}), 500 