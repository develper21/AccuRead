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
Test script for MongoDB + Redis database setup
"""

import asyncio
import logging
from datetime import datetime

from database import init_database, close_database, check_database_health
from models.mongodb_models import User, MeterReading, ExportJob, SystemConfig
from cache import user_cache, reading_cache, export_cache

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_mongodb_operations():
    """Test basic MongoDB operations"""
    logger.info("🧪 Testing MongoDB operations...")
    
    try:
        # Create a test user
        test_user = User(
            email="test@example.com",
            username="testuser",
            full_name="Test User",
            hashed_password="hashed_password_here",
            role="user"
        )
        
        await test_user.save()
        logger.info(f"✅ Created test user: {test_user.id}")
        
        # Create a test meter reading
        test_reading = MeterReading(
            user_id=test_user.id,
            serial_number="TEST123456",
            meter_type="digital",
            reading_kwh=1234.56,
            reading_kvah=567.89,
            image_path="/test/path/image.jpg",
            confidence_scores={"reading": 0.95, "serial": 0.88},
            location={"lat": 28.6139, "lng": 77.2090},
            location_coordinates=[77.2090, 28.6139]
        )
        
        await test_reading.save()
        logger.info(f"✅ Created test reading: {test_reading.id}")
        
        # Create a test export job
        test_export = ExportJob(
            export_id="TEST_EXPORT_001",
            user_id=test_user.id,
            format="csv",
            filters={"date_range": {"start": "2024-01-01", "end": "2024-01-31"}}
        )
        
        await test_export.save()
        logger.info(f"✅ Created test export job: {test_export.id}")
        
        # Test queries
        users = await User.find().to_list()
        logger.info(f"📊 Found {len(users)} users")
        
        readings = await MeterReading.find().to_list()
        logger.info(f"📊 Found {len(readings)} readings")
        
        exports = await ExportJob.find().to_list()
        logger.info(f"📊 Found {len(exports)} exports")
        
        # Test relationship queries
        user_readings = await MeterReading.find(MeterReading.user_id == test_user.id).to_list()
        logger.info(f"📊 User {test_user.username} has {len(user_readings)} readings")
        
        # Cleanup test data
        await test_export.delete()
        await test_reading.delete()
        await test_user.delete()
        logger.info("🧹 Cleaned up test data")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ MongoDB test failed: {e}")
        return False

async def test_redis_operations():
    """Test basic Redis operations"""
    logger.info("🧪 Testing Redis operations...")
    
    try:
        # Test user cache
        test_user_data = {
            "id": "test123",
            "email": "test@example.com",
            "username": "testuser"
        }
        
        # Set cache
        success = await user_cache.set_user("test123", test_user_data)
        logger.info(f"✅ User cache set: {success}")
        
        # Get cache
        cached_user = await user_cache.get_user("test123")
        logger.info(f"✅ User cache retrieved: {cached_user is not None}")
        
        # Test reading cache
        test_reading_data = {
            "id": "reading123",
            "serial_number": "TEST123",
            "reading_kwh": 1234.56
        }
        
        await reading_cache.set_reading("reading123", test_reading_data)
        cached_reading = await reading_cache.get_reading("reading123")
        logger.info(f"✅ Reading cache test: {cached_reading is not None}")
        
        # Test export cache
        test_export_data = {
            "export_id": "export123",
            "status": "completed",
            "progress": 100
        }
        
        await export_cache.set_export_job("export123", test_export_data)
        cached_export = await export_cache.get_export_job("export123")
        logger.info(f"✅ Export cache test: {cached_export is not None}")
        
        # Test rate limiting
        can_proceed, remaining = await rate_limit_cache.check_rate_limit("test_user", 5, 60)
        logger.info(f"✅ Rate limit test: can_proceed={can_proceed}, remaining={remaining}")
        
        # Cleanup test cache data
        await user_cache.delete("user", "test123")
        await reading_cache.delete("reading", "reading123")
        await export_cache.delete("export", "export123")
        logger.info("🧹 Cleaned up test cache data")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Redis test failed: {e}")
        return False

async def test_database_health():
    """Test database health checks"""
    logger.info("🏥 Testing database health...")
    
    try:
        health = await check_database_health()
        
        for service, status in health.items():
            status_icon = "✅" if status else "❌"
            logger.info(f"{status_icon} {service}: {'Healthy' if status else 'Unhealthy'}")
        
        return all(health.values())
        
    except Exception as e:
        logger.error(f"❌ Health check failed: {e}")
        return False

async def test_performance():
    """Basic performance test"""
    logger.info("⚡ Running performance test...")
    
    try:
        # Test MongoDB insert performance
        start_time = datetime.utcnow()
        
        test_users = []
        for i in range(10):
            user = User(
                email=f"perf_test_{i}@example.com",
                username=f"perfuser_{i}",
                full_name=f"Performance Test User {i}",
                hashed_password="hashed_password",
                role="user"
            )
            test_users.append(user)
        
        # Bulk insert
        await User.insert_many(test_users)
        
        end_time = datetime.utcnow()
        duration = (end_time - start_time).total_seconds()
        
        logger.info(f"⚡ Inserted 10 users in {duration:.3f} seconds")
        
        # Test query performance
        start_time = datetime.utcnow()
        users = await User.find().to_list()
        end_time = datetime.utcnow()
        duration = (end_time - start_time).total_seconds()
        
        logger.info(f"⚡ Queried {len(users)} users in {duration:.3f} seconds")
        
        # Cleanup
        for user in test_users:
            await user.delete()
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Performance test failed: {e}")
        return False

async def run_all_tests():
    """Run all database tests"""
    logger.info("🚀 Starting comprehensive database tests...")
    
    test_results = {}
    
    try:
        # Initialize database
        await init_database()
        
        # Run tests
        test_results['mongodb'] = await test_mongodb_operations()
        test_results['redis'] = await test_redis_operations()
        test_results['health'] = await test_database_health()
        test_results['performance'] = await test_performance()
        
        # Summary
        passed = sum(test_results.values())
        total = len(test_results)
        
        logger.info(f"\n📊 Test Results Summary:")
        logger.info(f"✅ Passed: {passed}/{total}")
        
        for test_name, result in test_results.items():
            status = "✅" if result else "❌"
            logger.info(f"{status} {test_name.title()}: {'PASS' if result else 'FAIL'}")
        
        if passed == total:
            logger.info("\n🎉 All tests passed! Database setup is working correctly.")
        else:
            logger.warning(f"\n⚠️  {total - passed} test(s) failed. Please check the setup.")
        
        return passed == total
        
    except Exception as e:
        logger.error(f"❌ Test suite failed: {e}")
        return False
    
    finally:
        # Cleanup
        await close_database()

if __name__ == "__main__":
    # Import rate_limit_cache here to avoid circular imports
    from cache import rate_limit_cache
    
    # Run tests
    success = asyncio.run(run_all_tests())
    exit(0 if success else 1)
