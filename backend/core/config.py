"""
Configuration settings for Project Reach API
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # App Configuration
    APP_NAME: str = "Project Reach API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key-change-in-production"
    
    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_ANON_KEY: str
    
    # Database (optional - uses Supabase by default)
    DATABASE_URL: str = ""
    
    # External Services
    POSTHOG_KEY: str = ""
    EXPO_PUSH_KEY: str = ""
    
    # OpenAI Configuration
    OPENAI_API_KEY: str = "a97fe937957949079c02267ba32a86dd"
    
    # Frontend API URL
    EXPO_PUBLIC_API_URL: str = "http://192.168.1.100:8000"
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,exp://192.168.1.100:8081,https://your-app.vercel.app"
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
    
    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # File Upload
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: List[str] = ["image/jpeg", "image/png", "application/pdf", "audio/mpeg"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings() 