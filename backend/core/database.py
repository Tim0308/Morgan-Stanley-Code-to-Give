"""
Database configuration and Supabase client setup
"""

from supabase import create_client, Client
from typing import Optional
import logging
from .config import settings

logger = logging.getLogger(__name__)

# Global Supabase client instance
_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """Get or create Supabase client instance"""
    global _supabase_client
    
    if _supabase_client is None:
        try:
            _supabase_client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY
            )
            logger.info("Supabase client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise
    
    return _supabase_client


def get_anon_supabase_client() -> Client:
    """Get Supabase client with anonymous key (for public operations)"""
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_ANON_KEY
    )


class DatabaseManager:
    """Database operations manager"""
    
    def __init__(self):
        self.client = get_supabase_client()
    
    async def health_check(self) -> bool:
        """Check database connectivity"""
        try:
            # Simple query to test connection
            result = self.client.table("profiles").select("count").limit(1).execute()
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False
    
    def get_table(self, table_name: str):
        """Get table reference for queries"""
        return self.client.table(table_name)
    
    def get_storage(self):
        """Get storage bucket reference"""
        return self.client.storage
    
    def get_auth(self):
        """Get auth reference"""
        return self.client.auth


# Global database manager instance
db_manager = DatabaseManager() 