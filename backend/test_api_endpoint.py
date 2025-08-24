#!/usr/bin/env python3
"""
Test script to verify the AI API endpoint is working correctly
"""

import base64
import requests
import json
from io import BytesIO
from PIL import Image, ImageDraw

def create_test_image():
    """Create a simple test image"""
    img = Image.new('RGB', (200, 200), color='white')
    draw = ImageDraw.Draw(img)
    draw.text((50, 50), "Test Image", fill='black')
    draw.rectangle([50, 100, 150, 150], outline='red', width=2)
    
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    return base64.b64encode(buffer.getvalue()).decode('utf-8')

def test_ai_endpoint():
    """Test the AI endpoint directly"""
    
    print("🧪 Testing AI API Endpoint")
    print("=" * 40)
    
    # Create test image
    test_image = create_test_image()
    print(f"✅ Test image created (length: {len(test_image)})")
    
    # Prepare request
    url = "http://localhost:8000/api/v1/ai/explain-screenshot"
    
    # Test without authentication first
    print("\n📋 Test 1: Without Authentication")
    print("-" * 30)
    
    try:
        response = requests.post(
            url,
            json={"image_data": test_image},
            timeout=30
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n📋 Test 2: Check if endpoint exists")
    print("-" * 30)
    
    try:
        # Try a GET request to see what happens
        response = requests.get(url, timeout=10)
        print(f"GET Status Code: {response.status_code}")
        print(f"GET Response: {response.text}")
    except Exception as e:
        print(f"❌ GET Error: {e}")
    
    print("\n📋 Test 3: Check API documentation")
    print("-" * 30)
    
    try:
        docs_url = "http://localhost:8000/api/docs"
        response = requests.get(docs_url, timeout=10)
        print(f"Docs Status Code: {response.status_code}")
        if response.status_code == 200:
            print("✅ API docs accessible")
        else:
            print("❌ API docs not accessible")
    except Exception as e:
        print(f"❌ Docs Error: {e}")
    
    print("\n📋 Test 4: Check health endpoint")
    print("-" * 30)
    
    try:
        health_url = "http://localhost:8000/health"
        response = requests.get(health_url, timeout=10)
        print(f"Health Status Code: {response.status_code}")
        print(f"Health Response: {response.text}")
    except Exception as e:
        print(f"❌ Health Error: {e}")
    
    print("\n📋 Test 5: Test with minimal auth header")
    print("-" * 30)
    
    try:
        response = requests.post(
            url,
            json={"image_data": test_image},
            headers={"Authorization": "Bearer test-token"},
            timeout=30
        )
        print(f"Auth Status Code: {response.status_code}")
        print(f"Auth Response: {response.text}")
    except Exception as e:
        print(f"❌ Auth Error: {e}")

if __name__ == "__main__":
    test_ai_endpoint()
