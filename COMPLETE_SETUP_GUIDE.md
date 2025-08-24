# 🚀 Complete Setup Guide for Project Reach App

This guide will walk you through setting up and running the entire Project Reach educational app with the new AI Explain feature.

## 📋 Prerequisites

### Required Software
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python 3.8+** - [Download](https://python.org/)
- **Git** - [Download](https://git-scm.com/)
- **Expo CLI** - Install with `npm install -g @expo/cli`
- **ngrok** - [Download](https://ngrok.com/) (for mobile testing)

### Account Requirements
- **Supabase Account** - [Sign up](https://supabase.com/)
- **Expo Account** (optional but recommended) - [Sign up](https://expo.dev/)

## 🏗️ Step-by-Step Setup

### Step 1: Clone and Navigate to Project
```bash
# If you haven't cloned yet
git clone <your-repo-url>
cd T1V1

# If already cloned, navigate to the project
cd path/to/T1V1
```

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Run Backend Setup Script
**On Windows:**
```cmd
setup_backend.sh
```

**On Linux/macOS:**
```bash
chmod +x setup_backend.sh
./setup_backend.sh
```

This script will:
- ✅ Check Python installation
- ✅ Create virtual environment
- ✅ Install dependencies
- ✅ Create .env template
- ✅ Test database connection

#### 2.3 Configure Environment Variables
If the script creates a `.env` file, update it with your Supabase credentials:

```env
# Project Reach Environment Configuration
DEBUG=true

# Supabase Configuration - UPDATE THESE VALUES
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here
SUPABASE_ANON_KEY=your-anon-key-here

# CORS Origins (for development)
CORS_ORIGINS=http://localhost:8081,http://localhost:19006,http://10.0.2.2:8081
```

**To get Supabase credentials:**
1. Go to [supabase.com](https://supabase.com)
2. Open your project dashboard
3. Go to Settings → API
4. Copy URL and keys

#### 2.4 Install AI Feature Dependencies
Navigate back to the root directory and run:

**On Windows:**
```cmd
cd ..
setup-ai-feature.bat
```

**On Linux/macOS:**
```bash
cd ..
./setup-ai-feature.sh
```

This will install:
- React Native screenshot packages
- Qwen2.5-VL AI model dependencies
- Additional Python packages for AI processing

### Step 3: Frontend Setup

#### 3.1 Navigate to React Native App
```bash
cd my-rn-app
```

#### 3.2 Install Dependencies
```bash
npm install
```

### Step 4: Database Setup

#### 4.1 Create Supabase Tables
In your Supabase dashboard:
1. Go to the SQL Editor
2. Run the schema files from `backend/supabase/`
3. Run any seed data scripts if needed

#### 4.2 Set Up Authentication
1. In Supabase dashboard, go to Authentication
2. Configure providers (email/password is enabled by default)
3. Set up any custom auth flows if needed

### Step 5: Running the Complete Application

#### 5.1 Quick Start (Recommended)
From the root directory (`T1V1/`), run the automated startup script:

**On Windows:**
```cmd
start-dev.bat
```

**On Linux/macOS:**
```bash
./start-dev.sh
```

This script automatically:
- ✅ Checks if backend is running (port 8000)
- ✅ Starts backend if not running
- ✅ Checks if ngrok tunnel is active
- ✅ Starts ngrok tunnel if needed
- ✅ Sets environment variables
- ✅ Starts React Native app

#### 5.2 Manual Start (Alternative)

If you prefer to start services manually:

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate.bat
python main.py
```

**Terminal 2 - ngrok (for mobile testing):**
```bash
ngrok http 8000
```

**Terminal 3 - Frontend:**
```bash
cd my-rn-app
EXPO_PUBLIC_API_URL="http://your-ngrok-url" npm start
```

## 📱 Testing the App

### 1. Web Browser (Fastest for testing)
1. After running the app, press `w` in the terminal
2. The app will open in your web browser
3. You can test all features including the AI Explain button

### 2. Physical Device (Recommended)
1. Install Expo Go app on your phone
2. Scan the QR code shown in the terminal
3. The app will load on your device

### 3. Emulator/Simulator
1. Set up Android Studio (Android) or Xcode (iOS)
2. Start an emulator/simulator
3. Press `a` (Android) or `i` (iOS) in the terminal

## 🤖 Testing the AI Explain Feature

1. **Login/Register** in the app
2. **Navigate** to any screen (Home, Learn, Community, etc.)
3. **Look** for the purple button with ❓ in the lower right corner
4. **Tap** the Explain button
5. **Wait** for the AI to process the screenshot
6. **Read** the generated explanation

**Note:** The first time you use the AI feature, it will download the Qwen2.5-VL model (~15GB). This may take several minutes.

## 🔧 Troubleshooting

### Common Issues

#### Backend Issues
```bash
# Check if backend is running
curl http://localhost:8000/health

# View backend logs
tail -f backend.log

# Restart backend
cd backend
source venv/bin/activate
python main.py
```

#### Frontend Issues
```bash
# Clear Expo cache
cd my-rn-app
npx expo start --clear

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### AI Feature Issues
```bash
# Check AI dependencies
cd backend
source venv/bin/activate
python -c "import transformers; print('✅ Transformers installed')"
python -c "import torch; print('✅ PyTorch installed')"

# Test AI service manually
curl -X POST http://localhost:8000/api/v1/ai/explain-screenshot \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"image_data": "base64_image_here"}'
```

#### ngrok Issues
```bash
# Check ngrok status
curl http://127.0.0.1:4040/api/tunnels

# Restart ngrok
pkill ngrok
ngrok http 8000
```

### Port Conflicts
If you get port conflicts:
- Backend (8000): Change in `backend/main.py`
- React Native (8081): Use `--port` flag: `npm start --port 8082`
- ngrok (4040): Use `--web-addr` flag: `ngrok http 8000 --web-addr localhost:4041`

### Environment Variables
Make sure these are set correctly:
```bash
# Check current environment
echo $EXPO_PUBLIC_API_URL

# Set manually if needed (replace with your ngrok URL)
export EXPO_PUBLIC_API_URL="https://abc123.ngrok.io"
```

## 📊 Development Workflow

### Daily Development
1. **Start the app:**
   ```bash
   ./start-dev.sh  # or start-dev.bat on Windows
   ```

2. **Make changes** to frontend or backend code

3. **Test changes:**
   - Frontend: Auto-reloads with Expo
   - Backend: Auto-reloads with uvicorn --reload

4. **Test AI feature** on different screens

### Adding New Features
1. **Frontend changes:** Edit files in `my-rn-app/`
2. **Backend API changes:** Edit files in `backend/services/`
3. **Database changes:** Update Supabase schema
4. **AI improvements:** Modify `backend/services/ai/`

## 🚀 Production Deployment

### Backend Deployment
- Use platforms like Railway, Render, or AWS
- Set production environment variables
- Configure proper CORS origins
- Set up SSL certificates

### Frontend Deployment
- Build for production: `expo build`
- Deploy to app stores or web hosting
- Update API URLs to production endpoints

## 📚 Additional Resources

- **Expo Documentation:** [docs.expo.dev](https://docs.expo.dev)
- **FastAPI Documentation:** [fastapi.tiangolo.com](https://fastapi.tiangolo.com)
- **Supabase Documentation:** [supabase.com/docs](https://supabase.com/docs)
- **Qwen2.5-VL Model:** [Hugging Face](https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct)

## 🆘 Getting Help

1. **Check logs:** Backend logs in `backend.log`, frontend logs in terminal
2. **Review documentation:** Check this guide and feature-specific docs
3. **Test individual components:** Use health endpoints and manual testing
4. **Check dependencies:** Ensure all packages are properly installed

---

**Happy coding! 🎉** Your Project Reach app with AI Explain feature is now ready to help parents and students navigate the educational platform with intelligent assistance.
