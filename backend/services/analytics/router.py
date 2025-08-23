"""
Analytics microservice router
"""

from fastapi import APIRouter, Depends
from core.auth import get_current_user, AuthUser

router = APIRouter()

@router.get("/performance")
async def get_performance_metrics(current_user: AuthUser = Depends(get_current_user)):
    """Get performance metrics"""
    return {"message": "Analytics endpoint - to be implemented"} 