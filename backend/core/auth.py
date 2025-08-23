"""
Authentication utilities and middleware for Supabase JWT validation
"""

from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from typing import Optional, Dict, Any
import httpx
import logging
from .config import settings
from .database import get_supabase_client

logger = logging.getLogger(__name__)

security = HTTPBearer()


class AuthUser:
    """Authenticated user model"""
    def __init__(self, user_id: str, email: str, role: str = "parent", profile_data: Optional[Dict] = None):
        self.user_id = user_id
        self.email = email
        self.role = role
        self.profile_data = profile_data or {}


async def get_supabase_jwks() -> Dict[str, Any]:
    """Fetch Supabase JWKS for JWT validation"""
    try:
        jwks_url = f"{settings.SUPABASE_URL}/auth/v1/jwks"
        async with httpx.AsyncClient() as client:
            response = await client.get(jwks_url)
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"Failed to fetch JWKS: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable"
        )


async def verify_jwt_token(token: str) -> Dict[str, Any]:
    """Verify JWT token using Supabase JWKS"""
    try:
        # For development, we'll use a simpler approach
        # In production, implement proper JWKS validation
        
        # Decode without verification for now (development only)
        if settings.DEBUG:
            payload = jwt.get_unverified_claims(token)
            return payload
        
        # Production JWKS validation would go here
        jwks = await get_supabase_jwks()
        # Implementation for production JWKS validation
        
        return {}
    except JWTError as e:
        logger.error(f"JWT validation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> AuthUser:
    """Extract and validate current user from JWT token"""
    try:
        token = credentials.credentials
        payload = await verify_jwt_token(token)
        
        user_id = payload.get("sub")
        email = payload.get("email")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        # Fetch user profile from Supabase
        supabase = get_supabase_client()
        profile_result = supabase.table("profiles").select("*").eq("user_id", user_id).execute()
        
        profile_data = {}
        role = "parent"  # default
        
        if profile_result.data:
            profile_data = profile_result.data[0]
            role = profile_data.get("role", "parent")
        
        return AuthUser(
            user_id=user_id,
            email=email,
            role=role,
            profile_data=profile_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )


async def get_current_parent(current_user: AuthUser = Depends(get_current_user)) -> AuthUser:
    """Ensure current user is a parent"""
    if current_user.role != "parent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Parent access required"
        )
    return current_user


async def get_current_teacher(current_user: AuthUser = Depends(get_current_user)) -> AuthUser:
    """Ensure current user is a teacher"""
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher access required"
        )
    return current_user


async def get_current_admin(current_user: AuthUser = Depends(get_current_user)) -> AuthUser:
    """Ensure current user is an admin"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# Optional authentication (for public endpoints that can benefit from user context)
async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[AuthUser]:
    """Get current user if authenticated, None otherwise"""
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None 