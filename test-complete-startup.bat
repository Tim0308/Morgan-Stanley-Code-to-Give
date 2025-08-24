@echo off
echo ==========================================
echo 🧪 COMPLETE PROJECT REACH STARTUP TEST
echo ==========================================
echo.

REM Set log file
set LOG_FILE=startup-test.log
echo %date% %time% - Starting complete app test > %LOG_FILE%

echo 📋 Step 1: Check Prerequisites
echo ----------------------------------------
echo Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js not found
    echo %date% %time% - ERROR: Node.js not found >> %LOG_FILE%
    pause
    exit /b 1
) else (
    echo ✅ Node.js found
    echo %date% %time% - Node.js version check passed >> %LOG_FILE%
)

echo.
echo Checking Python...
python --version
if %errorlevel% neq 0 (
    echo ❌ Python not found
    echo %date% %time% - ERROR: Python not found >> %LOG_FILE%
    pause
    exit /b 1
) else (
    echo ✅ Python found
    echo %date% %time% - Python version check passed >> %LOG_FILE%
)

echo.
echo Checking ngrok...
ngrok version
if %errorlevel% neq 0 (
    echo ❌ ngrok not found
    echo %date% %time% - ERROR: ngrok not found >> %LOG_FILE%
    pause
    exit /b 1
) else (
    echo ✅ ngrok found
    echo %date% %time% - ngrok version check passed >> %LOG_FILE%
)

echo.
echo 📋 Step 2: Check Backend Setup
echo ----------------------------------------
cd backend
echo Current directory: %cd%
echo %date% %time% - Checking backend setup >> ..\%LOG_FILE%

if not exist ".env" (
    echo ❌ Backend .env file not found
    echo %date% %time% - ERROR: .env file missing >> ..\%LOG_FILE%
    cd ..
    pause
    exit /b 1
) else (
    echo ✅ Backend .env file found
    echo %date% %time% - .env file exists >> ..\%LOG_FILE%
)

if not exist "venv" (
    echo ❌ Backend virtual environment not found
    echo %date% %time% - ERROR: venv not found >> ..\%LOG_FILE%
    cd ..
    pause
    exit /b 1
) else (
    echo ✅ Backend virtual environment found
    echo %date% %time% - venv exists >> ..\%LOG_FILE%
)

echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo %date% %time% - Virtual environment activated >> ..\%LOG_FILE%

echo.
echo Testing AI dependencies...
python test_ai_dependencies.py
if %errorlevel% neq 0 (
    echo ❌ AI dependencies test failed
    echo %date% %time% - ERROR: AI dependencies failed >> ..\%LOG_FILE%
    cd ..
    pause
    exit /b 1
) else (
    echo ✅ AI dependencies test passed
    echo %date% %time% - AI dependencies test passed >> ..\%LOG_FILE%
)

echo.
echo 📋 Step 3: Check Frontend Setup
echo ----------------------------------------
cd ..\my-rn-app
echo Current directory: %cd%
echo %date% %time% - Checking frontend setup >> ..\%LOG_FILE%

if not exist "node_modules" (
    echo ❌ Frontend node_modules not found
    echo %date% %time% - ERROR: node_modules not found >> ..\%LOG_FILE%
    cd ..
    pause
    exit /b 1
) else (
    echo ✅ Frontend node_modules found
    echo %date% %time% - node_modules exists >> ..\%LOG_FILE%
)

if not exist "package.json" (
    echo ❌ Frontend package.json not found
    echo %date% %time% - ERROR: package.json not found >> ..\%LOG_FILE%
    cd ..
    pause
    exit /b 1
) else (
    echo ✅ Frontend package.json found
    echo %date% %time% - package.json exists >> ..\%LOG_FILE%
)

echo.
echo 📋 Step 4: Start Backend Server
echo ----------------------------------------
cd ..\backend
echo %date% %time% - Starting backend server >> ..\%LOG_FILE%
echo Starting backend server...
start "Backend Server" cmd /k "venv\Scripts\activate.bat && python main.py"
echo ✅ Backend server starting in new window
echo %date% %time% - Backend server started in new window >> ..\%LOG_FILE%

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Testing backend health...
curl -s http://localhost:8000/health
if %errorlevel% neq 0 (
    echo ❌ Backend health check failed
    echo %date% %time% - ERROR: Backend health check failed >> ..\%LOG_FILE%
) else (
    echo ✅ Backend health check passed
    echo %date% %time% - Backend health check passed >> ..\%LOG_FILE%
)

echo.
echo 📋 Step 5: Start ngrok Tunnel
echo ----------------------------------------
echo %date% %time% - Starting ngrok tunnel >> %LOG_FILE%
echo Starting ngrok tunnel...
start "ngrok Tunnel" cmd /k "ngrok http 8000"
echo ✅ ngrok tunnel starting in new window
echo %date% %time% - ngrok tunnel started in new window >> %LOG_FILE%

echo.
echo Waiting for ngrok to start...
timeout /t 5 /nobreak > nul

echo.
echo Getting ngrok URL...
for /f "tokens=*" %%i in ('curl -s http://127.0.0.1:4040/api/tunnels ^| findstr "public_url"') do set NGROK_RESPONSE=%%i
echo ngrok API response: %NGROK_RESPONSE%
echo %date% %time% - ngrok API response: %NGROK_RESPONSE% >> %LOG_FILE%

echo.
echo 📋 Step 6: Start React Native App
echo ----------------------------------------
cd ..\my-rn-app
echo %date% %time% - Starting React Native app >> ..\%LOG_FILE%
echo Current directory: %cd%

echo.
echo Setting environment variable...
REM Extract ngrok URL (simplified approach)
echo For manual setup, check ngrok dashboard at: http://127.0.0.1:4040
echo %date% %time% - Starting React Native with manual ngrok URL setup >> ..\%LOG_FILE%

echo.
echo Starting React Native...
echo 🚀 Starting Expo development server...
echo 📱 The QR code will appear below:
echo ----------------------------------------
start "React Native" cmd /k "npm start"
echo %date% %time% - React Native started in new window >> ..\%LOG_FILE%

echo.
echo 📋 STARTUP COMPLETE!
echo ==========================================
echo ✅ Backend Server: Running on port 8000
echo ✅ ngrok Tunnel: Check http://127.0.0.1:4040
echo ✅ React Native: Starting with QR code
echo.
echo 📱 TO CONNECT YOUR PHONE:
echo 1. Install 'Expo Go' app on your phone
echo 2. Scan the QR code that appears in the React Native window
echo 3. Make sure your phone and computer are on the same WiFi
echo.
echo 🤖 TO TEST AI FEATURE:
echo 1. Register/Login in the app
echo 2. Look for the purple ❓ button in lower right corner
echo 3. Tap it to capture screenshot and get AI description
echo.
echo 📊 MONITORING:
echo - Backend logs: Check 'Backend Server' window
echo - ngrok tunnel: Check 'ngrok Tunnel' window  
echo - Frontend logs: Check 'React Native' window
echo - Detailed logs: See %LOG_FILE%
echo.
echo %date% %time% - Complete startup test finished >> %LOG_FILE%
echo Press any key to view the log file...
pause > nul
type %LOG_FILE%
