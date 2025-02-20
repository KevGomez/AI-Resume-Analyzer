import logging
import logging.handlers
import os
from datetime import datetime
from pathlib import Path
from typing import Optional, Union
from functools import wraps

def setup_logging(app_name: str = 'resume-api', log_level: str = 'INFO',
                 log_dir: Optional[Union[str, Path]] = None) -> logging.Logger:
    """Configure application logging
    
    Args:
        app_name: Name of the application
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_dir: Directory to store log files
    
    Returns:
        Logger instance
    """
    # Create logger
    logger = logging.getLogger(app_name)
    logger.setLevel(getattr(logging, log_level.upper()))
    
    # Create formatters
    console_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    file_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
    )
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    # File handlers
    log_path: Path = Path(log_dir) if log_dir else Path(__file__).parent.parent.parent / 'logs'
    log_path.mkdir(exist_ok=True)
    
    # Regular log file
    log_file = log_path / f"{app_name}.log"
    file_handler = logging.handlers.RotatingFileHandler(
        str(log_file),  # Convert Path to str for handler
        maxBytes=10485760,  # 10MB
        backupCount=5
    )
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)
    
    # Error log file
    error_log_file = log_path / f"{app_name}_error.log"
    error_handler = logging.handlers.RotatingFileHandler(
        str(error_log_file),  # Convert Path to str for handler
        maxBytes=10485760,  # 10MB
        backupCount=5
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(file_formatter)
    logger.addHandler(error_handler)
    
    # Set logging level for other libraries
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    logging.getLogger('sqlalchemy').setLevel(logging.WARNING)
    
    logger.info(f"Logging setup completed. Log files will be stored in {log_path}")
    
    return logger

def get_logger(name: Optional[str] = None) -> logging.Logger:
    """Get a logger instance
    
    Args:
        name: Logger name (defaults to root logger)
    
    Returns:
        Logger instance
    """
    return logging.getLogger(name)

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

# Create specific loggers
skill_logger = get_logger('skill_service')
resume_logger = get_logger('resume_service') 