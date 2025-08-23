"""
Base Pydantic models and common types for Project Reach API
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid


# Enums matching database types
class Role(str, Enum):
    PARENT = "parent"
    TEACHER = "teacher"
    ADMIN = "admin"


class TaskType(str, Enum):
    IN_APP = "in_app"
    PEN_PAPER = "pen_paper"
    GAME = "game"
    AUDIO = "audio"


class PostType(str, Enum):
    ACHIEVEMENT = "achievement"
    QUESTION = "question"


class ReasonType(str, Enum):
    ACTIVITY_COMPLETE = "activity_complete"
    WEEKLY_GOAL = "weekly_goal"
    HELPFUL_ANSWER = "helpful_answer"
    POST_LIKE = "post_like"
    ENGAGEMENT_BONUS = "engagement_bonus"
    PURCHASE = "purchase"
    GIFT = "gift"


class RedemptionStatus(str, Enum):
    REQUESTED = "requested"
    APPROVED = "approved"
    FULFILLED = "fulfilled"
    CANCELED = "canceled"


class ActivityStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


# Base response models
class BaseResponse(BaseModel):
    """Base API response model"""
    model_config = ConfigDict(from_attributes=True)


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None


class SuccessResponse(BaseModel):
    """Success response model"""
    message: str
    data: Optional[Dict[str, Any]] = None


# Common field types (use standard types for Pydantic compatibility)
UUIDField = str
TimestampField = datetime


# Pagination models
class PaginationParams(BaseModel):
    """Pagination parameters"""
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)
    cursor: Optional[str] = None


class PaginatedResponse(BaseModel):
    """Paginated response model"""
    data: List[Any]
    total: Optional[int] = None
    next_cursor: Optional[str] = None
    has_more: bool = False


# File upload models
class MediaItem(BaseModel):
    """Media item model"""
    url: str
    type: str  # image, video, audio, document
    filename: Optional[str] = None
    size: Optional[int] = None


class FileUploadResponse(BaseModel):
    """File upload response"""
    url: str
    filename: str
    size: int
    content_type: str 