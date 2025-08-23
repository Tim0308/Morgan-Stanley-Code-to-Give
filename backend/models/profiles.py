"""
Pydantic models for profiles, children, and classes
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from .base import BaseResponse, Role, UUIDField, TimestampField


# Profile models
class ProfileBase(BaseModel):
    """Base profile model"""
    full_name: Optional[str] = None
    locale: str = "en"
    school: Optional[str] = None
    grade: Optional[str] = None


class ProfileCreate(ProfileBase):
    """Profile creation model"""
    role: Role = Role.PARENT


class ProfileUpdate(ProfileBase):
    """Profile update model"""
    pass


class Profile(ProfileBase, BaseResponse):
    """Profile response model"""
    user_id: UUIDField
    role: Role
    created_at: TimestampField


# Child models
class ChildBase(BaseModel):
    """Base child model"""
    nickname: Optional[str] = None
    age_band: Optional[str] = None  # K1, K2, K3


class ChildCreate(ChildBase):
    """Child creation model"""
    pass


class ChildUpdate(ChildBase):
    """Child update model"""
    pass


class Child(ChildBase, BaseResponse):
    """Child response model"""
    id: UUIDField
    parent_user_id: UUIDField
    created_at: TimestampField


# Class models
class ClassBase(BaseModel):
    """Base class model"""
    school: str
    name: str
    grade: str


class ClassCreate(ClassBase):
    """Class creation model"""
    pass


class Class(ClassBase, BaseResponse):
    """Class response model"""
    id: UUIDField
    created_at: TimestampField


class Enrollment(BaseResponse):
    """Enrollment model"""
    child_id: UUIDField
    class_id: UUIDField


# Combined response models
class ProfileWithChildren(Profile):
    """Profile with associated children"""
    children: List[Child] = []


class ChildWithClass(Child):
    """Child with class information"""
    class_info: Optional[Class] = None


class MeResponse(BaseResponse):
    """Current user profile response"""
    profile: Profile
    children: List[ChildWithClass] = []
    classes: List[Class] = [] 