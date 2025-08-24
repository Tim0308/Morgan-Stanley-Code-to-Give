#!/bin/bash

echo "🚀 Setting up AI Explain Feature for Project Reach"
echo "=================================================="

# Install React Native dependencies
echo "📱 Installing React Native dependencies..."
cd my-rn-app
npm install react-native-view-shot@4.0.0-alpha.2 expo-media-library@17.0.3 expo-sharing@13.0.2

echo "🐍 Installing Python dependencies for AI API..."
cd ../backend

# Activate virtual environment
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    echo "✅ Virtual environment activated"
else
    echo "❌ Virtual environment not found. Please run setup_backend.sh first"
    exit 1
fi

# Install the new requirements (much lighter now!)
pip install huggingface-hub>=0.20.0

echo "✅ AI Feature Setup Complete!"
echo ""
echo "🔑 Required Environment Variable:"
echo "You need to set your Hugging Face token in the backend/.env file:"
echo "   HF_TOKEN=your_hugging_face_token_here"
echo ""
echo "📋 Next Steps:"
echo "1. Get your HF token from https://huggingface.co/settings/tokens"
echo "2. Add HF_TOKEN=your_token to backend/.env file"
echo "3. Restart your backend server"
echo "4. Restart your React Native app"
echo "5. The explain button will appear in the lower right corner of each screen"
echo "6. Press it to capture a screenshot and get an AI explanation"
echo ""
echo "🎯 The AI service uses Hugging Face's cloud API - no local model downloads needed!"
echo "   - Instant responses"
echo "   - No disk space requirements"
echo "   - Always up-to-date model"
