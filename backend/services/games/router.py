"""
Games microservice router
"""

from fastapi import APIRouter, Depends
from core.auth import get_current_user, AuthUser

router = APIRouter()

@router.get("/weekly")
async def get_weekly_games(current_user: AuthUser = Depends(get_current_user)):
    """Get weekly games"""
    return {"message": "Games endpoint - to be implemented"} 