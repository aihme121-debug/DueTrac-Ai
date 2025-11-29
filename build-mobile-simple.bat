@echo off
REM DuetTrack AI Mobile App Build Script for Windows
REM This script builds the Android APK from your React web app

echo 🚀 DuetTrack AI Mobile App Builder
echo ====================================

echo 📦 Installing Capacitor dependencies...
call npm.cmd install @capacitor/status-bar@6.0.2 @capacitor/splash-screen@6.0.2 --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ❌ Failed to install Capacitor dependencies
    pause
    exit /b 1
)

echo 🏗️  Building web application...
call npm.cmd run build
if %errorlevel% neq 0 (
    echo ❌ Web app build failed
    pause
    exit /b 1
)

echo ⚡ Initializing Capacitor...
if not exist "capacitor.config.json" (
    call npm.cmd exec cap init "DuetTrack AI" "com.duetrack.ai" --web-dir=dist
)

echo 🤖 Adding Android platform...
if not exist "android" (
    call npm.cmd exec cap add android
    if %errorlevel% neq 0 (
        echo ❌ Failed to add Android platform
        pause
        exit /b 1
    )
) else (
    echo ✅ Android platform already exists
)

echo 🔄 Syncing Capacitor...
call npm.cmd exec cap sync
if %errorlevel% neq 0 (
    echo ❌ Failed to sync Capacitor
    pause
    exit /b 1
)

echo 🏗️  Building Android APK...
cd android

echo Cleaning previous builds...
call gradlew.bat clean
if %errorlevel% neq 0 (
    echo ❌ Failed to clean previous builds
    pause
    exit /b 1
)

echo Building debug APK...
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo ❌ APK build failed
    pause
    exit /b 1
)

REM Check if APK was created
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    echo ✅ APK built successfully!
    echo 📱 APK location: %cd%\app\build\outputs\apk\debug\app-debug.apk
    
    REM Get file size
    for %%I in ("app\build\outputs\apk\debug\app-debug.apk") do (
        echo 📊 APK size: %%~zI bytes
    )
) else (
    echo ❌ APK file not found
)

cd ..

echo.
echo ✅ Mobile app build completed successfully!
echo.
echo 📱 Next steps:
echo 1. Install the APK on your device:
echo    adb install android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo 2. Or open in Android Studio:
echo    npm.cmd exec cap open android
echo.
echo 3. Test on device/emulator
echo.
echo 📖 For more information, see MOBILE_BUILD_GUIDE.md
pause