import os
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime
from functools import wraps

# Create logs directory if it doesn't exist
LOGS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
if not os.path.exists(LOGS_DIR):
    os.makedirs(LOGS_DIR)

def setup_logger(name, log_file, level=logging.INFO):
    """Function to setup a custom logger"""
    # Create logs directory if it doesn't exist
    if not os.path.exists(LOGS_DIR):
        os.makedirs(LOGS_DIR)
        
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
    )
    
    # Create handlers
    file_handler = RotatingFileHandler(
        os.path.join(LOGS_DIR, log_file),
        maxBytes=10000000,  # 10MB
        backupCount=5
    )
    file_handler.setFormatter(formatter)
    
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Add handlers if they don't exist
    if not logger.handlers:
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
    
    return logger

# Create specific loggers
resume_logger = setup_logger('resume_service', 'resume_service.log')
file_logger = setup_logger('file_service', 'file_service.log')
skill_logger = setup_logger('skill_service', 'skill_service.log')
auth_logger = setup_logger('auth_service', 'auth_service.log')
db_logger = setup_logger('db_service', 'db_service.log')

def log_function_call(logger):
    """Decorator to log function calls with parameters and return values"""
    def decorator(func):
        @wraps(func)  # This preserves the original function's metadata
        def wrapper(*args, **kwargs):
            func_name = func.__name__
            logger.info(f"Entering {func_name}")
            try:
                # Log parameters (excluding self for methods)
                params = {
                    **{f"arg_{i}": arg for i, arg in enumerate(args[1:] if 'self' in func.__code__.co_varnames else args)},
                    **kwargs
                }
                if params:
                    logger.debug(f"{func_name} parameters: {params}")
                
                # Execute function
                result = func(*args, **kwargs)
                
                # Log success
                logger.info(f"Exiting {func_name} successfully")
                return result
                
            except Exception as e:
                # Log error
                logger.error(f"Error in {func_name}: {str(e)}", exc_info=True)
                raise
                
        return wrapper
    return decorator 