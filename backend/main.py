"""
Main FastAPI application for Project Reach Educational Platform
Microservices architecture with single Supabase database
"""

import sys
import os
from pathlib import Path

# Add the current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import service routers
from services.auth.router import router as auth_router
from services.profiles.router import router as profiles_router
from services.content.router import router as content_router
from services.community.router import router as community_router
from services.tokens.router import router as tokens_router
from services.analytics.router import router as analytics_router
from services.games.router import router as games_router
from services.notifications.router import router as notifications_router

# Import shared dependencies
from core.config import settings
from core.database import get_supabase_client

# Create FastAPI app
app = FastAPI(
    title="Project Reach API",
    description="Educational parent engagement platform API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "project-reach-api"}

# API v1 routes
API_V1_PREFIX = "/api/v1"

# Register service routers
app.include_router(auth_router, prefix=f"{API_V1_PREFIX}/auth", tags=["Authentication"])
app.include_router(profiles_router, prefix=f"{API_V1_PREFIX}/profiles", tags=["Profiles"])
app.include_router(content_router, prefix=f"{API_V1_PREFIX}/content", tags=["Content & Progress"])
app.include_router(community_router, prefix=f"{API_V1_PREFIX}/community", tags=["Community"])
app.include_router(tokens_router, prefix=f"{API_V1_PREFIX}/tokens", tags=["Tokens & Shop"])
app.include_router(analytics_router, prefix=f"{API_V1_PREFIX}/analytics", tags=["Analytics"])
app.include_router(games_router, prefix=f"{API_V1_PREFIX}/games", tags=["Games"])
app.include_router(notifications_router, prefix=f"{API_V1_PREFIX}/notifications", tags=["Notifications"])

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc) if settings.DEBUG else None}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    ) 