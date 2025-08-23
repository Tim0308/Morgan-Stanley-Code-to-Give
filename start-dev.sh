#!/bin/bash

echo "🚀 Starting Project Reach Development Environment"
echo "=================================================="

# Function to check if a process is running on a port
check_port() {
    lsof -ti:$1 >/dev/null 2>&1
}

# Function to get ngrok URL
get_ngrok_url() {
    curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    tunnel = data['tunnels'][0]
    print(tunnel['public_url'])
except:
    print('')
" 2>/dev/null
}

# 1. Check if backend is running
echo "🔍 Checking backend status..."
if check_port 8000; then
    echo "✅ Backend is running on port 8000"
else
    echo "❌ Backend not running. Starting backend..."
    cd backend
    source venv/bin/activate
    nohup uvicorn main:app --reload --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
    echo "⏳ Waiting for backend to start..."
    sleep 3
    cd ..
fi

# 2. Check if ngrok is running
echo "🔍 Checking ngrok status..."
NGROK_URL=$(get_ngrok_url)
if [ -z "$NGROK_URL" ]; then
    echo "❌ ngrok not running. Starting ngrok..."
    nohup ngrok http 8000 > ngrok.log 2>&1 &
    echo "⏳ Waiting for ngrok to start..."
    sleep 5
    NGROK_URL=$(get_ngrok_url)
fi

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to start ngrok"
    exit 1
fi

echo "✅ ngrok tunnel: $NGROK_URL"

# 3. Set environment variable and start React Native
echo "🔧 Setting API URL environment variable..."
export EXPO_PUBLIC_API_URL="$NGROK_URL"

echo "📱 Starting React Native app..."
cd my-rn-app

# Start React Native with the environment variable
EXPO_PUBLIC_API_URL="$NGROK_URL" npm start 