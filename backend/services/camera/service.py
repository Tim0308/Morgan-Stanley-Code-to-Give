"""
Camera service for handling image processing
"""

import base64
from fastapi import UploadFile
from services.games.router import analyze_image_with_gpt4o


async def process_camera_image(image: UploadFile, word_of_the_day: str, user):
    """Process uploaded image and analyze with AI"""
    try:
        # Read image data
        image_data = await image.read()
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Use existing AI analysis
        result = await analyze_image_with_gpt4o(image_base64, word_of_the_day)
        
        return {
            "is_correct": result.get("is_correct", False),
            "feedback": result.get("feedback", "")
        }
    except Exception as e:
        return {
            "is_correct": False,
            "feedback": f"Error hi processing image: {str(e)}"
        }
