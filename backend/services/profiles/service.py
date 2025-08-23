"""
Profiles service implementation
Business logic for user profiles, children, and class management
"""

from typing import List, Optional
import uuid
import logging
from datetime import datetime

from core.database import get_supabase_client
from models.profiles import (
    Profile, ProfileCreate, ProfileUpdate,
    Child, ChildCreate, ChildUpdate,
    Class, MeResponse, ChildWithClass
)

logger = logging.getLogger(__name__)


class ProfileService:
    """Service for profile and children management"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
    
    async def get_user_profile_with_children(self, user_id: str) -> MeResponse:
        """Get user profile with associated children and classes"""
        try:
            # Get profile
            profile_result = self.supabase.table("profiles").select("*").eq("user_id", user_id).execute()
            
            if not profile_result.data:
                # Create default profile if not exists
                profile_data = {
                    "user_id": user_id,
                    "role": "parent",
                    "locale": "en"
                }
                create_result = self.supabase.table("profiles").insert(profile_data).execute()
                profile = Profile(**create_result.data[0])
            else:
                profile = Profile(**profile_result.data[0])
            
            # Get children with class information
            children = await self.get_children_with_classes(user_id)
            
            # Get classes (for teachers)
            classes = []
            if profile.role == "teacher":
                classes_result = self.supabase.table("classes").select("*").execute()
                classes = [Class(**cls) for cls in classes_result.data]
            
            return MeResponse(
                profile=profile,
                children=children,
                classes=classes
            )
            
        except Exception as e:
            logger.error(f"Failed to get user profile: {e}")
            raise
    
    async def update_profile(self, user_id: str, profile_update: ProfileUpdate) -> Profile:
        """Update user profile"""
        try:
            update_data = profile_update.model_dump(exclude_unset=True)
            
            result = self.supabase.table("profiles").update(update_data).eq("user_id", user_id).execute()
            
            if not result.data:
                raise ValueError("Profile not found")
            
            return Profile(**result.data[0])
            
        except Exception as e:
            logger.error(f"Failed to update profile: {e}")
            raise
    
    async def get_children_with_classes(self, parent_user_id: str) -> List[ChildWithClass]:
        """Get children with their class information"""
        try:
            # Get children
            children_result = self.supabase.table("children").select("*").eq("parent_user_id", parent_user_id).execute()
            
            children_with_classes = []
            
            for child_data in children_result.data:
                child = Child(**child_data)
                
                # Get class information for this child
                enrollment_result = self.supabase.table("enrollments").select("""
                    class_id,
                    classes (
                        id,
                        school,
                        name,
                        grade,
                        created_at
                    )
                """).eq("child_id", child.id).execute()
                
                class_info = None
                if enrollment_result.data and enrollment_result.data[0].get("classes"):
                    class_data = enrollment_result.data[0]["classes"]
                    class_info = Class(**class_data)
                
                children_with_classes.append(ChildWithClass(
                    **child.model_dump(),
                    class_info=class_info
                ))
            
            return children_with_classes
            
        except Exception as e:
            logger.error(f"Failed to get children with classes: {e}")
            raise
    
    async def create_child(self, parent_user_id: str, child_data: ChildCreate) -> Child:
        """Create a new child profile"""
        try:
            child_dict = child_data.model_dump()
            child_dict["parent_user_id"] = parent_user_id
            child_dict["id"] = str(uuid.uuid4())
            
            result = self.supabase.table("children").insert(child_dict).execute()
            
            if not result.data:
                raise ValueError("Failed to create child")
            
            # Create token account for the child
            token_account_data = {
                "child_id": child_dict["id"],
                "balance": 0,
                "weekly_earned": 0
            }
            self.supabase.table("token_accounts").insert(token_account_data).execute()
            
            return Child(**result.data[0])
            
        except Exception as e:
            logger.error(f"Failed to create child: {e}")
            raise
    
    async def update_child(self, parent_user_id: str, child_id: str, child_update: ChildUpdate) -> Child:
        """Update child profile"""
        try:
            # Verify parent owns this child
            child_result = self.supabase.table("children").select("*").eq("id", child_id).eq("parent_user_id", parent_user_id).execute()
            
            if not child_result.data:
                raise ValueError("Child not found or access denied")
            
            update_data = child_update.model_dump(exclude_unset=True)
            
            result = self.supabase.table("children").update(update_data).eq("id", child_id).execute()
            
            return Child(**result.data[0])
            
        except Exception as e:
            logger.error(f"Failed to update child: {e}")
            raise
    
    async def enroll_child_in_class(self, parent_user_id: str, child_id: str, class_code: str):
        """Enroll child in a class using class code"""
        try:
            # Verify parent owns this child
            child_result = self.supabase.table("children").select("*").eq("id", child_id).eq("parent_user_id", parent_user_id).execute()
            
            if not child_result.data:
                raise ValueError("Child not found or access denied")
            
            # Find class by code (assuming class name is used as code for now)
            class_result = self.supabase.table("classes").select("*").eq("name", class_code).execute()
            
            if not class_result.data:
                raise ValueError("Class not found")
            
            class_id = class_result.data[0]["id"]
            
            # Check if already enrolled
            existing_enrollment = self.supabase.table("enrollments").select("*").eq("child_id", child_id).eq("class_id", class_id).execute()
            
            if existing_enrollment.data:
                raise ValueError("Child is already enrolled in this class")
            
            # Create enrollment
            enrollment_data = {
                "child_id": child_id,
                "class_id": class_id
            }
            
            self.supabase.table("enrollments").insert(enrollment_data).execute()
            
        except Exception as e:
            logger.error(f"Failed to enroll child in class: {e}")
            raise
    
    async def get_available_classes(self) -> List[Class]:
        """Get all available classes"""
        try:
            result = self.supabase.table("classes").select("*").execute()
            return [Class(**cls) for cls in result.data]
            
        except Exception as e:
            logger.error(f"Failed to get classes: {e}")
            raise 