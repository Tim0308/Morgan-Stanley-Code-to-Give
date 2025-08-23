"""
Authentication microservice router
Handles auth validation and user session management
"""

from fastapi import APIRouter, Depends
from core.auth import get_current_user, AuthUser

router = APIRouter()


@router.get("/me")
async def validate_token(current_user: AuthUser = Depends(get_current_user)):
    """Validate JWT token and return user info"""
    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "role": current_user.role,
        "valid": True
    }


@router.post("/refresh")
async def refresh_token():
    """Refresh JWT token (handled by Supabase)"""
    return {"message": "Use Supabase auth.refreshSession() on client"} 