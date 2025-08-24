"""
Pydantic models for educational content and progress tracking
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from .base import BaseResponse, TaskType, ActivityStatus, UUIDField, TimestampField, MediaItem


# Booklet models
class BookletBase(BaseModel):
    """Base booklet model"""
    title: str
    subtitle: Optional[str] = None
    week_start: Optional[date] = None
    week_end: Optional[date] = None
    locale: str = "en"
    total_modules: Optional[int] = None
    subject: Optional[str] = None


class Booklet(BookletBase, BaseResponse):
    """Booklet response model"""
    id: UUIDField


# Module models
class ModuleBase(BaseModel):
    """Base module model"""
    booklet_id: UUIDField
    idx: int
    title: Optional[str] = None
    description: Optional[str] = None


class Module(ModuleBase, BaseResponse):
    """Module response model"""
    id: UUIDField


# Activity models
class ActivityBase(BaseModel):
    """Base activity model"""
    module_id: UUIDField
    type: TaskType
    title: Optional[str] = None  # Display title for the activity
    points: int = 5
    est_minutes: int = 10
    instructions: Optional[str] = None
    media: List[MediaItem] = []


class Activity(ActivityBase, BaseResponse):
    """Activity response model"""
    id: UUIDField


class ActivityWithProgress(Activity):
    """Activity with progress information"""
    progress: Optional['ActivityProgress'] = None


# Progress models
class ActivityProgressBase(BaseModel):
    """Base activity progress model"""
    child_id: UUIDField
    activity_id: UUIDField
    status: ActivityStatus = ActivityStatus.NOT_STARTED
    proof_url: Optional[str] = None
    score: Optional[float] = None
    notes: Optional[str] = None


class ActivityProgressCreate(ActivityProgressBase):
    """Activity progress creation model"""
    pass


class ActivityProgressUpdate(BaseModel):
    """Activity progress update model"""
    status: Optional[ActivityStatus] = None
    proof_url: Optional[str] = None
    score: Optional[float] = None
    notes: Optional[str] = None


class ActivityProgress(ActivityProgressBase, BaseResponse):
    """Activity progress response model"""
    id: UUIDField
    completed_at: Optional[TimestampField] = None


# Combined models
class ModuleWithActivities(Module):
    """Module with activities and progress"""
    activities: List[ActivityWithProgress] = []


class BookletWithModules(Booklet):
    """Booklet with modules and progress summary"""
    modules: List[ModuleWithActivities] = []
    progress_summary: Optional[Dict[str, Any]] = None


# Weekly progress models
class WeeklyProgress(BaseModel):
    """Weekly progress summary"""
    week: str  # Week identifier like "2025-W02"
    total_activities: int
    completed_activities: int
    completion_percentage: float


class BookletProgress(BaseModel):
    """Booklet progress summary"""
    booklet_id: str
    booklet_name: str
    total_modules: int
    completed_modules: int
    current_module: int
    progress_percentage: float
    estimated_completion_time: str


# Request models
class ProgressUpdateRequest(BaseModel):
    """Request to update activity progress"""
    child_id: UUIDField
    activity_id: UUIDField
    status: ActivityStatus
    proof_url: Optional[str] = None
    score: Optional[float] = None
    notes: Optional[str] = None


class BulkProgressRequest(BaseModel):
    """Request to update multiple activities"""
    updates: List[ProgressUpdateRequest]