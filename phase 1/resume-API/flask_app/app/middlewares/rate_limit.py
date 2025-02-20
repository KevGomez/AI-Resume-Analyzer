from functools import wraps
from typing import Callable, Optional
from flask import request, g
import redis
import time
from ..utils.errors import APIError
from ..utils.logger import get_logger
from ..config.config import Config

logger = get_logger(__name__)

class RateLimitExceeded(APIError):
    """Rate limit exceeded error"""
    def __init__(self, message: str = 'Rate limit exceeded'):
        super().__init__(
            message=message,
            status_code=429,
            error_code='RATE_LIMIT_EXCEEDED'
        )

class RateLimiter:
    """Rate limiter using Redis"""
    
    def __init__(self, redis_url: Optional[str] = None):
        self.redis = redis.from_url(redis_url or Config.REDIS_URL)
    
    def is_rate_limited(self, key: str, limit: int, window: int) -> bool:
        """Check if request is rate limited
        
        Args:
            key: Unique key for the rate limit
            limit: Maximum number of requests
            window: Time window in seconds
        
        Returns:
            bool: True if rate limited, False otherwise
        """
        try:
            pipe = self.redis.pipeline()
            now = time.time()
            
            # Remove old requests
            pipe.zremrangebyscore(key, 0, now - window)
            
            # Count requests in window
            pipe.zcard(key)
            
            # Add current request
            pipe.zadd(key, {str(now): now})
            
            # Set expiry
            pipe.expire(key, window)
            
            # Execute pipeline
            _, request_count, *_ = pipe.execute()
            
            return request_count > limit
            
        except Exception as e:
            logger.error(f"Rate limiter error: {str(e)}")
            return False  # Fail open on errors
    
    def get_remaining(self, key: str, limit: int, window: int) -> int:
        """Get remaining requests in window"""
        try:
            now = time.time()
            
            # Remove old requests
            self.redis.zremrangebyscore(key, 0, now - window)
            
            # Count requests in window
            count = self.redis.zcard(key)
            
            return max(0, limit - count)
            
        except Exception as e:
            logger.error(f"Rate limiter error: {str(e)}")
            return 0

# Create global rate limiter instance
rate_limiter = RateLimiter()

def rate_limit(limit: int = 100, window: int = 3600):
    """Rate limiting decorator
    
    Args:
        limit: Maximum number of requests per window
        window: Time window in seconds
    """
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def decorated(*args, **kwargs):
            # Get client identifier (user ID or IP)
            client_id = getattr(g, 'user', {}).get('uid') or request.remote_addr
            
            # Create rate limit key
            key = f"rate_limit:{request.endpoint}:{client_id}"
            
            # Check rate limit
            if rate_limiter.is_rate_limited(key, limit, window):
                remaining = rate_limiter.get_remaining(key, limit, window)
                raise RateLimitExceeded(
                    f"Rate limit exceeded. Try again later. Remaining: {remaining}"
                )
            
            return f(*args, **kwargs)
        return decorated
    return decorator 