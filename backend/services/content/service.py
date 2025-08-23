"""
Content service implementation
Business logic for booklets, activities, and progress tracking
"""

from typing import List, Optional
import logging
from datetime import datetime, date

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
                        activity_status = 'not_started'
                        if child_id:
                            progress_result = self.supabase.table("activity_progress").select("status").eq("child_id", child_id).eq("activity_id", activity_data['id']).execute()
                            if progress_result.data:
                                activity_status = progress_result.data[0]['status']
                        
                        # Create ActivityWithProgress object
                        activity = ActivityWithProgress(
                            id=activity_data['id'],
                            module_id=module_data['id'],
                            type=activity_data['type'],
                            points=activity_data.get('points', 10),
                            est_minutes=activity_data.get('est_minutes', 10),
                            instructions=activity_data.get('instructions', ''),
                            media=[],
                            title=f"Activity {len(activities) + 1}",  # Generate title
                            status=activity_status
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
    
    async def update_activity_progress(self, progress_data: ProgressUpdateRequest, user_id: str) -> ActivityProgress:
        """Update activity progress for a child"""
        try:
            # TODO: Verify parent owns child
            # TODO: Implement progress update logic
            # TODO: Award tokens on completion
            raise NotImplementedError("Progress update not implemented yet")
            
        except Exception as e:
            logger.error(f"Failed to update progress: {e}")
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