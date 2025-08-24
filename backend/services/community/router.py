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
    Thread, ThreadCreate, Message, MessageCreate, MessageWithAuthor,
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


@router.get("/posts/{post_id}", response_model=PostWithAuthor)
async def get_post_by_id(
    post_id: str,
    current_user: AuthUser = Depends(get_current_user)
):
    """Get a single post by ID"""
    try:
        service = CommunityService()
        post = await service.get_post_by_id(post_id, current_user.user_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        return post
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get post by ID: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve post"
        )


@router.get("/posts/{post_id}/comments", response_model=List[CommentWithAuthor])
async def get_post_comments(
    post_id: str,
    current_user: AuthUser = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=100)
):
    """Get comments for a specific post"""
    try:
        service = CommunityService()
        return await service.get_post_comments(post_id, limit)
    except Exception as e:
        logger.error(f"Failed to get post comments: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve comments"
        )


@router.post("/threads", response_model=Thread)
async def create_thread(
    thread_data: ThreadCreate,
    current_user: AuthUser = Depends(get_current_user)
):
    """Create a new chat thread"""
    try:
        service = CommunityService()
        return await service.create_thread(current_user.user_id, thread_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to create thread: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create thread"
        )


@router.post("/messages", response_model=MessageWithAuthor)
async def send_message(
    message_data: MessageCreate,
    current_user: AuthUser = Depends(get_current_user)
):
    """Send a message in a chat thread"""
    try:
        service = CommunityService()
        return await service.send_message(current_user.user_id, message_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to send message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send message"
        )


@router.get("/threads/{thread_id}/messages", response_model=List[MessageWithAuthor])
async def get_thread_messages(
    thread_id: str,
    current_user: AuthUser = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100)
):
    """Get messages from a chat thread"""
    try:
        service = CommunityService()
        return await service.get_thread_messages(thread_id, current_user.user_id, limit)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to get thread messages: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve messages"
        )


@router.get("/forums/{category}", response_model=List[PostWithAuthor])
async def get_forums_by_category(
    category: str,
    current_user: AuthUser = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=50)
):
    """Get forum posts by category"""
    try:
        service = CommunityService()
        return await service.get_forums_by_category(category, current_user.user_id, limit)
    except Exception as e:
        logger.error(f"Failed to get forums by category: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve forum posts"
        )


@router.get("/categories")
async def get_categories(
    current_user: AuthUser = Depends(get_current_user)
):
    """Get available forum categories"""
    try:
        service = CommunityService()
        categories = await service.get_categories()
        return {"categories": categories}
    except Exception as e:
        logger.error(f"Failed to get categories: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve categories"
        ) 