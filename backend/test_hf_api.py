#!/usr/bin/env python3
"""
Test script to verify Hugging Face API integration with a real image
"""

import base64
import logging
import sys
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

# Configure logging to see detailed output
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def create_test_image():
    """Create a simple test image with text"""
    # Create a 400x300 image with white background
    img = Image.new('RGB', (400, 300), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw some text and shapes
    try:
        # Try to use a better font, fall back to default if not available
        font = ImageFont.truetype("arial.ttf", 24)
    except:
        font = ImageFont.load_default()
    
    # Add text
    draw.text((50, 50), "Project Reach", fill='black', font=font)
    draw.text((50, 100), "Educational App", fill='blue', font=font)
    draw.text((50, 150), "AI Explain Feature Test", fill='red', font=font)
    
    # Draw some shapes
    draw.rectangle([50, 200, 150, 250], outline='green', width=3)
    draw.ellipse([200, 200, 300, 250], outline='purple', width=3)
    
    # Convert to base64
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    return img_base64

def test_ai_service():
    """Test the AI service with a real API call"""
    
    print("🧪 Testing Hugging Face API Integration")
    print("=" * 50)
    
    try:
        # Import the AI service
        from services.ai.service import qwen_service
        print("✅ AI service imported successfully")
        
        # Create a test image
        print("🎨 Creating test image...")
        test_image_b64 = create_test_image()
        print(f"✅ Test image created (base64 length: {len(test_image_b64)})")
        
        # Test the AI service
        print("🚀 Calling AI service...")
        print("⏳ This may take 5-10 seconds for the first request...")
        
        result = qwen_service.explain_screenshot(test_image_b64)
        
        print("\n" + "=" * 50)
        print("✅ SUCCESS! AI API is working!")
        print("=" * 50)
        print(f"📝 AI Response:\n{result}")
        print("=" * 50)
        
        return True
        
    except Exception as e:
        print(f"\n❌ FAILED: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        
        # Print more details for debugging
        import traceback
        print("\n🔍 Full error traceback:")
        traceback.print_exc()
        
        return False

if __name__ == "__main__":
    success = test_ai_service()
    print(f"\n🎯 Test {'PASSED' if success else 'FAILED'}")
    sys.exit(0 if success else 1)
