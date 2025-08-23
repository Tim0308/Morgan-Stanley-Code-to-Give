"""
Content service implementation
Business logic for booklets, activities, and progress tracking
"""

from typing import List, Optional
import logging
from datetime import datetime, date
import uuid
import os

from core.database import get_supabase_client
from models.content import (
    BookletWithModules, Activity, ActivityProgress, ActivityWithProgress,
    ModuleWithActivities, ProgressUpdateRequest, WeeklyProgress, BookletProgress
)

logger = logging.getLogger(__name__)


class ContentService:
    """Service for content and progress management"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
    
    async def get_booklets_with_progress(self, week: Optional[str], child_id: Optional[str], user_id: str) -> List[BookletWithModules]:
        """Get booklets with modules and progress"""
        try:
            # If child_id is provided, verify it belongs to the user
            if child_id:
                result = self.supabase.table("children").select("*").eq("id", child_id).eq("parent_user_id", user_id).execute()
                if not result.data:
                    raise ValueError("Child not found or access denied")
            
            # Get booklets with their modules and activities
            booklets_result = self.supabase.table("booklets").select("""
                id, title, subtitle, subject, total_modules, week_start, week_end, locale,
                modules(
                    id, idx, title, description,
                    activities(
                        id, type, points, est_minutes, instructions
                    )
                )
            """).order("title").execute()
            
            booklets_with_modules = []
            
            for booklet_data in booklets_result.data:
                # Sort modules by index
                modules = sorted(booklet_data.get('modules', []), key=lambda m: m.get('idx', 0))
                
                modules_with_activities = []
                for module_data in modules:
                    activities = []
                    
                    for activity_data in module_data.get('activities', []):
                        # Get progress for this activity if child_id is provided
                        progress_data = None
                        if child_id:
                            progress_result = self.supabase.table("activity_progress").select("*").eq("child_id", child_id).eq("activity_id", activity_data['id']).execute()
                            if progress_result.data:
                                progress_info = progress_result.data[0]
                                progress_data = ActivityProgress(
                                    id=progress_info['id'],
                                    child_id=progress_info['child_id'],
                                    activity_id=progress_info['activity_id'],
                                    status=progress_info['status'],
                                    proof_url=progress_info.get('proof_url'),
                                    score=progress_info.get('score'),
                                    notes=progress_info.get('notes'),
                                    completed_at=progress_info.get('completed_at')
                                )
                        
                        # Create ActivityWithProgress object
                        activity = ActivityWithProgress(
                            id=activity_data['id'],
                            module_id=module_data['id'],
                            type=activity_data['type'],
                            title=activity_data.get('instructions', ''),  # Use instructions as title
                            points=activity_data.get('points', 10),
                            est_minutes=activity_data.get('est_minutes', 10),
                            instructions=activity_data.get('instructions', ''),
                            media=[],
                            progress=progress_data
                        )
                        activities.append(activity)
                    
                    # Create ModuleWithActivities object
                    module = ModuleWithActivities(
                        id=module_data['id'],
                        booklet_id=booklet_data['id'],
                        idx=module_data.get('idx', 1),
                        title=module_data.get('title', f"Module {module_data.get('idx', 1)}"),
                        description=module_data.get('description', ''),
                        activities=activities
                    )
                    modules_with_activities.append(module)
                
                # Create BookletWithModules object
                booklet = BookletWithModules(
                    id=booklet_data['id'],
                    title=booklet_data['title'],
                    subtitle=booklet_data.get('subtitle', ''),
                    week_start=booklet_data.get('week_start'),
                    week_end=booklet_data.get('week_end'),
                    locale=booklet_data.get('locale', 'en'),
                    total_modules=booklet_data.get('total_modules'),
                    subject=booklet_data.get('subject', 'Learning'),
                    modules=modules_with_activities,
                    progress_summary=None
                )
                booklets_with_modules.append(booklet)
            
            return booklets_with_modules
            
        except Exception as e:
            logger.error(f"Failed to get booklets: {e}")
            raise
    
    async def get_booklet_detail(self, booklet_id: str, child_id: Optional[str], user_id: str) -> BookletWithModules:
        """Get detailed booklet with modules and activities"""
        try:
            # TODO: Implement real database queries
            raise NotImplementedError("Booklet detail not implemented yet")
            
        except Exception as e:
            logger.error(f"Failed to get booklet detail: {e}")
            raise
    
    async def get_activity_detail(self, activity_id: str) -> Activity:
        """Get activity details"""
        try:
            result = self.supabase.table("activities").select("*").eq("id", activity_id).execute()
            
            if not result.data:
                raise ValueError("Activity not found")
            
            return Activity(**result.data[0])
            
        except Exception as e:
            logger.error(f"Failed to get activity detail: {e}")
            raise
    
    async def update_activity_progress_from_request(self, progress_data: ProgressUpdateRequest, user_id: str) -> ActivityProgress:
        """Update activity progress for a child"""
        try:
            # Verify parent owns child
            result = self.supabase.table("children").select("*").eq("id", progress_data.child_id).eq("parent_user_id", user_id).execute()
            if not result.data:
                raise ValueError("Child not found or access denied")
            
            # Check if progress record already exists
            existing_progress = self.supabase.table("activity_progress").select("*").eq("child_id", progress_data.child_id).eq("activity_id", progress_data.activity_id).execute()
            
            progress_record = {
                "child_id": progress_data.child_id,
                "activity_id": progress_data.activity_id,
                "status": progress_data.status.value,
                "proof_url": progress_data.proof_url,
                "score": progress_data.score,
                "notes": progress_data.notes
            }
            
            if existing_progress.data:
                # Update existing record
                progress_record["completed_at"] = datetime.now().isoformat() if progress_data.status.value == "completed" else None
                result = self.supabase.table("activity_progress").update(progress_record).eq("id", existing_progress.data[0]["id"]).execute()
                updated_progress = result.data[0]
            else:
                # Create new record
                if progress_data.status.value == "completed":
                    progress_record["completed_at"] = datetime.now().isoformat()
                result = self.supabase.table("activity_progress").insert(progress_record).execute()
                updated_progress = result.data[0]
            
            # TODO: Award tokens on completion
            
            return ActivityProgress(**updated_progress)
            
        except Exception as e:
            logger.error(f"Failed to update progress: {e}")
            raise
    
    async def update_activity_progress(self, activity_id: str, child_id: str, status: str, proof_url: Optional[str], user_id: str) -> ActivityProgress:
        """Update activity progress with individual parameters"""
        try:
            # Verify parent owns child
            result = self.supabase.table("children").select("*").eq("id", child_id).eq("parent_user_id", user_id).execute()
            if not result.data:
                raise ValueError("Child not found or access denied")
            
            # Check if progress record already exists
            existing_progress = self.supabase.table("activity_progress").select("*").eq("child_id", child_id).eq("activity_id", activity_id).execute()
            
            progress_record = {
                "child_id": child_id,
                "activity_id": activity_id,
                "status": status,
                "proof_url": proof_url,
                "completed_at": datetime.now().isoformat() if status == "completed" else None
            }
            
            if existing_progress.data:
                # Update existing record
                result = self.supabase.table("activity_progress").update(progress_record).eq("id", existing_progress.data[0]["id"]).execute()
                updated_progress = result.data[0]
            else:
                # Create new record
                result = self.supabase.table("activity_progress").insert(progress_record).execute()
                updated_progress = result.data[0]
            
            return ActivityProgress(**updated_progress)
            
        except Exception as e:
            logger.error(f"Failed to update progress: {e}")
            raise
    
    async def upload_proof_image(self, file, user_id: str) -> str:
        """Upload proof image to Supabase Storage and return URL"""
        try:
            # Generate unique filename
            file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
            unique_filename = f"{user_id}/{uuid.uuid4()}.{file_extension}"
            
            # Read file content
            file_content = await file.read()
            
            # Upload to Supabase Storage
            try:
                storage_response = self.supabase.storage.from_("proof-images").upload(
                    path=unique_filename,
                    file=file_content,
                    file_options={"content-type": file.content_type}
                )
                logger.info(f"Storage upload response: {storage_response}")
                
            except Exception as upload_error:
                logger.error(f"Storage upload exception: {upload_error}")
                raise Exception(f"Storage upload failed: {upload_error}")
            
            # Get public URL - this returns a string directly
            public_url = self.supabase.storage.from_("proof-images").get_public_url(unique_filename)
            
            logger.info(f"Successfully uploaded proof image: {public_url}")
            return public_url
            
        except Exception as e:
            logger.error(f"Failed to upload proof image: {e}")
            raise
    
    async def update_bulk_progress(self, updates: List[ProgressUpdateRequest], user_id: str) -> List[ActivityProgress]:
        """Update multiple activity progress entries"""
        try:
            # TODO: Implement bulk update logic
            return []
            
        except Exception as e:
            logger.error(f"Failed to update bulk progress: {e}")
            raise
    
    async def get_weekly_progress(self, child_id: str, weeks: int, user_id: str) -> List[WeeklyProgress]:
        """Get weekly progress summary for a child"""
        try:
            # First verify the child belongs to the user
            result = self.supabase.table("children").select("*").eq("id", child_id).eq("parent_user_id", user_id).execute()
            
            if not result.data:
                raise ValueError("Child not found or access denied")
            
            # Get weekly progress metrics from KPI metrics table
            result = self.supabase.table("kpi_metrics").select("*").eq("child_id", child_id).eq("metric", "weekly_progress").limit(weeks).order("period_start", desc=True).execute()
            
            weekly_progress = []
            for metric in result.data:
                # Get completed activities count
                activities_result = self.supabase.table("kpi_metrics").select("*").eq("child_id", child_id).eq("metric", "activities_completed").eq("period_start", metric['period_start']).single().execute()
                
                completed_activities = int(activities_result.data['value_num']) if activities_result.data else 0
                
                # Estimate total activities based on completion percentage
                completion_percentage = float(metric['value_num'])
                total_activities = int(completed_activities / (completion_percentage / 100)) if completion_percentage > 0 else 10
                
                weekly_progress.append(WeeklyProgress(
                    week=f"{metric['period_start']}",
                    total_activities=total_activities,
                    completed_activities=completed_activities,
                    completion_percentage=completion_percentage
                ))
            
            return weekly_progress
            
        except Exception as e:
            logger.error(f"Failed to get weekly progress: {e}")
            raise
    
    async def get_booklet_progress_summary(self, child_id: str, user_id: str) -> List[BookletProgress]:
        """Get progress summary for all booklets"""
        try:
            # First verify the child belongs to the user
            result = self.supabase.table("children").select("*").eq("id", child_id).eq("parent_user_id", user_id).execute()
            
            if not result.data:
                raise ValueError("Child not found or access denied")
            
            # Get all booklets with their modules and activities
            booklets_result = self.supabase.table("booklets").select("""
                id, title, total_modules,
                modules(
                    id, idx,
                    activities(id)
                )
            """).execute()
            
            booklet_progress = []
            
            for booklet in booklets_result.data:
                # Get activity progress for this child and booklet
                activity_ids = []
                total_modules = booklet.get('total_modules', 0)
                
                if booklet.get('modules'):
                    for module in booklet['modules']:
                        if module.get('activities'):
                            activity_ids.extend([act['id'] for act in module['activities']])
                
                # Count completed activities
                completed_count = 0
                if activity_ids:
                    progress_result = self.supabase.table("activity_progress").select("*").eq("child_id", child_id).in_("activity_id", activity_ids).eq("status", "completed").execute()
                    completed_count = len(progress_result.data)
                
                # Calculate progress
                total_activities = len(activity_ids)
                progress_percentage = (completed_count / total_activities * 100) if total_activities > 0 else 0
                completed_modules = int((completed_count / total_activities) * total_modules) if total_activities > 0 else 0
                current_module = min(completed_modules + 1, total_modules)
                
                # Estimate completion time based on remaining work
                remaining_modules = total_modules - completed_modules
                estimated_weeks = max(1, remaining_modules // 2)  # Assume 2 modules per week
                
                if estimated_weeks <= 4:
                    time_remaining = f"{estimated_weeks} weeks remaining"
                else:
                    estimated_months = max(1, estimated_weeks // 4)
                    time_remaining = f"{estimated_months} months remaining"
                
                booklet_progress.append(BookletProgress(
                    booklet_id=booklet['id'],
                    booklet_name=booklet['title'],
                    total_modules=total_modules,
                    completed_modules=completed_modules,
                    current_module=current_module,
                    progress_percentage=round(progress_percentage, 1),
                    estimated_completion_time=time_remaining
                ))
            
            return booklet_progress
            
        except Exception as e:
            logger.error(f"Failed to get booklet progress: {e}")
            raise
    
    async def save_proof_url(self, activity_id: str, child_id: str, proof_url: str, user_id: str) -> None:
        """Save proof URL without changing activity status"""
        try:
            logger.info(f"Saving proof URL for activity {activity_id}, child {child_id}, user {user_id}")
            
            # Verify parent owns child
            result = self.supabase.table("children").select("*").eq("id", child_id).eq("parent_user_id", user_id).execute()
            if not result.data:
                logger.error(f"Child verification failed: child {child_id} not found for user {user_id}")
                raise ValueError("Child not found or access denied")
            
            logger.info(f"Child verification successful for child {child_id}")
            
            # Check if progress record already exists
            existing_progress = self.supabase.table("activity_progress").select("*").eq("child_id", child_id).eq("activity_id", activity_id).execute()
            
            if existing_progress.data:
                logger.info(f"Updating existing progress record: {existing_progress.data[0]['id']}")
                # Update existing record with proof URL only
                try:
                    update_result = self.supabase.table("activity_progress").update({
                        "proof_url": proof_url
                    }).eq("id", existing_progress.data[0]["id"]).execute()
                    logger.info("Progress updated successfully")
                except Exception as update_error:
                    logger.error(f"Update failed: {update_error}")
                    raise Exception(f"Failed to update progress: {update_error}")
            else:
                logger.info("Creating new progress record")
                # Create new record with proof URL but keep status as not_started
                try:
                    insert_result = self.supabase.table("activity_progress").insert({
                        "child_id": child_id,
                        "activity_id": activity_id,
                        "status": "not_started",  # Don't change status just because proof is uploaded
                        "proof_url": proof_url
                    }).execute()
                    logger.info("Progress record created successfully")
                except Exception as insert_error:
                    logger.error(f"Insert failed: {insert_error}")
                    raise Exception(f"Failed to insert progress: {insert_error}")
                
        except Exception as e:
            logger.error(f"Failed to save proof URL: {e}")
            raise