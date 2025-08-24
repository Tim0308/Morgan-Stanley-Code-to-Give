@echo off
echo ==========================================
echo 🤖 FULL AI PIPELINE TEST
echo ==========================================
echo.

echo 📋 Step 1: Check Backend Health
echo ----------------------------------------
curl -s http://localhost:8000/health
echo.

echo 📋 Step 2: Check AI Dependencies
echo ----------------------------------------
cd backend
call venv\Scripts\activate.bat
python test_ai_dependencies.py
echo.

echo 📋 Step 3: Test AI Service Directly
echo ----------------------------------------
python test_hf_api.py
echo.

echo 📋 Step 4: Check ngrok Tunnel
echo ----------------------------------------
curl -s http://127.0.0.1:4040/api/tunnels | findstr "public_url"
echo.

echo ==========================================
echo ✅ PIPELINE TEST COMPLETE
echo ==========================================
echo.
echo 📱 Now test in the React Native app:
echo 1. The app should load normally (not test mode)
echo 2. Register/Login if needed
echo 3. Look for the purple ❓ button in lower right
echo 4. Tap it on any screen to test AI explain
echo 5. Watch the console logs for detailed debugging
echo.
echo 🔍 Expected logs in React Native:
echo - "PageWrapper: Component mounted"
echo - "ExplainButton: Starting screenshot capture process"
echo - "ExplainButton: Screenshot captured successfully"
echo - "ExplainButton: AI explanation received"
echo.
pause
