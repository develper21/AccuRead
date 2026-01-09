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
Database initialization and migration scripts for AccuRead Backend
MongoDB + Redis Hybrid Solution
"""

import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Any

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from .config import settings
from .models.mongodb_models import User, MeterReading, ExportJob, ReadingStats, SystemConfig

logger = logging.getLogger(__name__)

class DatabaseMigration:
    """Handles database migrations and initial data setup"""
    
    def __init__(self, mongodb_client: AsyncIOMotorClient):
        self.client = mongodb_client
        self.db = self.client.accuread
    
    async def init_database(self):
        """Initialize database with collections and indexes"""
        try:
            logger.info("🚀 Initializing MongoDB database...")
            
            # Initialize Beanie ODM
            await init_beanie(
                database=self.db,
                document_models=[User, MeterReading, ExportJob, ReadingStats, SystemConfig]
            )
            
            # Create indexes
            await self.create_indexes()
            
            # Insert initial data
            await self.insert_initial_data()
            
            logger.info("✅ Database initialization completed successfully")
            
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {e}")
            raise
    
    async def create_indexes(self):
        """Create MongoDB indexes for optimal performance"""
        try:
            logger.info("📊 Creating database indexes...")
            
            # User collection indexes
            await self.db.users.create_index("email", unique=True)
            await self.db.users.create_index("username", unique=True)
            await self.db.users.create_index("created_at")
            await self.db.users.create_index([("role", 1), ("is_active", 1)])
            
            # Meter reading collection indexes
            await self.db.meter_readings.create_index("user_id")
            await self.db.meter_readings.create_index("serial_number")
            await self.db.meter_readings.create_index("created_at")
            await self.db.meter_readings.create_index("reading_date")
            await self.db.meter_readings.create_index("is_verified")
            await self.db.meter_readings.create_index("meter_type")
            await self.db.meter_readings.create_index([("user_id", 1), ("created_at", -1)])
            await self.db.meter_readings.create_index([("serial_number", 1), ("created_at", -1)])
            await self.db.meter_readings.create_index([("location_coordinates", "2dsphere")])
            
            # Export job collection indexes
            await self.db.export_jobs.create_index("export_id", unique=True)
            await self.db.export_jobs.create_index("user_id")
            await self.db.export_jobs.create_index("status")
            await self.db.export_jobs.create_index("created_at")
            await self.db.export_jobs.create_index("expires_at")
            await self.db.export_jobs.create_index([("user_id", 1), ("created_at", -1)])
            await self.db.export_jobs.create_index([("status", 1), ("created_at", -1)])
            
            # Statistics collection indexes
            await self.db.reading_stats.create_index("date")
            await self.db.reading_stats.create_index([("date", -1)])
            
            # System config collection indexes
            await self.db.system_config.create_index("key", unique=True)
            await self.db.system_config.create_index("category")
            await self.db.system_config.create_index([("category", 1), ("key", 1)])
            
            logger.info("✅ All indexes created successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to create indexes: {e}")
            raise
    
    async def insert_initial_data(self):
        """Insert initial system configuration and default data"""
        try:
            logger.info("📝 Inserting initial system data...")
            
            # System configurations
            default_configs = [
                {
                    "key": "ocr_confidence_threshold",
                    "value": 0.8,
                    "description": "Minimum confidence threshold for OCR processing",
                    "category": "ocr",
                    "is_public": True
                },
                {
                    "key": "max_file_size",
                    "value": 10485760,  # 10MB in bytes
                    "description": "Maximum file size for image uploads",
                    "category": "upload",
                    "is_public": True
                },
                {
                    "key": "supported_meter_types",
                    "value": ["digital", "analog", "smart", "hybrid"],
                    "description": "Supported meter types for OCR processing",
                    "category": "ocr",
                    "is_public": True
                },
                {
                    "key": "export_file_retention_days",
                    "value": 7,
                    "description": "Number of days to retain export files",
                    "category": "export",
                    "is_public": False
                },
                {
                    "key": "rate_limit_enabled",
                    "value": True,
                    "description": "Enable rate limiting for API endpoints",
                    "category": "security",
                    "is_public": False
                },
                {
                    "key": "maintenance_mode",
                    "value": False,
                    "description": "Enable maintenance mode",
                    "category": "system",
                    "is_public": True
                }
            ]
            
            # Insert system configs
            for config in default_configs:
                try:
                    await SystemConfig.find_one(SystemConfig.key == config["key"]).upsert(
                        Set={**config, "updated_at": datetime.utcnow()},
                        on_insert=SystemConfig(**config)
                    )
                except Exception as e:
                    logger.warning(f"Failed to insert config {config['key']}: {e}")
            
            # Create default admin user if not exists
            admin_email = "admin@accuread.com"
            existing_admin = await User.find_one(User.email == admin_email)
            
            if not existing_admin:
                # Note: In production, this should be created through a secure process
                # This is just for initial setup
                logger.warning("⚠️  Default admin user should be created through secure process")
            
            logger.info("✅ Initial data inserted successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to insert initial data: {e}")
            raise
    
    async def migrate_from_sqlite(self, sqlite_db_path: str = None):
        """Migrate data from SQLite to MongoDB (if needed)"""
        if not sqlite_db_path:
            logger.info("📝 No SQLite database specified, skipping migration")
            return
        
        try:
            logger.info("🔄 Starting SQLite to MongoDB migration...")
            
            # This would be implemented if we need to migrate from existing SQLite
            # For now, we'll just log the placeholder
            logger.info("📝 SQLite migration placeholder - implement if needed")
            
        except Exception as e:
            logger.error(f"❌ SQLite migration failed: {e}")
            raise
    
    async def cleanup_expired_data(self):
        """Clean up expired export jobs and old cache data"""
        try:
            logger.info("🧹 Cleaning up expired data...")
            
            # Clean up expired export jobs
            expired_exports = await ExportJob.find({
                "expires_at": {"$lt": datetime.utcnow()},
                "file_path": {"$ne": None}
            }).to_list()
            
            for export in expired_exports:
                # Delete file from storage (implement file cleanup logic)
                logger.info(f"🗑️  Cleaning up expired export: {export.export_id}")
                await export.delete()
            
            # Clean up old statistics (keep last 90 days)
            cutoff_date = datetime.utcnow() - timedelta(days=90)
            old_stats = await ReadingStats.find(
                ReadingStats.date < cutoff_date
            ).to_list()
            
            for stat in old_stats:
                await stat.delete()
            
            logger.info(f"✅ Cleaned up {len(expired_exports)} expired exports and {len(old_stats)} old stats")
            
        except Exception as e:
            logger.error(f"❌ Cleanup failed: {e}")
            raise
    
    async def get_database_stats(self) -> Dict[str, Any]:
        """Get database statistics"""
        try:
            stats = {}
            
            # Collection counts
            stats['users_count'] = await User.count()
            stats['readings_count'] = await MeterReading.count()
            stats['exports_count'] = await ExportJob.count()
            stats['stats_count'] = await ReadingStats.count()
            stats['configs_count'] = await SystemConfig.count()
            
            # Database size
            db_stats = await self.db.command("dbStats")
            stats['database_size_mb'] = round(db_stats['dataSize'] / (1024 * 1024), 2)
            stats['index_size_mb'] = round(db_stats['indexSize'] / (1024 * 1024), 2)
            
            # Recent activity
            today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            stats['readings_today'] = await MeterReading.find(
                MeterReading.created_at >= today
            ).count()
            
            stats['active_users_today'] = await User.find({
                "last_login": {"$gte": today}
            }).count()
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Failed to get database stats: {e}")
            return {}

# Database initialization function
async def init_database():
    """Initialize the complete database setup"""
    from .database import db_manager
    
    try:
        # Connect to databases
        await db_manager.connect_to_mongodb()
        await db_manager.connect_to_redis()
        
        # Run migrations
        migration = DatabaseMigration(db_manager.mongodb_client)
        await migration.init_database()
        
        # Initialize caches
        from .cache import init_caches
        init_caches(db_manager.redis_client)
        
        logger.info("🎉 Complete database setup finished successfully!")
        
    except Exception as e:
        logger.error(f"❌ Database setup failed: {e}")
        raise

# Utility function for database health check
async def check_database_health() -> Dict[str, bool]:
    """Check health of all database connections"""
    from .database import db_manager
    
    health_status = {
        "mongodb": False,
        "redis": False
    }
    
    try:
        # Check MongoDB
        if db_manager.mongodb_client:
            await db_manager.mongodb_client.admin.command('ping')
            health_status["mongodb"] = True
        
        # Check Redis
        if db_manager.redis_client:
            await db_manager.redis_client.ping()
            health_status["redis"] = True
            
    except Exception as e:
        logger.error(f"❌ Database health check failed: {e}")
    
    return health_status

# Scheduled tasks for database maintenance
async def run_maintenance_tasks():
    """Run scheduled database maintenance tasks"""
    try:
        from .database import db_manager
        
        if not db_manager.mongodb_client:
            logger.warning("⚠️  MongoDB not connected, skipping maintenance")
            return
        
        migration = DatabaseMigration(db_manager.mongodb_client)
        await migration.cleanup_expired_data()
        
        logger.info("✅ Database maintenance completed")
        
    except Exception as e:
        logger.error(f"❌ Database maintenance failed: {e}")

if __name__ == "__main__":
    # Run database initialization
    asyncio.run(init_database())
