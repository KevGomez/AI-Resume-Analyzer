import os
import logging
from openai import OpenAI
from app.models.resume import ChatHistory
from app import db
from app.utils.errors import APIError
from app.utils.logger import resume_logger, log_function_call

logger = logging.getLogger(__name__)

class OpenAIService:
    """Handles OpenAI API interactions"""
    def __init__(self):
        try:
            api_key = os.getenv('OPENAI_API_KEY')
            if not api_key:
                resume_logger.error('OpenAI API key not configured')
                raise APIError('OpenAI API key not configured', status_code=500)
                
            resume_logger.info('Initializing OpenAI client...')
            self.client = OpenAI(api_key=api_key)
            
            # Get configuration from environment
            self.model = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')
            self.max_tokens = int(os.getenv('MAX_TOKENS', '150'))
            self.temperature = 0.7
            
            # Test the API key with a simple request
            test_response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": "Test"}],
                max_tokens=10
            )
            if not test_response.choices or not test_response.choices[0].message:
                raise APIError('Failed to validate OpenAI API key', status_code=500)
                
            resume_logger.info('OpenAI client initialized and validated successfully')
            
        except Exception as e:
            resume_logger.error(f'Error initializing OpenAI service: {str(e)}', exc_info=True)
            if isinstance(e, APIError):
                raise
            raise APIError(f'Error initializing OpenAI service: {str(e)}', status_code=500)

    @log_function_call(resume_logger)
    def create_chat_completion(self, messages, max_tokens=None, temperature=None):
        """Create a chat completion with error handling"""
        try:
            resume_logger.info(f'Sending request to OpenAI API with {len(messages)} messages')
            resume_logger.debug(f'Messages content: {messages}')
            resume_logger.debug(f'Using model: {self.model}, max_tokens: {max_tokens or self.max_tokens}')
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=max_tokens or self.max_tokens,
                temperature=temperature or self.temperature,
                stop=["END_RESPONSE"]  # Add a stop sequence to ensure complete responses
            )
            
            if not response.choices:
                resume_logger.error('No choices in OpenAI response')
                raise APIError('No response from OpenAI', status_code=500)
                
            if not response.choices[0].message:
                resume_logger.error('No message in OpenAI response choice')
                raise APIError('Invalid response from OpenAI', status_code=500)
                
            answer = response.choices[0].message.content
            if not answer:
                resume_logger.error('Empty content in OpenAI response')
                raise APIError('Empty response from OpenAI', status_code=500)
                
            resume_logger.info(f'Successfully received response from OpenAI: {len(answer)} characters')
            return answer.strip()
            
        except Exception as e:
            resume_logger.error(f"OpenAI API error: {str(e)}", exc_info=True)
            if isinstance(e, APIError):
                raise
            raise APIError(f'Error communicating with OpenAI API: {str(e)}', status_code=503)

