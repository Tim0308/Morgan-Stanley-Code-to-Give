"""
Notifications microservice router
"""

from fastapi import APIRouter, Depends
from core.auth import get_current_user, AuthUser

router = APIRouter()

@router.get("/")
async def get_notifications(current_user: AuthUser = Depends(get_current_user)):
    """Get user notifications"""
    return {"message": "Notifications endpoint - to be implemented"} 