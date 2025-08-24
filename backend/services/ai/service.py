import os
import base64
import logging
from huggingface_hub import InferenceClient
from core.config import settings

logger = logging.getLogger(__name__)

class QwenVLService:
    """Service for processing images with Qwen2.5-VL model using Hugging Face Inference API"""
    
    def __init__(self):
        self.client = None
        self._initialized = False
    
    def _initialize_client(self):
        """Initialize the Hugging Face Inference Client"""
        if self._initialized:
            return
        
        try:
            # Get HF token from settings
            hf_token = settings.HF_TOKEN
            if not hf_token:
                raise ValueError("HF_TOKEN is required in .env file")
            
            logger.info("Initializing Hugging Face Inference Client...")
            
            self.client = InferenceClient(
                provider="auto",
                api_key=hf_token,
            )
            
            self._initialized = True
            logger.info("Hugging Face Inference Client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Hugging Face client: {str(e)}")
            raise
    
    def _base64_to_data_url(self, base64_string: str) -> str:
        """Convert base64 string to data URL format"""
        try:
            # Remove data URL prefix if present
            if base64_string.startswith('data:'):
                return base64_string
            
            # Add data URL prefix for JPEG (most common screenshot format)
            return f"data:image/jpeg;base64,{base64_string}"
            
        except Exception as e:
            logger.error(f"Failed to process base64 image: {str(e)}")
            raise ValueError("Invalid base64 image data")
    
    def explain_screenshot(self, base64_image: str) -> str:
        """
        Process a screenshot with Qwen2.5-VL model to generate explanation
        
        Args:
            base64_image: Base64 encoded image data
            
        Returns:
            Generated explanation text
        """
        try:
            # Initialize client if not already done
            self._initialize_client()
            
            # Convert base64 to data URL
            image_url = self._base64_to_data_url(base64_image)
            
            # Fixed prompt - NOT taken from user, hardcoded for Hugging Face API
            prompt = "You are helping out inside an app made for parents/guardian engagement in early childhood education. Analyze the visual elements as well as text in the image and give an explanation for the guardian. You may be given a screenshot of any page inside the app in which case describe what can be done through the current view and what features are available and how to see other tabs to avail other services. You may alternatively be given an image of an exercise for the child, in which case, explain what the goal of the activity is and how the guardian can help the child complete it. Keep your reply to the point and conversational and easy to understand. Talk to the guardian directly."
            
            # Prepare messages for the API (exactly like your example)
            messages = [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt  # This hardcoded prompt is passed to Hugging Face
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url  # Base64 image converted to data URL
                            }
                        }
                    ]
                }
            ]
            
            # Call the inference API
            logger.info("🚀 Sending request to Qwen2.5-VL via Hugging Face API...")
            logger.info(f"📸 Image URL length: {len(image_url)} characters")
            logger.info(f"💬 Prompt: {prompt}")
            
            completion = self.client.chat.completions.create(
                model="Qwen/Qwen2.5-VL-7B-Instruct",
                messages=messages,
                max_tokens=512,
                temperature=0.7
            )
            
            explanation = completion.choices[0].message.content
            logger.info(f"✅ Successfully generated explanation via Hugging Face API")
            logger.info(f"📝 Response length: {len(explanation)} characters")
            logger.info(f"🔍 Response preview: {explanation[:100]}...")
            
            return explanation or "No explanation generated"
            
        except Exception as e:
            logger.error(f"Failed to explain screenshot: {str(e)}")
            raise

# Global instance
qwen_service = QwenVLService()
