#!/usr/bin/env python3
"""
Copyright (c) 2025 develper21

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.

IMPORTANT: Removal of this header violates the license terms.
This code remains the property of develper21 and is protected
under intellectual property laws.
"""

from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Optional
import time
import redis
from datetime import datetime, timedelta
import json
import hashlib
import os
import base64

class RateLimiter:
    def __init__(self):
        # Redis connection for distributed rate limiting
        self.redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            db=int(os.getenv('REDIS_DB', 0)),
            decode_responses=True
        )
        
        # Rate limiting configurations
        self.rate_limits = {
            'default': {'requests': 100, 'window': 60},  # 100 requests per minute
            'ocr': {'requests': 30, 'window': 60},     # 30 OCR requests per minute
            'upload': {'requests': 10, 'window': 60},    # 10 uploads per minute
            'auth': {'requests': 5, 'window': 300},      # 5 auth requests per5 minutes
            'export': {'requests': 3, 'window': 300},     # 3 exports per 5 minutes
            'admin': {'requests': 200, 'window': 60},    # 200 requests per minute for admins
        }

    def _get_client_identifier(self, request: Request, auth: Optional[HTTPAuthorizationCredentials] = None) -> str:
        """Generate unique client identifier"""
        # Try to get user ID from auth token
        if auth and auth.credentials:
            try:
                # Simple JWT parsing (in production, use proper JWT library)
                user_id = self._extract_user_from_token(auth.credentials)
                if user_id:
                    return f"user:{user_id}"
            except:
                pass
        
        # Fallback to IP address
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        
        # Create unique identifier
        identifier_data = f"{client_ip}:{user_agent}"
        return hashlib.md5(identifier_data.encode()).hexdigest()

    def _extract_user_from_token(self, token: str) -> Optional[str]:
        """Extract user ID from JWT token (simplified)"""
        try:
            # In production, use proper JWT verification
            # This is a simplified version for demonstration
            parts = token.split('.')
            if len(parts) >= 2:
                payload = parts[1]
                # Add padding if needed
                payload += '=' * (-len(payload) % 4)
                decoded = json.loads(base64.b64decode(payload))
                return str(decoded.get('sub', decoded.get('user_id')))
        except:
            pass
        return None

    def _get_rate_limit_key(self, identifier: str, endpoint_type: str) -> str:
        """Generate Redis key for rate limiting"""
        return f"rate_limit:{endpoint_type}:{identifier}"

    def _is_user_admin(self, auth: Optional[HTTPAuthorizationCredentials]) -> bool:
        """Check if user has admin privileges"""
        if not auth or not auth.credentials:
            return False
        
        try:
            user_id = self._extract_user_from_token(auth.credentials)
            if user_id:
                # Check user role in Redis cache or database
                user_role = self.redis_client.get(f"user_role:{user_id}")
                return user_role == "admin"
        except:
            pass
        return False

    def _get_endpoint_type(self, request: Request) -> str:
        """Determine endpoint type for rate limiting"""
        path = request.url.path
        
        if '/extract-meter-reading' in path:
            return 'ocr'
        elif '/upload' in path:
            return 'upload'
        elif any(auth_path in path for auth_path in ['/login', '/signup', '/refresh']):
            return 'auth'
        elif '/export' in path:
            return 'export'
        else:
            return 'default'

    async def check_rate_limit(
        self, 
        request: Request, 
        auth: Optional[HTTPAuthorizationCredentials] = None
    ) -> Dict[str, any]:
        """Check if request is within rate limits"""
        
        # Get client identifier
        identifier = self._get_client_identifier(request, auth)
        
        # Determine endpoint type
        endpoint_type = self._get_endpoint_type(request)
        
        # Check if user is admin for higher limits
        if self._is_user_admin(auth):
            endpoint_type = 'admin'
        
        # Get rate limit configuration
        config = self.rate_limits.get(endpoint_type, self.rate_limits['default'])
        
        # Generate Redis key
        key = self._get_rate_limit_key(identifier, endpoint_type)
        
        try:
            # Get current request count
            current_requests = self.redis_client.get(key)
            if current_requests is None:
                current_requests = 0
            
            # Check if limit exceeded
            if int(current_requests) >= config['requests']:
                return {
                    'allowed': False,
                    'limit': config['requests'],
                    'remaining': 0,
                    'reset_time': int(time.time() + config['window']),
                    'retry_after': config['window']
                }
            
            # Increment request count
            pipe = self.redis_client.pipeline()
            pipe.incr(key)
            pipe.expire(key, config['window'])
            pipe.execute()
            
            return {
                'allowed': True,
                'limit': config['requests'],
                'remaining': config['requests'] - int(current_requests) - 1,
                'reset_time': int(time.time() + config['window']),
                'retry_after': 0
            }
            
        except Exception as e:
            # If Redis fails, allow request but log error
            print(f"Rate limiter error: {e}")
            return {
                'allowed': True,
                'limit': config['requests'],
                'remaining': config['requests'] - 1,
                'reset_time': int(time.time() + config['window']),
                'retry_after': 0
            }

    async def get_rate_limit_status(
        self, 
        request: Request, 
        auth: Optional[HTTPAuthorizationCredentials] = None
    ) -> Dict[str, any]:
        """Get current rate limit status without incrementing"""
        
        identifier = self._get_client_identifier(request, auth)
        endpoint_type = self._get_endpoint_type(request)
        
        if self._is_user_admin(auth):
            endpoint_type = 'admin'
        
        config = self.rate_limits.get(endpoint_type, self.rate_limits['default'])
        key = self._get_rate_limit_key(identifier, endpoint_type)
        
        try:
            current_requests = self.redis_client.get(key)
            if current_requests is None:
                current_requests = 0
            
            ttl = self.redis_client.ttl(key)
            reset_time = int(time.time() + ttl) if ttl > 0 else int(time.time() + config['window'])
            
            return {
                'limit': config['requests'],
                'remaining': max(0, config['requests'] - int(current_requests)),
                'reset_time': reset_time,
                'window': config['window']
            }
            
        except Exception as e:
            print(f"Rate limit status error: {e}")
            return {
                'limit': config['requests'],
                'remaining': config['requests'],
                'reset_time': int(time.time() + config['window']),
                'window': config['window']
            }

    async def reset_rate_limit(
        self, 
        identifier: str, 
        endpoint_type: str = 'default'
    ) -> bool:
        """Reset rate limit for specific identifier (admin function)"""
        try:
            key = self._get_rate_limit_key(identifier, endpoint_type)
            self.redis_client.delete(key)
            return True
        except Exception as e:
            print(f"Rate limit reset error: {e}")
            return False

    async def get_rate_limit_stats(self) -> Dict[str, any]:
        """Get overall rate limiting statistics"""
        try:
            # Get all rate limit keys
            keys = self.redis_client.keys("rate_limit:*")
            
            stats = {
                'total_clients': 0,
                'endpoint_stats': {},
                'top_users': {}
            }
            
            for key in keys:
                key_parts = key.split(':')
                if len(key_parts) >= 3:
                    endpoint_type = key_parts[1]
                    client_id = key_parts[2]
                    
                    current_requests = self.redis_client.get(key) or 0
                    
                    # Update stats
                    if endpoint_type not in stats['endpoint_stats']:
                        stats['endpoint_stats'][endpoint_type] = {
                            'clients': 0,
                            'total_requests': 0
                        }
                    
                    stats['endpoint_stats'][endpoint_type]['clients'] += 1
                    stats['endpoint_stats'][endpoint_type]['total_requests'] += int(current_requests)
            
            return stats
            
        except Exception as e:
            print(f"Rate limit stats error: {e}")
            return {'error': str(e)}

