#!/bin/bash

# DuetTrack AI Mobile App Build Script
# This script builds the Android APK from your React web app

set -e  # Exit on any error

echo "🚀 DuetTrack AI Mobile App Builder"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check if Android SDK is available
    if [ -z "$ANDROID_SDK_ROOT" ] && [ -z "$ANDROID_HOME" ]; then
        log_warning "Android SDK not found. Please install Android Studio and set ANDROID_SDK_ROOT"
    fi
    
    log_success "Prerequisites check completed"
}

# Install dependencies
install_dependencies() {
    log_info "Installing Capacitor dependencies..."
    
    # Install Capacitor if not already installed
    if ! npm list @capacitor/core &> /dev/null; then
        npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/status-bar @capacitor/splash-screen
    fi
    
    log_success "Dependencies installed"
}

# Build web app
build_web_app() {
    log_info "Building web application..."
    
    if ! npm run build; then
        log_error "Web app build failed"
        exit 1
    fi
    
    log_success "Web app built successfully"
}

# Initialize Capacitor
initialize_capacitor() {
    log_info "Initializing Capacitor..."
    
    # Check if capacitor.config.ts exists
    if [ ! -f "capacitor.config.ts" ]; then
        log_info "Creating capacitor.config.ts..."
        cat > capacitor.config.ts << 'EOF'
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.duetrack.ai',
  appName: 'DuetTrack AI',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
    cleartextTraffic: true,
    buildOptions: {
      keystorePath: './keystore/android.keystore',
      keystorePassword: 'android',
      keystoreAlias: 'android',
      keystoreAliasPassword: 'android',
      releaseType: 'APK'
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true
    }
  }
};

export default config;
EOF
    fi
    
    # Initialize Capacitor if not already initialized
    if [ ! -f "capacitor.config.json" ]; then
        npx cap init "DuetTrack AI" "com.duetrack.ai" --web-dir=dist
    fi
    
    log_success "Capacitor initialized"
}

# Add Android platform
add_android_platform() {
    log_info "Adding Android platform..."
    
    if [ ! -d "android" ]; then
        npx cap add android
    else
        log_warning "Android platform already exists"
    fi
    
    log_success "Android platform added"
}

# Sync Capacitor
sync_capacitor() {
    log_info "Syncing Capacitor..."
    
    npx cap sync
    
    log_success "Capacitor synced"
}

# Build APK
build_apk() {
    log_info "Building Android APK..."
    
    cd android
    
    # Clean previous builds
    ./gradlew clean
    
    # Build debug APK
    if ./gradlew assembleDebug; then
        log_success "APK built successfully"
        
        # Show APK location
        APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
        if [ -f "$APK_PATH" ]; then
            log_info "APK location: $(pwd)/$APK_PATH"
            log_info "APK size: $(ls -lh $APK_PATH | awk '{print $5}')"
        fi
    else
        log_error "APK build failed"
        cd ..
        exit 1
    fi
    
    cd ..
}

# Generate icons
generate_icons() {
    log_info "Generating app icons..."
    
    # Create icons directory
    mkdir -p android/app/src/main/res/mipmap-hdpi
    mkdir -p android/app/src/main/res/mipmap-mdpi
    mkdir -p android/app/src/main/res/mipmap-xhdpi
    mkdir -p android/app/src/main/res/mipmap-xxhdpi
    mkdir -p android/app/src/main/res/mipmap-xxxhdpi
    
    # Note: In a real scenario, you would generate actual PNG files here
    # For now, we'll create placeholder files
    log_warning "Icon generation requires actual image files. Please add your app icons to the res folders."
}

# Main build process
main() {
    log_info "Starting mobile app build process..."
    
    check_prerequisites
    install_dependencies
    build_web_app
    initialize_capacitor
    add_android_platform
    sync_capacitor
    build_apk
    generate_icons
    
    log_success "Build process completed successfully!"
    
    echo ""
    echo "📱 Next steps:"
    echo "1. Install the APK on your device:"
    echo "   adb install android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "2. Or open in Android Studio:"
    echo "   npx cap open android"
    echo ""
    echo "3. Test on device/emulator"
    echo ""
    echo "📖 For more information, see MOBILE_BUILD_GUIDE.md"
}

# Run main function
main "$@"