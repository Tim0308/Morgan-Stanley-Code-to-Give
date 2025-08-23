"""
Analytics service implementation
Business logic for performance metrics, KPIs, and analytics data
"""

from typing import List, Dict, Any, Optional
import logging
from datetime import datetime, date, timedelta

from core.database import get_supabase_client

logger = logging.getLogger(__name__)


class AnalyticsService:
    """Service for analytics and performance metrics"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
    
    async def get_performance_metrics(self, user_id: str, child_id: Optional[str] = None) -> Dict[str, Any]:
        """Get performance metrics for a user's children"""
        try:
            # Get user's children if no specific child_id provided
            children_filter = []
            if child_id:
                # Verify child belongs to user
                result = self.supabase.table("children").select("*").eq("id", child_id).eq("parent_user_id", user_id).execute()
                if not result.data:
                    raise ValueError("Child not found or access denied")
                children_filter = [child_id]
            else:
                # Get all children for the user
                result = self.supabase.table("children").select("id").eq("parent_user_id", user_id).execute()
                children_filter = [child['id'] for child in result.data]
            
            if not children_filter:
                return {
                    "reading_minutes": 0,
                    "activities_completed": 0,
                    "streak_days": 0,
                    "weekly_progress": 0.0,
                    "total_tokens": 0,
                    "certificates_earned": 0,
                    "badges_earned": 0
                }
            
            metrics = {}
            
            # Get latest metrics for the children
            for metric_name in ['reading_minutes', 'activities_completed', 'streak_days', 'weekly_progress']:
                result = self.supabase.table("kpi_metrics").select("value_num").eq("metric", metric_name).in_("child_id", children_filter).order("period_start", desc=True).limit(len(children_filter)).execute()
                
                if result.data:
                    # Sum up values for all children
                    total_value = sum(float(row['value_num']) for row in result.data)
                    if metric_name == 'weekly_progress':
                        # Average for percentage metrics
                        metrics[metric_name] = round(total_value / len(result.data), 1) if result.data else 0.0
                    else:
                        metrics[metric_name] = int(total_value) if metric_name != 'weekly_progress' else total_value
                else:
                    metrics[metric_name] = 0 if metric_name != 'weekly_progress' else 0.0
            
            # Get token balances
            token_result = self.supabase.table("token_accounts").select("balance").in_("child_id", children_filter).execute()
            metrics['total_tokens'] = sum(int(row['balance']) for row in token_result.data) if token_result.data else 0
            
            # Get certificates count
            cert_result = self.supabase.table("child_certificates").select("certificate_id").in_("child_id", children_filter).execute()
            metrics['certificates_earned'] = len(cert_result.data) if cert_result.data else 0
            
            # Get badges count
            badge_result = self.supabase.table("child_badges").select("badge_id").in_("child_id", children_filter).execute()
            metrics['badges_earned'] = len(badge_result.data) if badge_result.data else 0
            
            return metrics
            
        except Exception as e:
            logger.error(f"Failed to get performance metrics: {e}")
            raise
    
    async def get_child_achievements(self, child_id: str, user_id: str) -> Dict[str, Any]:
        """Get achievements for a specific child"""
        try:
            # Verify child belongs to user
            result = self.supabase.table("children").select("*").eq("id", child_id).eq("parent_user_id", user_id).execute()
            if not result.data:
                raise ValueError("Child not found or access denied")
            
            child = result.data[0]
            
            # Get badges
            badges_result = self.supabase.table("child_badges").select("""
                badge_id, awarded_at,
                badges(name, icon_url)
            """).eq("child_id", child_id).execute()
            
            badges = []
            for badge_row in badges_result.data:
                badge = badge_row.get('badges', {})
                badges.append({
                    'id': badge_row['badge_id'],
                    'name': badge.get('name', 'Achievement Badge'),
                    'icon_url': badge.get('icon_url'),
                    'awarded_at': badge_row['awarded_at']
                })
            
            # Get certificates
            cert_result = self.supabase.table("child_certificates").select("""
                certificate_id, awarded_at,
                certificates(title, description, image_url)
            """).eq("child_id", child_id).execute()
            
            certificates = []
            for cert_row in cert_result.data:
                cert = cert_row.get('certificates', {})
                certificates.append({
                    'id': cert_row['certificate_id'],
                    'title': cert.get('title', 'Certificate'),
                    'description': cert.get('description'),
                    'image_url': cert.get('image_url'),
                    'awarded_at': cert_row['awarded_at']
                })
            
            # Get token account info
            token_result = self.supabase.table("token_accounts").select("*").eq("child_id", child_id).execute()
            token_info = token_result.data[0] if token_result.data else {
                'balance': 0,
                'weekly_earned': 0,
                'rank_percentile': 0.0
            }
            
            return {
                'child_name': child.get('nickname', 'Child'),
                'badges': badges,
                'certificates': certificates,
                'tokens': {
                    'balance': token_info['balance'],
                    'weekly_earned': token_info['weekly_earned'],
                    'rank_percentile': float(token_info.get('rank_percentile', 0.0))
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get child achievements: {e}")
            raise
    
    async def get_leaderboard(self, user_id: str, child_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get leaderboard data for user's children"""
        try:
            # Get user's children
            children_result = self.supabase.table("children").select("*").eq("parent_user_id", user_id).execute()
            children = {child['id']: child for child in children_result.data}
            
            if not children:
                return []
            
            # Filter by specific child if provided
            target_children = [child_id] if child_id and child_id in children else list(children.keys())
            
            # Get latest leaderboard entries
            leaderboard_result = self.supabase.table("leaderboards").select("""
                *,
                classes(name, grade, school)
            """).in_("child_id", target_children).order("period_start", desc=True).execute()
            
            leaderboard_data = []
            for entry in leaderboard_result.data:
                child = children[entry['child_id']]
                class_info = entry.get('classes', {})
                
                leaderboard_data.append({
                    'child_id': entry['child_id'],
                    'child_name': child.get('nickname', 'Child'),
                    'rank': entry['rank'],
                    'percentile': float(entry.get('percentile', 0.0)),
                    'class_name': class_info.get('name', 'Unknown Class'),
                    'period': f"{entry['period_start']} to {entry['period_end']}"
                })
            
            return leaderboard_data
            
        except Exception as e:
            logger.error(f"Failed to get leaderboard: {e}")
            raise
