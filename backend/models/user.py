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
User models for AccuRead Backend - Legacy SQLAlchemy (Deprecated)
Use models/mongodb_models.py for new MongoDB-based models
"""

# This file is kept for backward compatibility during migration
# All new development should use models/mongodb_models.py

from .mongodb_models import User, MeterReading, ExportJob, UserRole, MeterType, ExportStatus

# Re-export for backward compatibility
__all__ = ['User', 'MeterReading', 'ExportJob', 'UserRole', 'MeterType', 'ExportStatus']
