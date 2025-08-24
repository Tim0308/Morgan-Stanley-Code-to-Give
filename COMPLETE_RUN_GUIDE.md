# 🚀 Complete Project Reach Setup & Run Guide

This is the complete guide to set up and run Project Reach with the new AI Explain feature.

## 📋 Prerequisites

Make sure you have installed:
- **Node.js** (v16+) - [Download](https://nodejs.org/)
- **Python 3.8+** - [Download](https://python.org/)
- **ngrok** - [Download](https://ngrok.com/)
- **Git** - [Download](https://git-scm.com/)

## 🏗️ Part 1: Initial Setup

### Step 1: Clone & Setup Project Structure
```bash
# If not already cloned
git clone <your-repo-url>
cd T1V1
```

### Step 2: Setup Supabase Database

#### A. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project: "project-reach"
3. Choose region and set database password
4. Wait for initialization (2-3 minutes)

#### B. Get API Credentials
Go to **Settings → API** and copy:
- **Project URL**: `https://your-project-id.supabase.co`
- **anon key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### C. Setup Database Schema
1. Go to **SQL Editor** in Supabase dashboard
2. Run the files in this order:
   - Copy & run `backend/supabase/schema.sql`
   - Copy & run `backend/supabase/rls_policies.sql`  
   - Copy & run `backend/supabase/seed.sql`

### Step 3: Setup Hugging Face (for AI Feature)

#### A. Create HF Account & Token
1. Go to [huggingface.co](https://huggingface.co) and sign up
2. Go to [Settings → Tokens](https://huggingface.co/settings/tokens)
3. Click "New token"
4. Name: "Project Reach AI", Type: "Read"
5. **Copy the token** (starts with `hf_`)

#### B. Configure Environment
Create `backend/.env` file:
```env
# Project Reach Environment Configuration
DEBUG=true

# Supabase Configuration - UPDATE THESE VALUES
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here
SUPABASE_ANON_KEY=your-anon-key-here

# CORS Origins (for development)
CORS_ORIGINS=http://localhost:8081,http://localhost:19006,http://10.0.2.2:8081

# Hugging Face Token for AI Explain Feature
HF_TOKEN=hf_your_hugging_face_token_here
```

## 🔧 Part 2: Install Dependencies

### Step 4: Backend Setup
```bash
cd backend

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate.bat  # Windows
# source venv/bin/activate  # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Install AI feature dependencies
pip install huggingface-hub>=0.20.0
```

### Step 5: Frontend Setup
```bash
cd my-rn-app

# Install base dependencies
npm install

# Install AI feature dependencies
npm install react-native-view-shot@4.0.0-alpha.2 expo-media-library@17.0.3 expo-sharing@13.0.2
```

## ✅ Part 3: Test Setup

### Step 6: Test Backend
```bash
cd backend
venv\Scripts\activate.bat
python test_ai_dependencies.py
```

**Expected output:**
```
🧪 Testing AI Feature Dependencies
========================================
✅ base64: OK
✅ logging: OK
✅ Hugging Face Hub: OK
✅ Hugging Face InferenceClient: OK
✅ HF_TOKEN environment variable: OK

========================================
✅ All AI dependencies are properly installed!
🚀 You can now use the AI Explain feature.
```

### Step 7: Test Database Connection
```bash
# Still in backend directory
python -c "from core.database import get_supabase_client; client = get_supabase_client(); result = client.table('profiles').select('count').execute(); print('✅ Database connected')"
```

## 🚀 Part 4: Run the Complete App

### Option A: Automated Startup (Recommended)

From the project root directory:

**Windows:**
```cmd
.\start-dev.bat
```

**Linux/macOS:**
```bash
./start-dev.sh
```

This automatically:
- ✅ Starts backend server (port 8000)
- ✅ Creates ngrok tunnel for mobile access
- ✅ Sets environment variables
- ✅ Launches React Native app

### Option B: Manual Startup

If you prefer manual control:

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate.bat
python main.py
```

**Terminal 2 - ngrok (for mobile testing):**
```bash
ngrok http 8000
```

**Terminal 3 - Frontend:**
```bash
cd my-rn-app
# Replace with your ngrok URL from Terminal 2
EXPO_PUBLIC_API_URL="https://abc123.ngrok.io" npm start
```

## 📱 Part 5: Access the App

### Web Browser (Quick Testing)
1. After running the app, press `w` in the terminal
2. App opens in browser at `http://localhost:8081`

### Mobile Device (Recommended)
1. Install **Expo Go** app on your phone
2. Scan the QR code shown in terminal
3. Ensure phone and computer are on same WiFi

### Emulator
1. Press `a` for Android emulator
2. Press `i` for iOS simulator (macOS only)

## 🤖 Part 6: Test AI Explain Feature

1. **Register/Login** in the app
2. **Navigate** to any screen (Home, Learn, Community, Games, Analytics, Tokens)
3. **Look** for the purple ❓ button in lower right corner
4. **Tap** the Explain button
5. **Wait** for AI processing (1-3 seconds)
6. **Read** the AI description in the popup

**The AI will automatically describe everything visible on screen - no user input needed!**

## 🔍 Verification Checklist

### Backend Health Checks
- ✅ `http://localhost:8000/health` returns `{"status": "healthy"}`
- ✅ `http://localhost:8000/api/docs` shows API documentation
- ✅ Backend logs show no errors

### Frontend Health Checks  
- ✅ App loads without errors
- ✅ Authentication works (register/login)
- ✅ Navigation between screens works
- ✅ ExplainButton appears on all screens

### AI Feature Health Checks
- ✅ ExplainButton visible in lower right corner
- ✅ Button responds to taps
- ✅ Screenshot capture works
- ✅ AI generates descriptions
- ✅ Descriptions appear in popup

### ngrok Health Checks
- ✅ `http://127.0.0.1:4040` shows tunnel dashboard
- ✅ Mobile app can connect via ngrok URL

## 🐛 Troubleshooting

### Backend Issues
```bash
# Check backend logs
tail -f backend.log

# Test API directly
curl http://localhost:8000/health

# Restart backend
cd backend
venv\Scripts\activate.bat
python main.py
```

### Frontend Issues
```bash
# Clear Expo cache
cd my-rn-app
npx expo start --clear

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### AI Feature Issues
```bash
# Test AI dependencies
cd backend
python test_ai_dependencies.py

# Check HF token
echo $HF_TOKEN  # Should start with 'hf_'

# Test AI service manually
python -c "from services.ai.service import qwen_service; print('AI service OK')"
```

### Database Issues
```bash
# Test Supabase connection
cd backend
python -c "from core.database import get_supabase_client; print('DB OK')"

# Check environment variables
cat .env | grep SUPABASE
```

### ngrok Issues
```bash
# Check ngrok status
curl http://127.0.0.1:4040/api/tunnels

# Restart ngrok
pkill ngrok
ngrok http 8000
```

## 📊 Development Workflow

### Daily Development
1. **Start everything:** `.\start-dev.bat` (Windows) or `./start-dev.sh` (Linux/macOS)
2. **Make changes** to code
3. **Test features** including AI Explain button
4. **Check logs** for any errors

### Adding New Features
1. **Backend changes:** Edit files in `backend/services/`
2. **Frontend changes:** Edit files in `my-rn-app/components/`
3. **Database changes:** Update Supabase schema via SQL Editor
4. **AI modifications:** Edit `backend/services/ai/service.py`

## 🎯 Key Features Now Available

### Core App Features
- ✅ User authentication & profiles
- ✅ Educational content & progress tracking
- ✅ Community features & forums
- ✅ Token economy & shop
- ✅ Analytics & performance metrics
- ✅ Games & challenges

### NEW: AI Explain Feature
- ✅ **Automatic screenshot capture** on button press
- ✅ **AI-powered descriptions** using Qwen2.5-VL
- ✅ **No user input required** - just tap and get explanations
- ✅ **Works on all screens** - Home, Learn, Community, Games, Analytics, Tokens
- ✅ **Cloud-powered** - no local model downloads needed
- ✅ **Fast responses** - 1-3 seconds via Hugging Face API

## 🌟 Success Indicators

You know everything is working when:
- ✅ Backend shows "healthy" at `/health` endpoint
- ✅ Frontend loads without errors
- ✅ User can register/login successfully
- ✅ Navigation between all screens works
- ✅ AI Explain button appears on every screen
- ✅ Tapping button captures screenshot and shows AI description
- ✅ Mobile app connects via ngrok tunnel

**Congratulations! Your Project Reach app with AI Explain feature is now fully operational! 🎉**

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review logs in terminal/console
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed
5. Test individual components separately
