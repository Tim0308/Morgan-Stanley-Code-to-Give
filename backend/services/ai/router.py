from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import logging
from typing import Optional

from core.auth import get_current_user
from .service import qwen_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])

class ExplainScreenshotRequest(BaseModel):
    image_data: str  # base64 encoded image

class ExplainScreenshotResponse(BaseModel):
    explanation: str
    success: bool

@router.post("/explain-screenshot", response_model=ExplainScreenshotResponse)
async def explain_screenshot(
    request: ExplainScreenshotRequest,
    # TODO: Re-enable authentication after fixing Supabase JWT validation
    # current_user=Depends(get_current_user)
):
    """
    Analyze a screenshot using Qwen2.5-VL and provide an explanation
    
    Note: Authentication temporarily disabled for AI feature testing
    """
    try:
        logger.info(f"🔍 Processing screenshot explanation request (auth disabled for testing)")
        
        if not request.image_data:
            raise HTTPException(status_code=400, detail="No image data provided")
        
        # Process the screenshot with AI
        logger.info(f"📸 Processing image data (length: {len(request.image_data)})")
        
        explanation = qwen_service.explain_screenshot(
            base64_image=request.image_data
        )
        
        logger.info("✅ Screenshot explanation generated successfully")
        logger.info(f"📝 Explanation length: {len(explanation)} characters")
        
        return ExplainScreenshotResponse(
            explanation=explanation,
            success=True
        )
        
    except ValueError as e:
        logger.error(f"❌ Invalid input data: {str(e)}")
        logger.error(f"🔍 Input data preview: {request.image_data[:100]}...")
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")
    
    except Exception as e:
        logger.error(f"❌ Failed to process screenshot: {str(e)}")
        logger.error(f"🔍 Error type: {type(e).__name__}")
        logger.error(f"🔍 Full error details:", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"AI processing failed: {str(e)}"
        )
