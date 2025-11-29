@echo off
echo 🚀 Setting up DuetTrack AI for Android Mobile App
echo =================================================

echo 📦 Step 1: Installing Capacitor dependencies...
call npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/status-bar @capacitor/splash-screen

echo 🏗️  Step 2: Building web app...
call npm run build

echo ⚡ Step 3: Initializing Capacitor...
call npx cap init "DuetTrack AI" "com.duetrack.ai" --web-dir=dist

echo 🤖 Step 4: Adding Android platform...
call npx cap add android

echo 🔄 Step 5: Syncing Capacitor...
call npx cap sync

echo ✅ Mobile setup completed!
echo.
echo 📱 Next steps:
echo 1. Open Android Studio
echo 2. Open the android/ folder
echo 3. Wait for Gradle sync
echo 4. Run on emulator or device
echo.
echo 🔧 Useful commands:
echo npm run mobile:sync    - Sync Capacitor
echo npm run mobile:build   - Build APK
echo npm run mobile:open    - Open in Android Studio
pause