#!/usr/bin/env python3
"""
Test script to check if AI dependencies are properly installed
"""

import sys
import os

def test_dependencies():
    """Test if all required AI dependencies are available"""
    
    print("🧪 Testing AI Feature Dependencies")
    print("=" * 40)
    
    # Test basic imports
    dependencies = [
        ("base64", "base64"),
        ("logging", "logging"),
        ("huggingface_hub", "Hugging Face Hub")
    ]
    
    failed = []
    
    for module, name in dependencies:
        try:
            __import__(module)
            print(f"✅ {name}: OK")
        except ImportError as e:
            print(f"❌ {name}: FAILED - {e}")
            failed.append(name)
    
    # Test specific imports
    try:
        from huggingface_hub import InferenceClient
        print("✅ Hugging Face InferenceClient: OK")
    except ImportError as e:
        print(f"❌ Hugging Face InferenceClient: FAILED - {e}")
        failed.append("InferenceClient")
    
    # Test environment variable
    try:
        from core.config import settings
        hf_token = settings.HF_TOKEN
        if hf_token:
            print("✅ HF_TOKEN environment variable: OK")
        else:
            print("❌ HF_TOKEN environment variable: NOT SET")
            failed.append("HF_TOKEN")
    except Exception as e:
        print(f"❌ HF_TOKEN configuration: FAILED - {e}")
        failed.append("HF_TOKEN")
    
    print("\n" + "=" * 40)
    
    if failed:
        print(f"❌ {len(failed)} dependencies/configs failed:")
        for dep in failed:
            print(f"   - {dep}")
        print("\n💡 To fix these issues:")
        if "Hugging Face Hub" in failed or "InferenceClient" in failed:
            print("   pip install huggingface-hub>=0.20.0")
        if "HF_TOKEN" in failed:
            print("   1. Get token from https://huggingface.co/settings/tokens")
            print("   2. Add HF_TOKEN=your_token to backend/.env file")
        return False
    else:
        print("✅ All AI dependencies are properly installed!")
        print("🚀 You can now use the AI Explain feature.")
        return True

if __name__ == "__main__":
    success = test_dependencies()
    sys.exit(0 if success else 1)
