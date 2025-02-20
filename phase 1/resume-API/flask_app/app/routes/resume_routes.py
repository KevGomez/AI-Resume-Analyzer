import os
from flask import Blueprint, request, jsonify, g
from werkzeug.utils import secure_filename
from app import db
from app.models.resume import Resume, ResumeSkill, Skill
from app.services.file_service import FileService
from app.services.skill_service import SkillService
from app.middlewares.auth_middleware import verify_firebase_token
from sqlalchemy import text
from app.utils.logger import resume_logger, log_function_call
from sqlalchemy import any_

resume_bp = Blueprint('resume', __name__, url_prefix='/api/resumes')
file_service = FileService(os.getenv('UPLOAD_FOLDER', 'uploads'))
skill_service = SkillService()

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')

@resume_bp.route('/test', methods=['GET'])
@verify_firebase_token
@log_function_call(resume_logger)
def test_endpoint():
    """Test endpoint to verify API is working"""
    return jsonify({
        'status': 'success',
        'message': 'Resume API is working!',
        'user': g.user
    })

@resume_bp.route('/upload', methods=['POST'])
@verify_firebase_token
@log_function_call(resume_logger)
def upload_resume():
    """Handle resume upload and processing"""
    try:
        resume_logger.info(f"Starting resume upload process for user: {g.user_id}")
        
        # Check if file is present in request
        if 'file' not in request.files:
            resume_logger.error("No file part in request")
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if not file or not file.filename:
            resume_logger.error("No file selected")
            return jsonify({'error': 'No file selected'}), 400

        # Save the file
        resume_logger.info(f"Attempting to save file: {file.filename}")
        success, file_name = file_service.save_file(file)
        if not success:
            resume_logger.error(f"Failed to save file: {file_name}")
            return jsonify({'error': f'Failed to save file: {file_name}'}), 500

        # Extract text from file
        resume_logger.info(f"Extracting text from file: {file_name}")
        text = file_service.extract_text(file_name)
        if not text:
            resume_logger.error("Failed to extract text from file")
            return jsonify({'error': 'Failed to extract text from file'}), 500

        # Extract skills from text
        resume_logger.info("Extracting skills from text")
        skills = skill_service.extract_skills(text)
        if not skills:
            resume_logger.warning("No skills found in resume")
            return jsonify({'error': 'No skills found in resume'}), 400

        # Extract education level and experience from text using OpenAI
        try:
            resume_logger.info("Extracting education and experience info")
            from app.services.chatbot_service import ChatbotService
            chatbot = ChatbotService()
            
            # Ask about education level
            education_query = "What is the highest education level mentioned in this resume? Respond with ONLY ONE of these exact values: High School, Associate's, Bachelor's, Master's, PhD. If none found, respond with High School."
            education_level = chatbot.get_response_direct(text, education_query).strip()
            resume_logger.info(f"Detected education level: {education_level}")
            
            # Ask about years of experience
            experience_query = """Extract ALL full-time professional work experiences from the resume with their start and end dates.
            Format your response EXACTLY as follows (one experience per line):
            Company Name | Start Date (MM/YYYY) | End Date (MM/YYYY or PRESENT)

            Rules:
            - Only include full-time professional roles
            - Skip internships, part-time work, or academic experience
            - Use PRESENT for current roles
            - If exact month is unknown, use 01 for start dates and 12 for end dates
            - If no professional experience found, respond with NONE"""
            
            experience_text = chatbot.get_response_direct(text, experience_query).strip()
            resume_logger.info(f"Extracted experience text: {experience_text}")
            
            # Calculate total years of experience
            from datetime import datetime
            total_years = 0.0
            
            if experience_text.upper() != "NONE":
                current_date = datetime.now()
                for line in experience_text.split('\n'):
                    if '|' not in line:
                        continue
                    try:
                        parts = [p.strip() for p in line.split('|')]
                        if len(parts) != 3:
                            continue
                            
                        company, start_date, end_date = parts
                        start = datetime.strptime(start_date, '%m/%Y')
                        
                        if end_date.upper() == 'PRESENT':
                            end = current_date
                        else:
                            end = datetime.strptime(end_date, '%m/%Y')
                            
                        # Calculate years for this role
                        years = (end - start).days / 365.25
                        total_years += years
                        
                    except Exception as date_error:
                        resume_logger.error(f"Error parsing date from line '{line}': {str(date_error)}")
                        continue
                
                # Round to nearest 0.5
                total_years = round(total_years * 2) / 2
                
            years_exp = total_years
            resume_logger.info(f"Calculated years of experience: {years_exp}")
        except Exception as e:
            resume_logger.error(f"Error extracting education/experience: {str(e)}")
            education_level = "High School"
            years_exp = 0.0

        # Create resume record
        resume_logger.info(f"Creating resume record for user_id: {g.user_id}")
        file_path = os.path.join(os.getenv('UPLOAD_FOLDER', 'uploads'), file_name)
        file_type = file_name.rsplit('.', 1)[1].lower()
        
        resume = Resume(
            file_name=secure_filename(file.filename),
            file_path=file_path,
            file_type=file_type,
            extracted_text=text,
            user_id=g.user_id,
            years_of_experience=years_exp,
            education_level=education_level
        )
        
        try:
            db.session.add(resume)
            db.session.flush()
            resume_logger.info(f"Resume record created with ID: {resume.id}")

            # Save skills
            resume_logger.info(f"Saving extracted skills for resume ID: {resume.id}")
            skill_service.save_skills(resume, skills)
            
            db.session.commit()
            resume_logger.info(f"Transaction committed successfully for resume ID: {resume.id}")

            return jsonify({
                'message': 'Resume uploaded successfully',
                'resume_id': resume.id,
                'skills': skills
            }), 200

        except Exception as db_error:
            db.session.rollback()
            resume_logger.error(f"Database error during resume creation: {str(db_error)}", exc_info=True)
            return jsonify({'error': f'Database error: {str(db_error)}'}), 500

    except Exception as e:
        resume_logger.error(f"Error in resume upload: {str(e)}", exc_info=True)
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@resume_bp.route('/list', methods=['GET'])
@verify_firebase_token
@log_function_call(resume_logger)
def get_resumes():
    """Get list of all resumes for the current user"""
    try:
        resume_logger.debug(f"Getting resumes for user: {g.user_id}")
        resume_logger.debug(f"Headers: {request.headers}")
        
        # Test database connection with raw SQL
        try:
            result = db.session.execute(
                text("""
                SELECT id, file_name, file_type, created_at 
                FROM resumes 
                WHERE user_id = :user_id
                """),
                {"user_id": g.user_id}
            )
            
            resumes = [{
                'id': row[0],
                'filename': row[1],
                'file_type': row[2],
                'created_at': row[3].isoformat()
            } for row in result]
            
            resume_logger.debug(f"Found resumes: {resumes}")
            
            return jsonify({
                'status': 'success',
                'resumes': resumes
            })
            
        except Exception as db_error:
            resume_logger.error(f"Database error: {str(db_error)}", exc_info=True)
            return jsonify({
                'status': 'error',
                'message': f'Database error: {str(db_error)}'
            }), 500
            
    except Exception as e:
        resume_logger.error(f"Error in get_resumes: {str(e)}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@resume_bp.route('/<int:resume_id>', methods=['GET'])
@verify_firebase_token
@log_function_call(resume_logger)
def get_resume(resume_id):
    """Get specific resume details"""
    try:
        resume_logger.info(f"Getting resume details for ID: {resume_id}, user: {g.user_id}")
        resume = Resume.query.filter_by(id=resume_id, user_id=g.user_id).first()
        
        if not resume:
            resume_logger.error(f"Resume not found: {resume_id} for user: {g.user_id}")
            return jsonify({'error': 'Resume not found'}), 404
            
        resume_logger.info(f"Successfully retrieved resume: {resume_id}")
        return jsonify({
            'status': 'success',
            'resume': {
                'id': resume.id,
                'filename': resume.file_name,
                'file_type': resume.file_type,
                'created_at': resume.created_at.isoformat(),
                'skills': [skill.name for skill in resume.skills]
            }
        })
    except Exception as e:
        resume_logger.error(f"Error in get_resume: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@resume_bp.route('/<int:resume_id>/skills', methods=['GET'])
@verify_firebase_token
@log_function_call(resume_logger)
def get_resume_skills(resume_id):
    """Get skills for a specific resume"""
    try:
        resume_logger.info(f"Fetching skills for resume ID: {resume_id}, user: {g.user_id}")
        
        # Check if resume exists
        resume = Resume.query.filter_by(id=resume_id, user_id=g.user_id).first()
        if not resume:
            resume_logger.error(f"Resume not found with ID: {resume_id} for user: {g.user_id}")
            return jsonify({'error': 'Resume not found'}), 404

        # Initialize skills dictionary
        skills = {}
        
        try:
            # Check if resume_skills relationship exists
            if not hasattr(resume, 'resume_skills'):
                resume_logger.error(f"Resume {resume_id} has no resume_skills relationship")
                return jsonify({'error': 'Invalid resume data structure'}), 500
                
            # Log the number of skills found
            resume_logger.info(f"Found {len(resume.resume_skills)} skills for resume {resume_id}")
            
            # Process each skill
            for resume_skill in resume.resume_skills:
                try:
                    skill = resume_skill.skill
                    if not skill:
                        resume_logger.warning(f"Missing skill reference for resume_skill in resume {resume_id}")
                        continue
                        
                    if not skill.category:
                        resume_logger.warning(f"Skill {skill.name} has no category in resume {resume_id}")
                        continue
                        
                    if skill.category not in skills:
                        skills[skill.category] = []
                    skills[skill.category].append(skill.name)
                    
                except Exception as skill_error:
                    resume_logger.error(f"Error processing skill in resume {resume_id}: {str(skill_error)}")
                    continue

            resume_logger.info(f"Successfully retrieved skills for resume ID: {resume_id}")
            resume_logger.debug(f"Skills found: {skills}")
            return jsonify({'skills': skills}), 200
            
        except Exception as relationship_error:
            resume_logger.error(f"Error accessing resume relationships for {resume_id}: {str(relationship_error)}")
            return jsonify({'error': 'Error accessing resume data'}), 500

    except Exception as e:
        resume_logger.error(f"Error fetching resume skills: {str(e)}", exc_info=True)
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@resume_bp.route('/<int:resume_id>', methods=['DELETE'])
@verify_firebase_token
@log_function_call(resume_logger)
def delete_resume(resume_id):
    """Delete a resume and its associated file"""
    try:
        resume_logger.info(f"Attempting to delete resume ID: {resume_id}, user: {g.user_id}")
        resume = Resume.query.filter_by(id=resume_id, user_id=g.user_id).first()
        
        if not resume:
            resume_logger.error(f"Resume not found for deletion: {resume_id}")
            return jsonify({'error': 'Resume not found'}), 404
        
        # Delete the file if it exists
        if os.path.exists(resume.file_path):
            os.remove(resume.file_path)
            resume_logger.info(f"Deleted file: {resume.file_path}")
        
        db.session.delete(resume)
        db.session.commit()
        resume_logger.info(f"Successfully deleted resume: {resume_id}")
        
        return jsonify({'message': 'Resume deleted successfully'}), 200
        
    except Exception as e:
        resume_logger.error(f"Error deleting resume: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@resume_bp.route('/filter', methods=['POST'])
@verify_firebase_token
@log_function_call(resume_logger)
def filter_resumes():
    """Filter resumes based on various criteria"""
    try:
        data = request.get_json()
        resume_logger.info(f"Received filter criteria: {data}")
        
        if not data:
            return jsonify({'error': 'No filter criteria provided'}), 400

        # Start with base query
        query = Resume.query.filter_by(user_id=g.user_id)
        resume_logger.info(f"Initial query for user_id: {g.user_id}")

        # Filter by years of experience
        min_experience = data.get('min_experience')
        max_experience = data.get('max_experience')
        
        # Apply filters if provided
        if min_experience is not None:
            resume_logger.info(f"Filtering by min experience: {min_experience}")
            query = query.filter(Resume.years_of_experience >= min_experience)
            
        if max_experience is not None:
            resume_logger.info(f"Filtering by max experience: {max_experience}")
            query = query.filter(Resume.years_of_experience <= max_experience)

        # Filter by education level
        education_levels = data.get('education_levels', [])
        if education_levels:
            resume_logger.info(f"Filtering by education levels: {education_levels}")
            query = query.filter(Resume.education_level.in_(education_levels))

        # Filter by skills
        skills = data.get('skills', [])
        if skills:
            resume_logger.info(f"Filtering by skills: {skills}")
            # Make skill search case-insensitive
            query = query.join(ResumeSkill).join(Skill).filter(
                db.func.lower(Skill.name).in_([s.lower() for s in skills])
            )

        # Execute query and get count before fetching results
        total_count = query.count()
        resume_logger.info(f"Total matching resumes before fetching: {total_count}")
        
        # Execute query and format results
        resumes = query.all()
        resume_logger.info(f"Found {len(resumes)} matching resumes")
        results = []
        
        for resume in resumes:
            # Get all skills for this resume
            resume_skills = {}
            for skill in resume.skills:
                if skill.category not in resume_skills:
                    resume_skills[skill.category] = []
                resume_skills[skill.category].append(skill.name)

            # Get education details
            education = [{
                'degree': edu.degree,
                'field': edu.field,
                'institution': edu.institution,
                'graduation_year': edu.graduation_year,
                'gpa': edu.gpa
            } for edu in resume.education]

            # Format result
            result = {
                'id': resume.id,
                'filename': resume.file_name,
                'created_at': resume.created_at.isoformat(),
                'years_of_experience': resume.years_of_experience or 0.0,
                'education_level': resume.education_level or "Not Specified",
                'skills': resume_skills,
                'education': education
            }
            results.append(result)
            resume_logger.info(f"Added resume to results: {resume.id} - {resume.file_name}")

        resume_logger.info(f"Returning {len(results)} formatted results")
        return jsonify({
            'total': len(results),
            'resumes': results
        })

    except Exception as e:
        resume_logger.error(f"Error in filter_resumes: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500