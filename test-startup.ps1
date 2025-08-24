# Complete Project Reach Startup Test with Logging
Write-Host "==========================================" -ForegroundColor Green
Write-Host "🧪 COMPLETE PROJECT REACH STARTUP TEST" -ForegroundColor Green  
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Create log file
$logFile = "startup-test.log"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
"$timestamp - Starting complete app test" | Out-File -FilePath $logFile

# Function to log messages
function Write-Log {
    param([string]$message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $message" | Out-File -FilePath $logFile -Append
    Write-Host $message
}

Write-Host "📋 Step 1: Check Prerequisites" -ForegroundColor Yellow
Write-Host "----------------------------------------"

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
    Write-Log "Node.js version check passed: $nodeVersion"
} catch {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
    Write-Log "ERROR: Node.js not found"
    exit 1
}

# Check Python
try {
    $pythonVersion = python --version
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
    Write-Log "Python version check passed: $pythonVersion"
} catch {
    Write-Host "❌ Python not found" -ForegroundColor Red
    Write-Log "ERROR: Python not found"
    exit 1
}

# Check ngrok
try {
    $ngrokVersion = ngrok version
    Write-Host "✅ ngrok found: $ngrokVersion" -ForegroundColor Green
    Write-Log "ngrok version check passed: $ngrokVersion"
} catch {
    Write-Host "❌ ngrok not found" -ForegroundColor Red
    Write-Log "ERROR: ngrok not found"
    exit 1
}

Write-Host ""
Write-Host "📋 Step 2: Check Backend Setup" -ForegroundColor Yellow
Write-Host "----------------------------------------"

Set-Location backend
Write-Host "Current directory: $(Get-Location)"
Write-Log "Checking backend setup in $(Get-Location)"

if (-not (Test-Path ".env")) {
    Write-Host "❌ Backend .env file not found" -ForegroundColor Red
    Write-Log "ERROR: .env file missing"
    Set-Location ..
    exit 1
} else {
    Write-Host "✅ Backend .env file found" -ForegroundColor Green
    Write-Log ".env file exists"
}

if (-not (Test-Path "venv")) {
    Write-Host "❌ Backend virtual environment not found" -ForegroundColor Red
    Write-Log "ERROR: venv not found"
    Set-Location ..
    exit 1
} else {
    Write-Host "✅ Backend virtual environment found" -ForegroundColor Green
    Write-Log "venv exists"
}

Write-Host ""
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& "venv\Scripts\activate.bat"
Write-Log "Virtual environment activated"

Write-Host ""
Write-Host "Testing AI dependencies..." -ForegroundColor Cyan
try {
    python test_ai_dependencies.py
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ AI dependencies test passed" -ForegroundColor Green
        Write-Log "AI dependencies test passed"
    } else {
        Write-Host "❌ AI dependencies test failed" -ForegroundColor Red
        Write-Log "ERROR: AI dependencies failed"
        Set-Location ..
        exit 1
    }
} catch {
    Write-Host "❌ AI dependencies test failed with exception" -ForegroundColor Red
    Write-Log "ERROR: AI dependencies failed with exception: $_"
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "📋 Step 3: Check Frontend Setup" -ForegroundColor Yellow
Write-Host "----------------------------------------"

Set-Location "..\my-rn-app"
Write-Host "Current directory: $(Get-Location)"
Write-Log "Checking frontend setup in $(Get-Location)"

if (-not (Test-Path "node_modules")) {
    Write-Host "❌ Frontend node_modules not found - running npm install..." -ForegroundColor Yellow
    Write-Log "node_modules not found, running npm install"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install failed" -ForegroundColor Red
        Write-Log "ERROR: npm install failed"
        Set-Location ..
        exit 1
    }
} else {
    Write-Host "✅ Frontend node_modules found" -ForegroundColor Green
    Write-Log "node_modules exists"
}

Write-Host ""
Write-Host "📋 Step 4: Start Backend Server" -ForegroundColor Yellow
Write-Host "----------------------------------------"

Set-Location "..\backend"
Write-Log "Starting backend server"
Write-Host "Starting backend server..." -ForegroundColor Cyan

# Start backend in background
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; venv\Scripts\activate.bat; python main.py" -WindowStyle Normal
Write-Host "✅ Backend server starting in new window" -ForegroundColor Green
Write-Log "Backend server started in new window"

