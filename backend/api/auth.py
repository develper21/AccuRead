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
Authentication endpoints for AccuRead Backend
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from typing import Dict, Any, Union
from datetime import timedelta, datetime

from models.meter import LoginRequest, Token, TokenData, User, UserCreate
from utils.auth import (
    authenticate_user, 
    create_access_token, 
    create_refresh_token,
    get_password_hash,
    get_current_user,
    get_current_active_user
)
from config.settings import settings

router = APIRouter()
security = HTTPBearer()

def authenticate_user(username: str, password: str) -> Union[User, bool]:
    """Authenticate user credentials."""
    # Mock authentication for now
    if username == "admin" and password == "admin123":
        return User(
            id=1,
            username="admin",
            email="admin@example.com",
            hashed_password="dummy",
            role="admin",
            is_active=True,
            created_at="2024-01-01T00:00:00Z",
            updated_at="2024-01-01T00:00:00Z"
        )
    elif username == "user" and password == "user123":
        return User(
            id=2,
            username="user",
            email="user@example.com",
            hashed_password="dummy",
            role="user",
            is_active=True,
            created_at="2024-01-01T00:00:00Z",
            updated_at="2024-01-01T00:00:00Z"
        )
    return False

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest) -> Dict[str, Any]:
    """
    Authenticate user and return JWT tokens
    """
    # Authenticate user (mock implementation for now)
    user = authenticate_user(login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id}, 
        expires_delta=access_token_expires
    )
    
    # Create refresh token
    refresh_token = create_refresh_token(
        data={"sub": user.username, "user_id": user.id}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.JWT_EXPIRE_MINUTES * 60  # Convert to seconds
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(credentials: Dict[str, str]) -> Dict[str, Any]:
    """
    Refresh JWT tokens using refresh token
    """
    refresh_token = credentials.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Refresh token required"
        )
    
    try:
        # Verify refresh token
        from utils.auth import verify_token
        payload = verify_token(refresh_token)
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        username = payload.get("sub")
        user_id = payload.get("user_id")
        
        if not username or not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Create new access token
        access_token_expires = timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": username, "user_id": user_id}, 
            expires_delta=access_token_expires
        )
        
        # Create new refresh token
        new_refresh_token = create_refresh_token(
            data={"sub": username, "user_id": user_id}
        )
        
        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_EXPIRE_MINUTES * 60
        }
        
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_active_user)) -> Dict[str, str]:
    """
    Logout user (token invalidation would be handled on client side)
    """
    return {"message": "Successfully logged out"}

@router.post("/register")
async def register(user_data: UserCreate) -> Dict[str, Any]:
    """
    Register a new user
    """
    # Check if user already exists (mock implementation)
    if user_data.username in ["admin", "user"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user (mock implementation)
    new_user = {
        "id": 999,
        "email": user_data.email,
        "username": user_data.username,
        "full_name": user_data.full_name,
        "role": user_data.role,
        "is_active": user_data.is_active,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    }
    
    return new_user

@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_active_user)) -> Dict[str, Any]:
    """
    Get current user information
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": getattr(current_user, 'full_name', None),
        "role": getattr(current_user, 'role', 'user'),
        "is_active": current_user.is_active,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    }