# Global rate limiter instance
rate_limiter = RateLimiter()

# Rate limiting middleware
async def rate_limit_middleware(request: Request, call_next):
    """FastAPI middleware for rate limiting"""
    
    # Extract authorization header
    auth_header = request.headers.get("authorization")
    auth = None
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        auth = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    
    # Check rate limit
    rate_limit_result = await rate_limiter.check_rate_limit(request, auth)
    
    if not rate_limit_result['allowed']:
        # Add rate limit headers
        headers = {
            "X-RateLimit-Limit": str(rate_limit_result['limit']),
            "X-RateLimit-Remaining": str(rate_limit_result['remaining']),
            "X-RateLimit-Reset": str(rate_limit_result['reset_time']),
            "Retry-After": str(rate_limit_result['retry_after'])
        }
        
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later.",
            headers=headers
        )
    
    # Add rate limit headers to response
    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = str(rate_limit_result['limit'])
    response.headers["X-RateLimit-Remaining"] = str(rate_limit_result['remaining'])
    response.headers["X-RateLimit-Reset"] = str(rate_limit_result['reset_time'])
    
    return response

# Rate limit dependency for FastAPI endpoints
def RateLimit(endpoint_type: str = 'default'):
    """Dependency injection for rate limiting"""
    async def dependency(request: Request):
        auth_header = request.headers.get("authorization")
        auth = None
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            auth = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        
        result = await rate_limiter.check_rate_limit(request, auth)
        
        if not result['allowed']:
            headers = {
                "X-RateLimit-Limit": str(result['limit']),
                "X-RateLimit-Remaining": str(result['remaining']),
                "X-RateLimit-Reset": str(result['reset_time']),
                "Retry-After": str(result['retry_after'])
            }
            
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded for {endpoint_type}. {result['limit']} requests per {rate_limiter.rate_limits.get(endpoint_type, rate_limiter.rate_limits['default'])['window']} seconds allowed.",
                headers=headers
            )
        
        return result
    
    return dependency
