@echo off
REM Batch script to start Project Reach Development Environment

echo 🚀 Starting Project Reach Development Environment
echo ==================================================

REM 1. Check if backend is running
for /f "tokens=*" %%a in ('netstat -ano ^| findstr :8000') do set PORTINUSE=1
if defined PORTINUSE (
    echo Backend is running on port 8000
) else (
    echo Backend not running. Starting backend...
    pushd backend
    call venv\Scripts\activate.bat
    start "Backend" python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 > ..\backend.log 2>&1
    echo Waiting for backend to start...
    timeout /t 3 >nul
    popd
)

REM 2. Check if ngrok is running
set NGROK_URL=
for /f "delims=" %%i in ('curl -s http://127.0.0.1:4040/api/tunnels ^| python -c "import sys, json; data=json.load(sys.stdin); print(data['tunnels'][0]['public_url']) if data.get('tunnels') else print('')"') do set NGROK_URL=%%i

if "%NGROK_URL%"=="" (
    echo ngrok not running. Starting ngrok...
    start "ngrok" ngrok http 8000 > ngrok.log 2>&1
    echo Waiting for ngrok to start...
    timeout /t 10 >nul
    for /f "delims=" %%i in ('curl -s http://127.0.0.1:4040/api/tunnels ^| python -c "import sys, json; data=json.load(sys.stdin); print(data['tunnels'][0]['public_url']) if data.get('tunnels') else print('')"') do set NGROK_URL=%%i
)
if "%NGROK_URL%"=="" (
    echo Failed to start ngrok
    exit /b 1
)
echo ✅ ngrok tunnel: %NGROK_URL%

REM 3. Set environment variable and start React Native
set EXPO_PUBLIC_API_URL=%NGROK_URL%
echo Setting API URL environment variable...

echo Starting React Native app...
pushd my-rn-app
set EXPO_PUBLIC_API_URL=%NGROK_URL%
start "ReactNative" cmd /c "npx expo start --tunnel"
popd
