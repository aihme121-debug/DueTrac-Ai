# Mobile App Setup Script for PowerShell
Write-Host "🚀 Setting up DuetTrack AI for Android Mobile App" -ForegroundColor Magenta
Write-Host "=================================================" -ForegroundColor Magenta

# Function to run commands with error handling
function Run-Command {
    param(
        [string]$Command,
        [string]$Description
    )
    
    Write-Host "`n📦 $Description..." -ForegroundColor Cyan
    try {
        Invoke-Expression $Command
        Write-Host "✅ $Description completed successfully" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ $Description failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Step 1: Install Capacitor dependencies
Write-Host "`n📦 Installing Capacitor dependencies..." -ForegroundColor Blue
$deps = @(
    "@capacitor/core",
    "@capacitor/cli", 
    "@capacitor/android",
    "@capacitor/status-bar",
    "@capacitor/splash-screen"
)

foreach ($dep in $deps) {
    if (!(Run-Command "npm install $dep" "Installing $dep")) {
        Write-Host "❌ Failed to install $dep" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Build web app
if (!(Run-Command "npm run build" "Building web app")) {
    Write-Host "❌ Failed to build web app" -ForegroundColor Red
    exit 1
}

# Step 3: Initialize Capacitor
if (!(Run-Command "npx cap init `"DuetTrack AI`" `"com.duetrack.ai`" --web-dir=dist" "Initializing Capacitor")) {
    Write-Host "❌ Failed to initialize Capacitor" -ForegroundColor Red
    exit 1
}

# Step 4: Add Android platform
if (!(Run-Command "npx cap add android" "Adding Android platform")) {
    Write-Host "❌ Failed to add Android platform" -ForegroundColor Red
    exit 1
}

# Step 5: Sync Capacitor
if (!(Run-Command "npx cap sync" "Syncing Capacitor")) {
    Write-Host "❌ Failed to sync Capacitor" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Mobile setup completed successfully!" -ForegroundColor Green
Write-Host "`n📱 Next steps:" -ForegroundColor Cyan
Write-Host "1. Open Android Studio" -ForegroundColor White
Write-Host "2. Open the android/ folder" -ForegroundColor White
Write-Host "3. Wait for Gradle sync" -ForegroundColor White
Write-Host "4. Run on emulator or device" -ForegroundColor White
Write-Host "`n🔧 Useful commands:" -ForegroundColor Cyan
Write-Host "npm run mobile:sync    - Sync Capacitor" -ForegroundColor White
Write-Host "npm run mobile:build   - Build APK" -ForegroundColor White
Write-Host "npm run mobile:open    - Open in Android Studio" -ForegroundColor White

Read-Host "`nPress Enter to continue"