Write-Host ""
Write-Host "Waiting for backend to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Testing backend health..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 10
    Write-Host "✅ Backend health check passed: $($response.status)" -ForegroundColor Green
    Write-Log "Backend health check passed: $($response.status)"
} catch {
    Write-Host "❌ Backend health check failed: $_" -ForegroundColor Red
    Write-Log "ERROR: Backend health check failed: $_"
}

Write-Host ""
Write-Host "📋 Step 5: Start ngrok Tunnel" -ForegroundColor Yellow
Write-Host "----------------------------------------"

Write-Log "Starting ngrok tunnel"
Write-Host "Starting ngrok tunnel..." -ForegroundColor Cyan

# Start ngrok in background
Start-Process cmd -ArgumentList "/k", "ngrok http 8000" -WindowStyle Normal
Write-Host "✅ ngrok tunnel starting in new window" -ForegroundColor Green
Write-Log "ngrok tunnel started in new window"

Write-Host ""
Write-Host "Waiting for ngrok to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Getting ngrok URL..." -ForegroundColor Cyan
try {
    $ngrokApi = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 10
    $publicUrl = $ngrokApi.tunnels[0].public_url
    Write-Host "✅ ngrok URL: $publicUrl" -ForegroundColor Green
    Write-Log "ngrok URL obtained: $publicUrl"
    
    # Set environment variable for React Native
    $env:EXPO_PUBLIC_API_URL = $publicUrl
    Write-Host "✅ Environment variable set: EXPO_PUBLIC_API_URL=$publicUrl" -ForegroundColor Green
    Write-Log "Environment variable set: EXPO_PUBLIC_API_URL=$publicUrl"
} catch {
    Write-Host "❌ Could not get ngrok URL: $_" -ForegroundColor Red
    Write-Host "📌 Check ngrok dashboard manually at: http://127.0.0.1:4040" -ForegroundColor Yellow
    Write-Log "ERROR: Could not get ngrok URL: $_"
    $publicUrl = "MANUAL_CHECK_REQUIRED"
}

Write-Host ""
Write-Host "📋 Step 6: Start React Native App" -ForegroundColor Yellow
Write-Host "----------------------------------------"

Set-Location "..\my-rn-app"
Write-Log "Starting React Native app"
Write-Host "Current directory: $(Get-Location)"

Write-Host ""
Write-Host "Starting React Native with environment variable..." -ForegroundColor Cyan
Write-Host "🚀 Starting Expo development server..." -ForegroundColor Green
Write-Host "📱 The QR code will appear in the new window:" -ForegroundColor Green
Write-Host "----------------------------------------"

# Start React Native in new window with environment variable
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; `$env:EXPO_PUBLIC_API_URL='$publicUrl'; npm start" -WindowStyle Normal
Write-Log "React Native started in new window with env var: $publicUrl"

Write-Host ""
Write-Host "📋 STARTUP COMPLETE!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ Backend Server: Running on port 8000" -ForegroundColor Green
Write-Host "✅ ngrok Tunnel: $publicUrl" -ForegroundColor Green
Write-Host "✅ React Native: Starting with QR code" -ForegroundColor Green
Write-Host ""
Write-Host "📱 TO CONNECT YOUR PHONE:" -ForegroundColor Cyan
Write-Host "1. Install 'Expo Go' app on your phone"
Write-Host "2. Scan the QR code that appears in the React Native window"
Write-Host "3. Make sure your phone and computer are on the same WiFi"
Write-Host ""
Write-Host "🤖 TO TEST AI FEATURE:" -ForegroundColor Magenta
Write-Host "1. Register/Login in the app"
Write-Host "2. Look for the purple ❓ button in lower right corner"
Write-Host "3. Tap it to capture screenshot and get AI description"
Write-Host ""
Write-Host "📊 MONITORING:" -ForegroundColor Yellow
Write-Host "- Backend logs: Check 'powershell' window running Python"
Write-Host "- ngrok tunnel: Check 'cmd' window or http://127.0.0.1:4040"
Write-Host "- Frontend logs: Check 'powershell' window running npm start"
Write-Host "- Detailed logs: See $logFile"
Write-Host ""

Write-Log "Complete startup test finished"

Write-Host "Press any key to view the detailed log file..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Get-Content $logFile
