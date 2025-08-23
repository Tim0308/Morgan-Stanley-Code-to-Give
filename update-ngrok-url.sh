#!/bin/bash

# Script to update ngrok URL for React Native development
echo "🔗 Getting current ngrok URL..."

# Get the current ngrok URL
NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    tunnel = data['tunnels'][0]
    print(tunnel['public_url'])
except:
    print('')
")

if [ -z "$NGROK_URL" ]; then
    echo "❌ ngrok not running or no tunnels found"
    echo "💡 Start ngrok with: ngrok http 8000"
    exit 1
fi

echo "✅ Found ngrok URL: $NGROK_URL"

# Export the environment variable
export EXPO_PUBLIC_API_URL="$NGROK_URL"

echo "🔧 Environment variable set: EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL"
echo ""
echo "📱 Now start your React Native app with:"
echo "   cd my-rn-app && npm start"
echo ""
echo "🔄 Or run this to start with the URL:"
echo "   EXPO_PUBLIC_API_URL=\"$NGROK_URL\" npm start" 