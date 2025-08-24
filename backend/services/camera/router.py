"""
Camera microservice router
"""

from fastapi import APIRouter, Depends, UploadFile, File, Form
from core.auth import get_current_user, AuthUser
from .service import process_camera_image

router = APIRouter()

@router.post("/capture")
async def capture_image(
    image: UploadFile = File(...),
    word_of_the_day: str = Form("DOG"),
    current_user: AuthUser = Depends(get_current_user)
):
    """Handle camera capture and AI analysis"""
    return await process_camera_image(image, word_of_the_day, current_user)
