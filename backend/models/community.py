"""
Pydantic models for community features
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from .base import BaseResponse, PostType, UUIDField, TimestampField, MediaItem


# Post models
class PostBase(BaseModel):
    """Base post model"""
    type: PostType
    content: str
    media: List[MediaItem] = []
    anonymous: bool = False
    class_id: Optional[UUIDField] = None


class PostCreate(PostBase):
    """Post creation model"""
    pass


class PostUpdate(BaseModel):
    """Post update model"""
    content: Optional[str] = None
    media: Optional[List[MediaItem]] = None


class Post(PostBase, BaseResponse):
    """Post response model"""
    id: UUIDField
    author_user_id: UUIDField
    created_at: TimestampField
    
    # Computed fields
    likes_count: int = 0
    comments_count: int = 0
    user_has_liked: bool = False


class PostWithAuthor(Post):
    """Post with author information"""
    author_name: Optional[str] = None
    author_school: Optional[str] = None
    author_grade: Optional[str] = None


# Comment models
class CommentBase(BaseModel):
    """Base comment model"""
    post_id: UUIDField
    content: str


class CommentCreate(CommentBase):
    """Comment creation model"""
    pass


class CommentUpdate(BaseModel):
    """Comment update model"""
    content: str


class Comment(CommentBase, BaseResponse):
    """Comment response model"""
    id: UUIDField
    author_user_id: UUIDField
    created_at: TimestampField


class CommentWithAuthor(Comment):
    """Comment with author information"""
    author_name: Optional[str] = None


# Reaction models
class ReactionCreate(BaseModel):
    """Reaction creation model"""
    post_id: UUIDField
    type: str = "like"


class Reaction(BaseResponse):
    """Reaction response model"""
    id: UUIDField
    post_id: UUIDField
    user_id: UUIDField
    type: str


# Report models
class ReportCreate(BaseModel):
    """Report creation model"""
    target_type: str  # 'post' or 'comment'
    target_id: UUIDField
    reason: str


class Report(BaseResponse):
    """Report response model"""
    id: UUIDField
    target_type: str
    target_id: UUIDField
    reporter_id: UUIDField
    reason: str
    status: str
    created_at: TimestampField


# Chat models
class ThreadBase(BaseModel):
    """Base thread model"""
    type: str = "direct"  # 'direct' or 'class'
    class_id: Optional[UUIDField] = None


class ThreadCreate(ThreadBase):
    """Thread creation model"""
    participant_ids: List[UUIDField]


class Thread(ThreadBase, BaseResponse):
    """Thread response model"""
    id: UUIDField
    created_by: UUIDField
    created_at: TimestampField
    
    # Computed fields
    unread_count: int = 0
    last_message: Optional['Message'] = None


class ThreadParticipant(BaseResponse):
    """Thread participant model"""
    thread_id: UUIDField
    user_id: UUIDField
    last_read_at: Optional[TimestampField] = None


class MessageBase(BaseModel):
    """Base message model"""
    thread_id: UUIDField
    body: str
    media: List[MediaItem] = []


class MessageCreate(MessageBase):
    """Message creation model"""
    pass


class Message(MessageBase, BaseResponse):
    """Message response model"""
    id: UUIDField
    author_id: UUIDField
    created_at: TimestampField


class MessageWithAuthor(Message):
    """Message with author information"""
    author_name: Optional[str] = None


# Expert models
class ExpertProfile(BaseResponse):
    """Expert parent profile"""
    user_id: UUIDField
    full_name: str
    school: str
    grade: str
    helpful_answers_count: int
    expertise_areas: List[str] = []
    is_online: bool = False
    last_seen: Optional[TimestampField] = None


# Feed models
class FeedRequest(BaseModel):
    """Feed request parameters"""
    class_id: Optional[UUIDField] = None
    type: Optional[PostType] = None
    limit: int = Field(default=20, ge=1, le=50)
    cursor: Optional[str] = None


class FeedResponse(BaseResponse):
    """Feed response model"""
    posts: List[PostWithAuthor]
    next_cursor: Optional[str] = None
    has_more: bool = False 