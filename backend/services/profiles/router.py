"""
Profiles microservice router
Handles user profiles, children management, and class enrollments
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import logging

from core.auth import get_current_user, get_current_parent, AuthUser
from core.database import get_supabase_client
from models.profiles import (
    Profile, ProfileCreate, ProfileUpdate, 
    Child, ChildCreate, ChildUpdate,
    Class, MeResponse, ChildWithClass
)
from .service import ProfileService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/me", response_model=MeResponse)
async def get_current_profile(current_user: AuthUser = Depends(get_current_user)):
    """Get current user profile with children and class information"""
    try:
        service = ProfileService()
        return await service.get_user_profile_with_children(current_user.user_id)
    except Exception as e:
        logger.error(f"Failed to get user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve profile"
        )


@router.put("/me", response_model=Profile)
async def update_current_profile(
    profile_update: ProfileUpdate,
    current_user: AuthUser = Depends(get_current_user)
):
    """Update current user profile"""
    try:
        service = ProfileService()
        return await service.update_profile(current_user.user_id, profile_update)
    except Exception as e:
        logger.error(f"Failed to update profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )


@router.get("/children", response_model=List[ChildWithClass])
async def get_children(current_user: AuthUser = Depends(get_current_parent)):
    """Get all children for current parent"""
    try:
        service = ProfileService()
        return await service.get_children_with_classes(current_user.user_id)
    except Exception as e:
        logger.error(f"Failed to get children: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve children"
        )


@router.post("/children", response_model=Child)
async def create_child(
    child_data: ChildCreate,
    current_user: AuthUser = Depends(get_current_parent)
):
    """Create a new child profile"""
    try:
        service = ProfileService()
        return await service.create_child(current_user.user_id, child_data)
    except Exception as e:
        logger.error(f"Failed to create child: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create child profile"
        )


@router.put("/children/{child_id}", response_model=Child)
async def update_child(
    child_id: str,
    child_update: ChildUpdate,
    current_user: AuthUser = Depends(get_current_parent)
):
    """Update child profile"""
    try:
        service = ProfileService()
        return await service.update_child(current_user.user_id, child_id, child_update)
    except Exception as e:
        logger.error(f"Failed to update child: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update child profile"
        )


@router.post("/children/{child_id}/enroll")
async def enroll_child_in_class(
    child_id: str,
    class_code: str,
    current_user: AuthUser = Depends(get_current_parent)
):
    """Enroll child in a class using class code"""
    try:
        service = ProfileService()
        await service.enroll_child_in_class(current_user.user_id, child_id, class_code)
        return {"message": "Child enrolled successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to enroll child: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to enroll child in class"
        )


@router.get("/classes", response_model=List[Class])
async def get_classes(current_user: AuthUser = Depends(get_current_user)):
    """Get available classes (for enrollment)"""
    try:
        service = ProfileService()
        return await service.get_available_classes()
    except Exception as e:
        logger.error(f"Failed to get classes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve classes"
        ) 