class ChatbotService:
    """Handles resume analysis and chat functionality"""
    def __init__(self):
        try:
            self.openai_service = OpenAIService()
            self.system_message = """You are an AI assistant specialized in analyzing resumes and providing insights. 
            You can answer questions about the resume content, suggest improvements, and provide career advice based on the resume information.
            Keep your responses professional, constructive, and focused on the resume content.
            Due to token limits, you must:
            • Prioritize the most important points first
            • Be concise and direct in your suggestions
            • Focus on 2-3 key improvements when asked about CV enhancements
            • Use bullet points (•) without any numbering or headers
            • Start each point directly with the suggestion
            • Avoid lengthy explanations
            End your response with END_RESPONSE when you've completed answering the current question."""
            resume_logger.info('ChatbotService initialized successfully')
        except Exception as e:
            resume_logger.error(f'Error initializing ChatbotService: {str(e)}', exc_info=True)
            raise

    @log_function_call(resume_logger)
    def get_chat_context(self, resume, limit=5):
        """Get previous chat context"""
        try:
            history = ChatHistory.query.filter_by(resume_id=resume.id)\
                .order_by(ChatHistory.created_at.desc())\
                .limit(limit).all()
            resume_logger.info(f'Retrieved {len(history)} chat history entries')
            return history
        except Exception as e:
            resume_logger.error(f'Error retrieving chat history: {str(e)}', exc_info=True)
            raise APIError('Error retrieving chat history', status_code=500)

    @log_function_call(resume_logger)
    def prepare_messages(self, resume, question):
        """Prepare messages for OpenAI API"""
        try:
            # Determine if this is a CV improvement question
            is_improvement_question = any(keyword in question.lower() for keyword in ['improve', 'enhancement', 'suggestion', 'better'])
            
            instruction = """
            Provide a focused and complete response to this specific question only.
            Keep your response within the token limit by being concise and direct.
            """
            
            if is_improvement_question:
                instruction += """
                For CV improvements:
                • List 2-3 most important suggestions using bullet points (•)
                • Start each point directly with the action or improvement
                • Do not use numbers or headers
                • Be specific but brief
                Example format:
                • Add quantifiable achievements to work experience
                • Include a technical skills section
                """
            
            messages = [
                {"role": "system", "content": self.system_message},
                {"role": "user", "content": f"Here is the resume content:\n{resume.extracted_text}\n\nQuestion: {question}\n\n{instruction}\n\nEnd your response with END_RESPONSE."}
            ]
            
            resume_logger.info(f'Prepared {len(messages)} messages for OpenAI')
            return messages
        except Exception as e:
            resume_logger.error(f'Error preparing messages: {str(e)}', exc_info=True)
            raise APIError('Error preparing chat messages', status_code=500)

    @log_function_call(resume_logger)
    def save_chat_history(self, resume_id: int, question: str, answer: str):
        """Save chat interaction to database"""
        try:
            # Remove the END_RESPONSE marker if present
            answer = answer.replace("END_RESPONSE", "").strip()
            
            chat_history = ChatHistory(
                resume_id=resume_id,
                question=question,
                answer=answer
            )
            db.session.add(chat_history)
            db.session.commit()
            resume_logger.info('Successfully saved chat history')
        except Exception as e:
            resume_logger.error(f'Error saving chat history: {str(e)}', exc_info=True)
            db.session.rollback()
            raise APIError('Error saving chat history', status_code=500)

    @log_function_call(resume_logger)
    def get_response(self, resume, question):
        """Get chatbot response for a resume-related question"""
        try:
            if not resume.extracted_text:
                resume_logger.error(f'No extracted text found for resume {resume.id}')
                raise APIError('No resume text available for analysis', status_code=400)

            resume_logger.info(f'Processing question for resume {resume.id}')
            messages = self.prepare_messages(resume, question)
            
            answer = self.openai_service.create_chat_completion(messages)
            # Remove the END_RESPONSE marker if present
            answer = answer.replace("END_RESPONSE", "").strip()
            
            self.save_chat_history(resume.id, question, answer)
            
            resume_logger.info('Successfully generated and saved response')
            return answer
            
        except Exception as e:
            resume_logger.error(f'Error in get_response: {str(e)}', exc_info=True)
            if isinstance(e, APIError):
                raise e
            raise APIError('Error processing chat request', status_code=500)

    @log_function_call(resume_logger)
    def get_resume_analysis(self, resume):
        """Get an overall analysis of the resume"""
        try:
            if not resume.extracted_text:
                resume_logger.error(f'No extracted text found for resume {resume.id}')
                raise APIError('No resume text available for analysis', status_code=400)

            prompt = f"""Please analyze this resume and provide a comprehensive evaluation covering:
            1. Overall impression
            2. Key strengths
            3. Areas for improvement
            4. Suggested enhancements
            
            Resume content:
            {resume.extracted_text}"""
            
            messages = [
                {"role": "system", "content": self.system_message},
                {"role": "user", "content": prompt}
            ]
            
            resume_logger.info('Sending resume analysis request to OpenAI')
            analysis = self.openai_service.create_chat_completion(messages, max_tokens=1000)
            resume_logger.info('Successfully generated resume analysis')
            return analysis
            
        except Exception as e:
            resume_logger.error(f'Error in get_resume_analysis: {str(e)}', exc_info=True)
            if isinstance(e, APIError):
                raise e
            raise APIError('Error analyzing resume', status_code=500)

    def get_response_direct(self, context: str, query: str) -> str:
        """Get a direct response from the chatbot without any conversation context.
        
        Args:
            context (str): The text to analyze (e.g. resume content)
            query (str): The specific question to ask about the context
            
        Returns:
            str: The chatbot's response
            
        Raises:
            Exception: If there's an error getting the response or if response is None
        """
        from openai.types.chat import ChatCompletionMessageParam
        messages: list[ChatCompletionMessageParam] = [
            {"role": "system", "content": "You are a helpful assistant that analyzes resumes. Provide direct, concise answers."},
            {"role": "user", "content": f"Here is a resume:\n\n{context}\n\nQuestion: {query}"}
        ]
        
        try:
            response = self.openai_service.client.chat.completions.create(
                model=self.openai_service.model,
                messages=messages,
                temperature=0.0  # Use 0 temperature for consistent, deterministic responses
            )
            content = response.choices[0].message.content
            if content is None:
                raise Exception("Received null response from OpenAI")
            return content
        except Exception as e:
            logger.error(f"Error getting chatbot response: {str(e)}")
            raise 