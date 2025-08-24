"""
User bundle router - provides all user data in one call
"""

from fastapi import APIRouter, Depends, HTTPException, status
import logging

from core.auth import get_current_user, AuthUser
from services.profiles.service import ProfileService
from services.content.service import ContentService
from services.tokens.service import TokensService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/bundle")
async def get_user_bundle(
    current_user: AuthUser = Depends(get_current_user)
):
    """
    Get all user data needed for Home, Learn, and Token pages in one call
    """
    try:
        logger.info(f"Fetching user bundle for user: {current_user.user_id}")
        
        # Initialize services
        profile_service = ProfileService()
        content_service = ContentService()
        token_service = TokensService()
        
        # Get user profile and children
        logger.info("Fetching user profile...")
        user_data = await profile_service.get_user_profile_with_children(current_user.user_id)
        
        bundle_data = {
            "profile": user_data.profile.dict() if hasattr(user_data.profile, 'dict') else user_data.profile.__dict__,
            "children": [child.dict() if hasattr(child, 'dict') else child.__dict__ for child in user_data.children],
            "booklets": [],
            "token_accounts": [],
            "recent_activity": []
        }
        
        # If user has children, get their learning data and token accounts
        if user_data.children:
            for child in user_data.children:
                child_id = child.id if hasattr(child, 'id') else child["id"]
                logger.info(f"Fetching data for child: {child_id}")
                
                try:
                    # Get booklets with progress for this child
                    child_booklets = await content_service.get_booklets_with_progress(
                        week=None, 
                        child_id=child_id, 
                        user_id=current_user.user_id
                    )
                    
                    # Add child_id to booklets for frontend reference
                    for booklet in child_booklets:
                        booklet_dict = booklet.dict() if hasattr(booklet, 'dict') else booklet
                        booklet_dict["child_id"] = child_id
                        bundle_data["booklets"].append(booklet_dict)
                    
                    # Get token account for this child
                    try:
                        token_balance = await token_service.get_token_balance(child_id, current_user.user_id)
                        if token_balance:
                            token_dict = token_balance.dict() if hasattr(token_balance, 'dict') else token_balance
                            bundle_data["token_accounts"].append(token_dict)
                    except Exception as token_error:
                        logger.warning(f"Could not fetch tokens for child {child_id}: {token_error}")
                        # Continue without tokens - not critical
                    
                except Exception as child_error:
                    logger.error(f"Error fetching data for child {child_id}: {child_error}")
                    # Continue with other children
                    continue
        
        logger.info(f"Successfully fetched bundle data with {len(bundle_data['booklets'])} booklets and {len(bundle_data['token_accounts'])} token accounts")
        
        return {
            "success": True,
            "data": bundle_data,
            "cache_timestamp": None  # Frontend can set this
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch user bundle: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user data bundle"
        )


@router.get("/test-bundle/{user_id}")
async def test_bundle(user_id: str):
    """Test bundle endpoint with specific user ID"""
    try:
        profile_service = ProfileService()
        content_service = ContentService()
        token_service = TokensService()
        
        logger.info(f"Testing bundle for user: {user_id}")
        
        # Get user profile and children
        logger.info("Fetching user profile...")
        user_data = await profile_service.get_user_profile_with_children(user_id)
        
        bundle_data = {
            "profile": user_data.profile.dict() if hasattr(user_data.profile, 'dict') else user_data.profile.__dict__,
            "children": [child.dict() if hasattr(child, 'dict') else child.__dict__ for child in user_data.children],
            "booklets": [],
            "token_accounts": [],
            "recent_activity": []
        }
        
        # If user has children, get their learning data and token accounts
        if user_data.children:
            for child in user_data.children:
                child_id = child.id if hasattr(child, 'id') else child["id"]
                logger.info(f"Fetching data for child: {child_id}")
                
                try:
                    # Get child's booklets
                    child_booklets = await content_service.get_child_booklets(
                        child_id=child_id, 
                        user_id=user_id
                    )
                    
                    # Add child_id to booklets for frontend reference
                    for booklet in child_booklets:
                        booklet_dict = booklet.dict() if hasattr(booklet, 'dict') else booklet
                        booklet_dict["child_id"] = child_id
                        bundle_data["booklets"].append(booklet_dict)
                    
                    # Get token account for this child
                    try:
                        token_balance = await token_service.get_token_balance(child_id, user_id)
                        if token_balance:
                            token_dict = token_balance.dict() if hasattr(token_balance, 'dict') else token_balance
                            bundle_data["token_accounts"].append(token_dict)
                    except Exception as token_error:
                        logger.warning(f"Could not fetch tokens for child {child_id}: {token_error}")
                        # Continue without tokens - not critical
                    
                except Exception as child_error:
                    logger.error(f"Error fetching data for child {child_id}: {child_error}")
                    # Continue with other children
                    continue
        
        logger.info(f"Successfully fetched bundle data with {len(bundle_data['booklets'])} booklets and {len(bundle_data['token_accounts'])} token accounts")
        
        return {
            "success": True,
            "data": bundle_data,
            "cache_timestamp": None  # Frontend can set this
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch user bundle: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch user data bundle")
