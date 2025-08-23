"""
Community service implementation
Business logic for posts, comments, reactions, chats, and expert directory
"""

from typing import List, Optional, Dict, Any
import uuid
import logging
from datetime import datetime

from core.database import get_supabase_client
from models.community import (
    Post, PostCreate, PostUpdate, PostWithAuthor,
    Comment, CommentCreate, CommentWithAuthor,
    ReactionCreate, Reaction,
    Thread, ThreadCreate, Message, MessageCreate, MessageWithAuthor,
    ExpertProfile, FeedResponse, Report, ReportCreate
)
from models.base import PostType

logger = logging.getLogger(__name__)


class CommunityService:
    """Service for community features"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
    
    async def get_community_feed(
        self, 
        user_id: str,
        class_id: Optional[str] = None,
        post_type: Optional[PostType] = None,
        limit: int = 20,
        cursor: Optional[str] = None
    ) -> FeedResponse:
        """Get community posts feed with pagination"""
        try:
            # Build query - get posts without profiles first
            query = self.supabase.table("posts").select("""
                id,
                type,
                content,
                media,
                anonymous,
                created_at,
                author_user_id,
                class_id
            """)
            
            # Apply filters
            if class_id:
                # Get user's class info to filter posts
                user_classes_result = self.supabase.table("enrollments").select("""
                    class_id,
                    children!inner(parent_user_id)
                """).eq("children.parent_user_id", user_id).execute()
                
                if user_classes_result.data:
                    user_class_ids = [enrollment["class_id"] for enrollment in user_classes_result.data]
                    query = query.in_("class_id", user_class_ids + [None])  # Include public posts
            
            if post_type:
                query = query.eq("type", post_type.value)
            
            # Apply cursor-based pagination
            if cursor:
                query = query.lt("created_at", cursor)
            
            # Order by creation time (newest first) and limit
            query = query.order("created_at", desc=True).limit(limit + 1)  # +1 to check for more
            
            result = query.execute()
            posts_data = result.data
            
            # Process results for pagination
            has_more = len(posts_data) > limit
            if has_more:
                posts_data = posts_data[:-1]  # Remove extra item
            
            next_cursor = None
            if has_more and posts_data:
                next_cursor = posts_data[-1]["created_at"]
            
            # Process posts
            posts_with_authors = []
            
            # Get all unique author IDs to fetch profiles in batch
            author_ids = list(set(post["author_user_id"] for post in posts_data))
            profiles_dict = {}
            
            if author_ids:
                profiles_result = self.supabase.table("profiles").select(
                    "user_id, full_name, school, grade"
                ).in_("user_id", author_ids).execute()
                
                profiles_dict = {
                    profile["user_id"]: profile 
                    for profile in profiles_result.data
                }
            
            for post_data in posts_data:
                # Get engagement stats
                likes_result = self.supabase.table("reactions").select("id").eq("post_id", post_data["id"]).execute()
                comments_result = self.supabase.table("comments").select("id").eq("post_id", post_data["id"]).execute()
                user_like_result = self.supabase.table("reactions").select("id").eq("post_id", post_data["id"]).eq("user_id", user_id).execute()
                
                # Get author info from profiles dict
                author_info = profiles_dict.get(post_data["author_user_id"], {})
                
                post_with_author = PostWithAuthor(
                    id=post_data["id"],
                    type=post_data["type"],
                    content=post_data["content"],
                    media=post_data.get("media", []),
                    anonymous=post_data.get("anonymous", False),
                    class_id=post_data.get("class_id"),
                    author_user_id=post_data["author_user_id"],
                    created_at=post_data["created_at"],
                    likes_count=len(likes_result.data),
                    comments_count=len(comments_result.data),
                    user_has_liked=len(user_like_result.data) > 0,
                    author_name=author_info.get("full_name") if not post_data.get("anonymous") else None,
                    author_school=author_info.get("school") if not post_data.get("anonymous") else None,
                    author_grade=author_info.get("grade") if not post_data.get("anonymous") else None
                )
                
                posts_with_authors.append(post_with_author)
            
            return FeedResponse(
                posts=posts_with_authors,
                next_cursor=next_cursor,
                has_more=has_more
            )
            
        except Exception as e:
            logger.error(f"Failed to get community feed: {e}")
            raise
    
    async def create_post(self, user_id: str, post_data: PostCreate) -> PostWithAuthor:
        """Create a new community post"""
        try:
            # Get user's class if not specified
            class_id = post_data.class_id
            if not class_id:
                # Get user's first child's class as default
                child_result = self.supabase.table("children").select("id").eq("parent_user_id", user_id).limit(1).execute()
                if child_result.data:
                    child_id = child_result.data[0]["id"]
                    enrollment_result = self.supabase.table("enrollments").select("class_id").eq("child_id", child_id).limit(1).execute()
                    if enrollment_result.data:
                        class_id = enrollment_result.data[0]["class_id"]
            
            # Create post
            post_dict = post_data.model_dump()
            post_dict["id"] = str(uuid.uuid4())
            post_dict["author_user_id"] = user_id
            post_dict["class_id"] = class_id
            post_dict["created_at"] = datetime.utcnow()
            
            result = self.supabase.table("posts").insert(post_dict).execute()
            
            if not result.data:
                raise ValueError("Failed to create post")
            
            post = result.data[0]
            
            # Get author info
            author_result = self.supabase.table("profiles").select("full_name, school, grade").eq("user_id", user_id).execute()
            author_info = author_result.data[0] if author_result.data else {}
            
            return PostWithAuthor(
                id=post["id"],
                type=post["type"],
                content=post["content"],
                media=post.get("media", []),
                anonymous=post.get("anonymous", False),
                class_id=post.get("class_id"),
                author_user_id=post["author_user_id"],
                created_at=post["created_at"],
                likes_count=0,
                comments_count=0,
                user_has_liked=False,
                author_name=author_info.get("full_name") if not post.get("anonymous") else None,
                author_school=author_info.get("school") if not post.get("anonymous") else None,
                author_grade=author_info.get("grade") if not post.get("anonymous") else None
            )
            
        except Exception as e:
            logger.error(f"Failed to create post: {e}")
            raise
    
    async def create_comment(self, user_id: str, comment_data: CommentCreate) -> CommentWithAuthor:
        """Create a comment on a post"""
        try:
            comment_dict = comment_data.model_dump()
            comment_dict["id"] = str(uuid.uuid4())
            comment_dict["author_user_id"] = user_id
            comment_dict["created_at"] = datetime.utcnow()
            
            result = self.supabase.table("comments").insert(comment_dict).execute()
            
            if not result.data:
                raise ValueError("Failed to create comment")
            
            comment = result.data[0]
            
            # Get author info
            author_result = self.supabase.table("profiles").select("full_name").eq("user_id", user_id).execute()
            author_name = author_result.data[0]["full_name"] if author_result.data else None
            
            return CommentWithAuthor(
                id=comment["id"],
                post_id=comment["post_id"],
                content=comment["content"],
                author_user_id=comment["author_user_id"],
                created_at=comment["created_at"],
                author_name=author_name
            )
            
        except Exception as e:
            logger.error(f"Failed to create comment: {e}")
            raise
    
    async def toggle_like(self, user_id: str, reaction_data: ReactionCreate) -> Dict[str, Any]:
        """Toggle like on a post"""
        try:
            # Check if user already liked this post
            existing_like = self.supabase.table("reactions").select("id").eq("post_id", reaction_data.post_id).eq("user_id", user_id).execute()
            
            if existing_like.data:
                # Unlike - remove reaction
                self.supabase.table("reactions").delete().eq("id", existing_like.data[0]["id"]).execute()
                liked = False
            else:
                # Like - create reaction
                reaction_dict = reaction_data.model_dump()
                reaction_dict["id"] = str(uuid.uuid4())
                reaction_dict["user_id"] = user_id
                
                self.supabase.table("reactions").insert(reaction_dict).execute()
                liked = True
            
            # Get updated like count
            likes_result = self.supabase.table("reactions").select("id").eq("post_id", reaction_data.post_id).execute()
            likes_count = len(likes_result.data)
            
            return {
                "liked": liked,
                "likes_count": likes_count
            }
            
        except Exception as e:
            logger.error(f"Failed to toggle like: {e}")
            raise
    
    async def get_expert_parents(self, limit: int = 20) -> List[ExpertProfile]:
        """Get expert parents directory"""
        try:
            # Get parents with high helpful answer counts
            # This is a simplified version - in production you'd have more complex criteria
            result = self.supabase.table("profiles").select("""
                user_id,
                full_name,
                school,
                grade,
                created_at
            """).eq("role", "parent").limit(limit).execute()
            
            expert_profiles = []
            for profile_data in result.data:
                # For now, mock the expert data since we don't have the full expert system
                # In production, you'd calculate helpful_answers_count from actual data
                expert_profile = ExpertProfile(
                    user_id=profile_data["user_id"],
                    full_name=profile_data["full_name"] or "Anonymous Parent",
                    school=profile_data.get("school", ""),
                    grade=profile_data.get("grade", ""),
                    helpful_answers_count=5,  # Mock data
                    expertise_areas=["Reading", "Math"],  # Mock data
                    is_online=True,  # Mock data
                    last_seen=datetime.utcnow()
                )
                expert_profiles.append(expert_profile)
            
            return expert_profiles
            
        except Exception as e:
            logger.error(f"Failed to get expert parents: {e}")
            raise
    
    async def get_chat_threads(self, user_id: str) -> List[Dict[str, Any]]:
        """Get chat threads for user"""
        try:
            # Get threads where user is a participant
            threads_result = self.supabase.table("thread_participants").select("""
                thread_id,
                last_read_at,
                threads!inner (
                    id,
                    type,
                    class_id,
                    created_by,
                    created_at
                )
            """).eq("user_id", user_id).execute()
            
            chat_threads = []
            for thread_data in threads_result.data:
                thread = thread_data["threads"]
                thread_id = thread["id"]
                
                # Get last message
                last_message_result = self.supabase.table("messages").select("""
                    body,
                    created_at,
                    author_id,
                    profiles!messages_author_id_fkey (full_name)
                """).eq("thread_id", thread_id).order("created_at", desc=True).limit(1).execute()
                
                last_message = None
                last_message_at = None
                if last_message_result.data:
                    msg_data = last_message_result.data[0]
                    last_message = msg_data["body"]
                    last_message_at = msg_data["created_at"]
                
                # Calculate unread count
                unread_count = 0
                if thread_data["last_read_at"]:
                    unread_result = self.supabase.table("messages").select("id").eq("thread_id", thread_id).gt("created_at", thread_data["last_read_at"]).execute()
                    unread_count = len(unread_result.data)
                
                # Get thread name (for direct chats, use other participant's name)
                thread_name = "Chat"
                if thread["type"] == "direct":
                    other_participants = self.supabase.table("thread_participants").select("""
                        user_id,
                        profiles!thread_participants_user_id_fkey (full_name)
                    """).eq("thread_id", thread_id).neq("user_id", user_id).execute()
                    
                    if other_participants.data:
                        other_user = other_participants.data[0]
                        thread_name = other_user["profiles"]["full_name"] or "Unknown User"
                
                chat_threads.append({
                    "id": thread_id,
                    "name": thread_name,
                    "last_message": last_message or "",
                    "last_message_at": last_message_at,
                    "unread_count": unread_count
                })
            
            return chat_threads
            
        except Exception as e:
            logger.error(f"Failed to get chat threads: {e}")
            raise
    
    async def create_report(self, user_id: str, report_data: ReportCreate) -> Report:
        """Create a report for inappropriate content"""
        try:
            report_dict = report_data.model_dump()
            report_dict["id"] = str(uuid.uuid4())
            report_dict["reporter_id"] = user_id
            report_dict["status"] = "open"
            report_dict["created_at"] = datetime.utcnow()
            
            result = self.supabase.table("reports").insert(report_dict).execute()
            
            if not result.data:
                raise ValueError("Failed to create report")
            
            return Report(**result.data[0])
            
        except Exception as e:
            logger.error(f"Failed to create report: {e}")
            raise
