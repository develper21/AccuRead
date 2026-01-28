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
Database connection and configuration for AccuRead Backend
MongoDB + Redis Hybrid Solution
"""

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from redis.asyncio import Redis as AsyncRedis
from typing import Optional
import logging

from config.settings_simple import settings
from models.mongodb_models import User, MeterReading, ExportJob

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Manages MongoDB and Redis connections"""
    
    def __init__(self):
        self.mongodb_client: Optional[AsyncIOMotorClient] = None
        self.redis_client: Optional[AsyncRedis] = None
        self.db = None
        
    async def connect_to_mongodb(self):
        """Initialize MongoDB connection"""
        try:
            # Create MongoDB client
            self.mongodb_client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                retryWrites=True,
                w="majority"
            )
            
            # Get database
            self.db = self.mongodb_client.accuread
            
            # Initialize Beanie ODM
            await init_beanie(
                database=self.db,
                document_models=[User, MeterReading, ExportJob]
            )
            
            # Test connection
            await self.mongodb_client.admin.command('ping')
            logger.info("✅ Connected to MongoDB successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to MongoDB: {e}")
            raise
    
    async def connect_to_redis(self):
        """Initialize Redis connection"""
        try:
            self.redis_client = AsyncRedis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=settings.REDIS_DB,
                password=settings.REDIS_PASSWORD,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True
            )
            
            # Test connection
            await self.redis_client.ping()
            logger.info("✅ Connected to Redis successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to Redis: {e}")
            raise
    
    async def disconnect(self):
        """Close all database connections"""
        if self.mongodb_client:
            self.mongodb_client.close()
            logger.info("🔌 MongoDB connection closed")
            
        if self.redis_client:
            await self.redis_client.close()
            logger.info("🔌 Redis connection closed")
    
    async def init_indexes(self):
        """Create MongoDB indexes for optimal performance"""
        try:
            # User indexes - Beanie handles this automatically via model settings
            logger.info("📊 MongoDB indexes configured via model settings")
            
        except Exception as e:
            logger.error(f"❌ Failed to configure indexes: {e}")
            raise

# Global database manager instance
db_manager = DatabaseManager()

# Dependency functions for FastAPI
async def get_database():
    """Get MongoDB database instance"""
    return db_manager.db

async def get_redis():
    """Get Redis client instance"""
    return db_manager.redis_client

# Connection management functions
async def init_database():
    """Initialize all database connections"""
    await db_manager.connect_to_mongodb()
    await db_manager.connect_to_redis()
    await db_manager.init_indexes()

async def close_database():
    """Close all database connections"""
    await db_manager.disconnect()
