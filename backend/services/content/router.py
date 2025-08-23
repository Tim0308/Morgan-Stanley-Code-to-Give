"""
Content microservice router
Handles booklets, modules, activities, and progress tracking
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from typing import List, Optional
import logging

from core.auth import get_current_user, get_current_parent, AuthUser
from models.content import (
    Booklet, BookletWithModules, Activity, ActivityProgress,
    ProgressUpdateRequest, BulkProgressRequest, WeeklyProgress,
    BookletProgress
)
from .service import ContentService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/booklets", response_model=List[BookletWithModules])
async def get_booklets(
    week: Optional[str] = Query(None, description="Week in YYYY-WW format"),
    child_id: Optional[str] = Query(None, description="Child ID for progress"),
    current_user: AuthUser = Depends(get_current_user)
):
    """Get booklets with modules and progress"""
    try:
        service = ContentService()
        return await service.get_booklets_with_progress(week, child_id, current_user.user_id)
    except Exception as e:
        logger.error(f"Failed to get booklets: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve booklets"
        )


@router.get("/booklets/{booklet_id}", response_model=BookletWithModules)
async def get_booklet_detail(
    booklet_id: str,
    child_id: Optional[str] = Query(None, description="Child ID for progress"),
    current_user: AuthUser = Depends(get_current_user)
):
    """Get detailed booklet with modules and activities"""
    try:
        service = ContentService()
        return await service.get_booklet_detail(booklet_id, child_id, current_user.user_id)
    except Exception as e:
        logger.error(f"Failed to get booklet detail: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve booklet details"
        )


@router.get("/activities/{activity_id}", response_model=Activity)
async def get_activity_detail(
    activity_id: str,
    current_user: AuthUser = Depends(get_current_user)
):
    """Get activity details"""
    try:
        service = ContentService()
        return await service.get_activity_detail(activity_id)
    except Exception as e:
        logger.error(f"Failed to get activity detail: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve activity details"
        )


@router.post("/progress", response_model=ActivityProgress)
async def update_progress(
    progress_data: ProgressUpdateRequest,
    current_user: AuthUser = Depends(get_current_parent)
):
    """Update activity progress for a child"""
    try:
        service = ContentService()
        return await service.update_activity_progress(progress_data, current_user.user_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to update progress: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update progress"
        )


@router.post("/progress/bulk")
async def update_bulk_progress(
    bulk_data: BulkProgressRequest,
    current_user: AuthUser = Depends(get_current_parent)
):
    """Update multiple activity progress entries"""
    try:
        service = ContentService()
        results = await service.update_bulk_progress(bulk_data.updates, current_user.user_id)
        return {"message": f"Updated {len(results)} activities", "results": results}
    except Exception as e:
        logger.error(f"Failed to update bulk progress: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update progress"
        )


@router.get("/progress/weekly", response_model=List[WeeklyProgress])
async def get_weekly_progress(
    child_id: str = Query(..., description="Child ID"),
    weeks: int = Query(default=4, ge=1, le=12, description="Number of weeks to retrieve"),
    current_user: AuthUser = Depends(get_current_parent)
):
    """Get weekly progress summary for a child"""
    try:
        service = ContentService()
        return await service.get_weekly_progress(child_id, weeks, current_user.user_id)
    except Exception as e:
        logger.error(f"Failed to get weekly progress: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve weekly progress"
        )


@router.get("/progress/booklets", response_model=List[BookletProgress])
async def get_booklet_progress(
    child_id: str = Query(..., description="Child ID"),
    current_user: AuthUser = Depends(get_current_parent)
):
    """Get progress summary for all booklets"""
    try:
        service = ContentService()
        return await service.get_booklet_progress_summary(child_id, current_user.user_id)
    except Exception as e:
        logger.error(f"Failed to get booklet progress: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve booklet progress"
        )


@router.post("/upload-proof")
async def upload_proof_image(
    file: UploadFile = File(...),
    activity_id: str = Form(...),
    child_id: str = Form(...),
    current_user: AuthUser = Depends(get_current_user)
):
    """Upload proof image for pen & paper activities"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only image files are allowed"
            )
        
        # Validate file size (max 10MB)
        if file.size and file.size > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size too large (max 10MB)"
            )
        
        service = ContentService()
        
        # Upload image and get URL
        proof_url = await service.upload_proof_image(file, current_user.user_id)
        
        # Just save the proof URL without changing status to completed
        await service.save_proof_url(
            activity_id=activity_id,
            child_id=child_id,
            proof_url=proof_url,
            user_id=current_user.user_id
        )
        
        return {"proof_url": proof_url, "message": "Proof uploaded successfully"}
        
    except Exception as e:
        logger.error(f"Failed to upload proof image: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload proof image"
        )