@echo off
REM DuetTrack AI Mobile App Build Script for Windows
REM This script builds the Android APK from your React web app

echo 🚀 DuetTrack AI Mobile App Builder
echo ====================================

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  npm command not found, trying npm.cmd...
    where npm.cmd >nul 2>nul
    if %errorlevel% neq 0 (
        echo ❌ npm is not installed
        echo Please install npm with Node.js
        pause
        exit /b 1
    ) else (
        echo ✅ Found npm.cmd, will use that
        set NPM_CMD=npm.cmd
    )
) else (
    set NPM_CMD=npm
)

REM Install Capacitor dependencies
echo 📦 Installing Capacitor dependencies...
call %NPM_CMD% install @capacitor/core @capacitor/cli @capacitor/android @capacitor/status-bar @capacitor/splash-screen
if %errorlevel% neq 0 (
    echo ❌ Failed to install Capacitor dependencies
    pause
    exit /b 1
)

REM Build web app
echo 🏗️  Building web application...
call %NPM_CMD% run build
if %errorlevel% neq 0 (
    echo ❌ Web app build failed
    pause
    exit /b 1
)

REM Initialize Capacitor
echo ⚡ Initializing Capacitor...
if not exist "capacitor.config.ts" (
    echo Creating capacitor.config.ts...
    (
        echo import { CapacitorConfig } from '@capacitor/cli';
        echo.
        echo const config: CapacitorConfig = {
        echo   appId: 'com.duetrack.ai',
        echo   appName: 'DuetTrack AI',
        echo   webDir: 'dist',
        echo   bundledWebRuntime: false,
        echo   android: {
        echo     allowMixedContent: true,
        echo     webContentsDebuggingEnabled: true,
        echo     cleartextTraffic: true,
        echo     buildOptions: {
        echo       keystorePath: './keystore/android.keystore',
        echo       keystorePassword: 'android',
        echo       keystoreAlias: 'android',
        echo       keystoreAliasPassword: 'android',
        echo       releaseType: 'APK'
        echo     }
        echo   },
        echo   plugins: {
        echo     SplashScreen: {
        echo       launchShowDuration: 2000,
        echo       launchAutoHide: true,
        echo       backgroundColor: "#ffffff",
        echo       androidSplashResourceName: "splash",
        echo       androidScaleType: "CENTER_CROP",
        echo       showSpinner: false,
        echo       androidSpinnerStyle: "large",
        echo       iosSpinnerStyle: "small",
        echo       spinnerColor: "#999999",
        echo       splashFullScreen: true,
        echo       splashImmersive: true,
        echo       layoutName: "launch_screen",
        echo       useDialog: true
        echo     }
        echo   }
        echo };
        echo.
        echo export default config;
    ) > capacitor.config.ts
)

if not exist "capacitor.config.json" (
    call %NPM_CMD% exec cap init "DuetTrack AI" "com.duetrack.ai" --web-dir=dist
)

REM Add Android platform
echo 🤖 Adding Android platform...
if not exist "android" (
    call %NPM_CMD% exec cap add android
    if %errorlevel% neq 0 (
        echo ❌ Failed to add Android platform
        pause
        exit /b 1
    )
) else (
    echo ✅ Android platform already exists
)

REM Sync Capacitor
echo 🔄 Syncing Capacitor...
call %NPM_CMD% exec cap sync
if %errorlevel% neq 0 (
    echo ❌ Failed to sync Capacitor
    pause
    exit /b 1
)

REM Build APK
echo 🏗️  Building Android APK...
cd android

echo Cleaning previous builds...
call gradlew clean
if %errorlevel% neq 0 (
    echo ❌ Failed to clean previous builds
    pause
    exit /b 1
)

echo Building debug APK...
call gradlew assembleDebug
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
echo   call %NPM_CMD% exec cap open android
echo.
echo 3. Test on device/emulator
echo.
echo 📖 For more information, see MOBILE_BUILD_GUIDE.md
pause