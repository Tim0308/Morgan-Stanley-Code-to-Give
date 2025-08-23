"""
Analytics microservice router
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional
import logging

from core.auth import get_current_user, get_current_parent, AuthUser
from .service import AnalyticsService

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/performance")
async def get_performance_metrics(
    child_id: Optional[str] = Query(None, description="Specific child ID (optional)"),
    current_user: AuthUser = Depends(get_current_parent)
):
    """Get performance metrics for user's children"""
    try:
        service = AnalyticsService()
        return await service.get_performance_metrics(current_user.user_id, child_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to get performance metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve performance metrics"
        )

@router.get("/achievements")
async def get_child_achievements(
    child_id: str = Query(..., description="Child ID"),
    current_user: AuthUser = Depends(get_current_parent)
):
    """Get achievements for a specific child"""
    try:
        service = AnalyticsService()
        return await service.get_child_achievements(child_id, current_user.user_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to get child achievements: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve achievements"
        )

@router.get("/leaderboard")
async def get_leaderboard(
    child_id: Optional[str] = Query(None, description="Specific child ID (optional)"),
    current_user: AuthUser = Depends(get_current_parent)
):
    """Get leaderboard data for user's children"""
    try:
        service = AnalyticsService()
        return await service.get_leaderboard(current_user.user_id, child_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to get leaderboard: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve leaderboard"
        ) 