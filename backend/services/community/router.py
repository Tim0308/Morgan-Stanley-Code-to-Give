"""
Community microservice router
Handles posts, comments, reactions, chats, and expert directory
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import logging

from core.auth import get_current_user, AuthUser
from models.community import (
    Post, PostCreate, Comment, CommentCreate, 
    ReactionCreate, FeedResponse, ExpertProfile
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/feed")
async def get_community_feed(current_user: AuthUser = Depends(get_current_user)):
    """Get community achievement and question feed"""
    return {"message": "Community feed endpoint - to be implemented"}


@router.post("/posts")
async def create_post(
    post_data: PostCreate,
    current_user: AuthUser = Depends(get_current_user)
):
    """Create a new community post"""
    return {"message": "Create post endpoint - to be implemented"}


@router.get("/experts")
async def get_expert_parents(current_user: AuthUser = Depends(get_current_user)):
    """Get expert parent directory"""
    return {"message": "Expert parents endpoint - to be implemented"} 