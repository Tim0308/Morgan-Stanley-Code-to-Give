@echo off
echo ==========================================
echo 🧪 QUICK PROJECT REACH STARTUP TEST
echo ==========================================
echo.

echo 📋 Step 1: Check if backend is running
echo ----------------------------------------
curl -s http://localhost:8000/health > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is already running
) else (
    echo ❌ Backend not running - starting it...
    cd backend
    start "Backend Server" cmd /k "venv\Scripts\activate.bat && python main.py"
    cd ..
    echo ⏳ Waiting 10 seconds for backend to start...
    timeout /t 10 /nobreak > nul
)

echo.
echo 📋 Step 2: Check if ngrok is running
echo ----------------------------------------
curl -s http://127.0.0.1:4040/api/tunnels > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ ngrok is already running
) else (
    echo ❌ ngrok not running - starting it...
    start "ngrok Tunnel" cmd /k "ngrok http 8000"
    echo ⏳ Waiting 8 seconds for ngrok to start...
    timeout /t 8 /nobreak > nul
)

echo.
echo 📋 Step 3: Get ngrok URL and start React Native
echo ----------------------------------------
curl -s http://127.0.0.1:4040/api/tunnels > temp_ngrok.json 2>nul

if exist temp_ngrok.json (
    echo ✅ Got ngrok response
    type temp_ngrok.json | findstr "public_url"
    del temp_ngrok.json
) else (
    echo ❌ Could not get ngrok URL
    echo 📌 Check manually at: http://127.0.0.1:4040
)

echo.
echo 📋 Step 4: Starting React Native App
echo ----------------------------------------
cd my-rn-app
echo Current directory: %cd%
echo.
echo 🚀 Starting React Native...
echo 📱 QR code should appear below:
echo ========================================

REM Start npm in this same window so we can see the QR code
npm start

echo.
echo If QR code didn't appear, check:
echo 1. Node.js is installed: node --version
echo 2. Dependencies installed: npm install
echo 3. No port conflicts
pause
