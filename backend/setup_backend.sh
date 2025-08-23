#!/bin/bash

# Project Reach Backend Setup and Data Loading Script
# This script helps you set up the backend and load sample data

echo "🚀 Project Reach Backend Setup"
echo "================================"

# Check if we're in the right directory
if [ ! -f "main.py" ]; then
    echo "❌ Please run this script from the backend directory"
    exit 1
fi

# Step 1: Check Python environment
echo ""
echo "🐍 Step 1: Checking Python environment..."
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 found: $(python3 --version)"
else
    echo "❌ Python 3 not found. Please install Python 3.8+  "
    exit 1
fi

# Step 2: Create virtual environment if it doesn't exist
echo ""
echo "📦 Step 2: Setting up virtual environment..."
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
echo "✅ Virtual environment activated"

# Step 3: Install dependencies
echo ""
echo "📚 Step 3: Installing dependencies..."
pip install -r requirements.txt
echo "✅ Dependencies installed"

# Step 4: Check environment variables
echo ""
echo "🔧 Step 4: Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating template..."
    cat > .env << 'EOF'
# Project Reach Environment Configuration
DEBUG=true

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_service_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# CORS Origins (for development)
CORS_ORIGINS=http://localhost:8081,http://localhost:19006,http://10.0.2.2:8081
EOF
    echo "❌ Please update the .env file with your Supabase credentials"
    echo "   You can find these in your Supabase project dashboard"
    echo "   After updating .env, run this script again"
    exit 1
else
    echo "✅ .env file found"
fi

# Check if required environment variables are set
if grep -q "your_supabase_url_here" .env || grep -q "your_service_key_here" .env; then
    echo "❌ Please update your .env file with real Supabase credentials"
    echo "   The file contains placeholder values"
    exit 1
fi

echo "✅ Environment configuration looks good"

# Step 5: Test database connection
echo ""
echo "🗄️  Step 5: Testing database connection..."
python3 -c "
try:
    from core.database import get_supabase_client
    supabase = get_supabase_client()
    result = supabase.table('profiles').select('count').execute()
    print('✅ Database connection successful')
except Exception as e:
    print(f'❌ Database connection failed: {e}')
    print('   Please check your Supabase credentials in .env')
    exit(1)
"

if [ $? -ne 0 ]; then
    exit 1
fi

# Step 6: Start the backend server
echo ""
echo "🌐 Step 6: Starting backend server..."
echo "The server will start on http://localhost:8000"
echo "API docs will be available at http://localhost:8000/api/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
python3 main.py
