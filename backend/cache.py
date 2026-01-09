#!/usr/bin/env python3
"""
Copyright (c) 2025 develper21

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.

IMPORTANT: Removal of this header violates the license terms.
This code remains the property of develper21 and is protected
under intellectual property laws.
"""

"""
Redis caching layer for AccuRead Backend
"""

import json
import pickle
from typing import Any, Optional, Union, List
from datetime import datetime, timedelta
import logging

from redis.asyncio import Redis as AsyncRedis
from .config import settings

logger = logging.getLogger(__name__)

class CacheManager:
    """Manages Redis caching operations"""
    
    def __init__(self, redis_client: AsyncRedis):
        self.redis = redis_client
        self.default_ttl = 3600  # 1 hour default
    
    def _make_key(self, prefix: str, identifier: str) -> str:
        """Generate cache key with prefix"""
        return f"accuread:{prefix}:{identifier}"
    
    async def get(self, prefix: str, identifier: str) -> Optional[Any]:
        """Get cached value"""
        try:
            key = self._make_key(prefix, identifier)
            value = await self.redis.get(key)
            
            if value:
                # Try to deserialize as JSON first, then pickle
                try:
                    return json.loads(value)
                except (json.JSONDecodeError, TypeError):
                    try:
                        return pickle.loads(value)
                    except (pickle.PickleError, TypeError):
                        return value
            
            return None
            
        except Exception as e:
            logger.error(f"Cache get error for key {prefix}:{identifier}: {e}")
            return None
    
    async def set(self, prefix: str, identifier: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set cached value with TTL"""
        try:
            key = self._make_key(prefix, identifier)
            ttl = ttl or self.default_ttl
            
            # Serialize value
            if isinstance(value, (dict, list, str, int, float, bool)):
                serialized = json.dumps(value, default=str)
            else:
                serialized = pickle.dumps(value)
            
            result = await self.redis.setex(key, ttl, serialized)
            return bool(result)
            
        except Exception as e:
            logger.error(f"Cache set error for key {prefix}:{identifier}: {e}")
            return False
    
    async def delete(self, prefix: str, identifier: str) -> bool:
        """Delete cached value"""
        try:
            key = self._make_key(prefix, identifier)
            result = await self.redis.delete(key)
            return bool(result)
            
        except Exception as e:
            logger.error(f"Cache delete error for key {prefix}:{identifier}: {e}")
            return False
    
    async def delete_pattern(self, pattern: str) -> int:
        """Delete keys matching pattern"""
        try:
            full_pattern = f"accuread:{pattern}"
            keys = await self.redis.keys(full_pattern)
            if keys:
                return await self.redis.delete(*keys)
            return 0
            
        except Exception as e:
            logger.error(f"Cache delete pattern error for {pattern}: {e}")
            return 0
    
    async def exists(self, prefix: str, identifier: str) -> bool:
        """Check if key exists"""
        try:
            key = self._make_key(prefix, identifier)
            return bool(await self.redis.exists(key))
            
        except Exception as e:
            logger.error(f"Cache exists error for key {prefix}:{identifier}: {e}")
            return False
    
    async def increment(self, prefix: str, identifier: str, amount: int = 1) -> Optional[int]:
        """Increment numeric value"""
        try:
            key = self._make_key(prefix, identifier)
            return await self.redis.incrby(key, amount)
            
        except Exception as e:
            logger.error(f"Cache increment error for key {prefix}:{identifier}: {e}")
            return None
    
    async def expire(self, prefix: str, identifier: str, ttl: int) -> bool:
        """Set expiration for existing key"""
        try:
            key = self._make_key(prefix, identifier)
            return bool(await self.redis.expire(key, ttl))
            
        except Exception as e:
            logger.error(f"Cache expire error for key {prefix}:{identifier}: {e}")
            return False

# Specialized cache classes for different data types
class UserCache(CacheManager):
    """Cache for user-related data"""
    
    async def get_user(self, user_id: str) -> Optional[dict]:
        """Get user data from cache"""
        return await self.get("user", user_id)
    
    async def set_user(self, user_id: str, user_data: dict) -> bool:
        """Cache user data"""
        return await self.set("user", user_id, user_data, settings.CACHE_TTL_USER)
    
    async def get_user_by_email(self, email: str) -> Optional[dict]:
        """Get user by email from cache"""
        return await self.get("user_email", email)
    
    async def set_user_by_email(self, email: str, user_data: dict) -> bool:
        """Cache user data by email"""
        return await self.set("user_email", email, user_data, settings.CACHE_TTL_USER)
    
    async def invalidate_user(self, user_id: str, email: str = None) -> bool:
        """Invalidate user cache entries"""
        success = await self.delete("user", user_id)
        if email:
            success = success and await self.delete("user_email", email)
        return success

class MeterReadingCache(CacheManager):
    """Cache for meter reading data"""
    
    async def get_reading(self, reading_id: str) -> Optional[dict]:
        """Get reading data from cache"""
        return await self.get("reading", reading_id)
    
    async def set_reading(self, reading_id: str, reading_data: dict) -> bool:
        """Cache reading data"""
        return await self.set("reading", reading_id, reading_data, settings.CACHE_TTL_READING)
    
    async def get_user_readings(self, user_id: str, page: int = 1) -> Optional[List[dict]]:
        """Get user's readings from cache"""
        return await self.get("user_readings", f"{user_id}:{page}")
    
    async def set_user_readings(self, user_id: str, page: int, readings: List[dict]) -> bool:
        """Cache user's readings"""
        return await self.set("user_readings", f"{user_id}:{page}", readings, settings.CACHE_TTL_READING)
    
    async def get_meter_readings(self, serial_number: str, page: int = 1) -> Optional[List[dict]]:
        """Get meter's readings from cache"""
        return await self.get("meter_readings", f"{serial_number}:{page}")
    
    async def set_meter_readings(self, serial_number: str, page: int, readings: List[dict]) -> bool:
        """Cache meter's readings"""
        return await self.set("meter_readings", f"{serial_number}:{page}", readings, settings.CACHE_TTL_READING)

class ExportCache(CacheManager):
    """Cache for export job data"""
    
    async def get_export_job(self, export_id: str) -> Optional[dict]:
        """Get export job from cache"""
        return await self.get("export", export_id)
    
    async def set_export_job(self, export_id: str, job_data: dict) -> bool:
        """Cache export job"""
        return await self.set("export", export_id, job_data, settings.CACHE_TTL_EXPORT)
    
    async def get_user_exports(self, user_id: str) -> Optional[List[dict]]:
        """Get user's exports from cache"""
        return await self.get("user_exports", user_id)
    
    async def set_user_exports(self, user_id: str, exports: List[dict]) -> bool:
        """Cache user's exports"""
        return await self.set("user_exports", user_id, exports, settings.CACHE_TTL_EXPORT)

class StatsCache(CacheManager):
    """Cache for statistics and analytics"""
    
    async def get_daily_stats(self, date: str) -> Optional[dict]:
        """Get daily statistics from cache"""
        return await self.get("stats_daily", date)
    
    async def set_daily_stats(self, date: str, stats: dict) -> bool:
        """Cache daily statistics"""
        return await self.set("stats_daily", date, stats, settings.CACHE_TTL_STATS)
    
    async def get_user_stats(self, user_id: str) -> Optional[dict]:
        """Get user statistics from cache"""
        return await self.get("stats_user", user_id)
    
    async def set_user_stats(self, user_id: str, stats: dict) -> bool:
        """Cache user statistics"""
        return await self.set("stats_user", user_id, stats, settings.CACHE_TTL_STATS)

# Rate limiting cache
class RateLimitCache(CacheManager):
    """Cache for rate limiting"""
    
    async def check_rate_limit(self, identifier: str, limit: int, window: int) -> tuple[bool, int]:
        """Check if rate limit is exceeded"""
        key = self._make_key("rate_limit", identifier)
        
        try:
            current = await self.redis.get(key)
            if current is None:
                # First request in window
                await self.redis.setex(key, window, 1)
                return True, limit - 1
            
            current_count = int(current)
            if current_count >= limit:
                # Rate limit exceeded
                return False, 0
            
            # Increment counter
            await self.redis.incr(key)
            remaining = limit - current_count - 1
            return True, remaining
            
        except Exception as e:
            logger.error(f"Rate limit check error for {identifier}: {e}")
            # On error, allow the request
            return True, limit
    
    async def get_rate_limit_status(self, identifier: str) -> Optional[dict]:
        """Get current rate limit status"""
        key = self._make_key("rate_limit", identifier)
        try:
            current = await self.redis.get(key)
            ttl = await self.redis.ttl(key)
            
            if current is not None:
                return {
                    "current": int(current),
                    "reset_time": ttl if ttl > 0 else 0
                }
            return None
            
        except Exception as e:
            logger.error(f"Rate limit status error for {identifier}: {e}")
            return None

# Session management cache
class SessionCache(CacheManager):
    """Cache for user sessions"""
    
    async def create_session(self, session_id: str, user_data: dict, ttl: int = 86400) -> bool:
        """Create new session"""
        return await self.set("session", session_id, user_data, ttl)
    
    async def get_session(self, session_id: str) -> Optional[dict]:
        """Get session data"""
        return await self.get("session", session_id)
    
    async def update_session(self, session_id: str, user_data: dict, ttl: int = 86400) -> bool:
        """Update session data"""
        return await self.set("session", session_id, user_data, ttl)
    
    async def delete_session(self, session_id: str) -> bool:
        """Delete session"""
        return await self.delete("session", session_id)
    
    async def refresh_session(self, session_id: str, ttl: int = 86400) -> bool:
        """Refresh session expiration"""
        return await self.expire("session", session_id, ttl)

# Global cache instances (to be initialized with Redis client)
user_cache: Optional[UserCache] = None
reading_cache: Optional[MeterReadingCache] = None
export_cache: Optional[ExportCache] = None
stats_cache: Optional[StatsCache] = None
rate_limit_cache: Optional[RateLimitCache] = None
session_cache: Optional[SessionCache] = None

def init_caches(redis_client: AsyncRedis):
    """Initialize all cache instances"""
    global user_cache, reading_cache, export_cache, stats_cache, rate_limit_cache, session_cache
    
    user_cache = UserCache(redis_client)
    reading_cache = MeterReadingCache(redis_client)
    export_cache = ExportCache(redis_client)
    stats_cache = StatsCache(redis_client)
    rate_limit_cache = RateLimitCache(redis_client)
    session_cache = SessionCache(redis_client)
    
    logger.info("🗄️ All cache managers initialized")
