"""
Community microservice router
Handles posts, comments, reactions, chats, and expert directory
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Dict, Any
import logging

from core.auth import get_current_user, AuthUser
from models.community import (
    Post, PostCreate, PostWithAuthor,
    Comment, CommentCreate, CommentWithAuthor,
    ReactionCreate, ExpertProfile, FeedResponse,
    Report, ReportCreate
)
from models.base import PostType
from .service import CommunityService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/feed", response_model=FeedResponse)
async def get_community_feed(
    current_user: AuthUser = Depends(get_current_user),
    class_id: Optional[str] = Query(None),
    type: Optional[PostType] = Query(None),
    limit: int = Query(20, ge=1, le=50),
    cursor: Optional[str] = Query(None)
):
    """Get community achievement and question feed"""
    try:
        service = CommunityService()
        return await service.get_community_feed(
            user_id=current_user.user_id,
            class_id=class_id,
            post_type=type,
            limit=limit,
            cursor=cursor
        )
    except Exception as e:
        logger.error(f"Failed to get community feed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve community feed"
        )


@router.post("/posts", response_model=PostWithAuthor)
async def create_post(
    post_data: PostCreate,
    current_user: AuthUser = Depends(get_current_user)
):
    """Create a new community post"""
    try:
        service = CommunityService()
        return await service.create_post(current_user.user_id, post_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to create post: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create post"
        )


@router.post("/comments", response_model=CommentWithAuthor)
async def create_comment(
    comment_data: CommentCreate,
    current_user: AuthUser = Depends(get_current_user)
):
    """Create a comment on a post"""
    try:
        service = CommunityService()
        return await service.create_comment(current_user.user_id, comment_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to create comment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create comment"
        )


@router.post("/reactions")
async def toggle_like(
    reaction_data: ReactionCreate,
    current_user: AuthUser = Depends(get_current_user)
):
    """Toggle like on a post"""
    try:
        service = CommunityService()
        result = await service.toggle_like(current_user.user_id, reaction_data)
        return {"message": "Reaction updated successfully", "data": result}
    except Exception as e:
        logger.error(f"Failed to toggle like: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update reaction"
        )


@router.get("/experts", response_model=List[ExpertProfile])
async def get_expert_parents(
    current_user: AuthUser = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=50)
):
    """Get expert parent directory"""
    try:
        service = CommunityService()
        return await service.get_expert_parents(limit=limit)
    except Exception as e:
        logger.error(f"Failed to get expert parents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve expert parents"
        )


@router.get("/threads")
async def get_chat_threads(
    current_user: AuthUser = Depends(get_current_user)
):
    """Get chat threads for current user"""
    try:
        service = CommunityService()
        threads = await service.get_chat_threads(current_user.user_id)
        return {"threads": threads}
    except Exception as e:
        logger.error(f"Failed to get chat threads: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve chat threads"
        )


@router.post("/reports", response_model=Report)
async def create_report(
    report_data: ReportCreate,
    current_user: AuthUser = Depends(get_current_user)
):
    """Report inappropriate content"""
    try:
        service = CommunityService()
        return await service.create_report(current_user.user_id, report_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to create report: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create report"
        ) 