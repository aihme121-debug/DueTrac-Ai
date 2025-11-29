# Android Mobile App Build & Deployment Guide

## Prerequisites

Before building your Android app, ensure you have:

1. **Android Studio** installed (latest version)
2. **Java Development Kit (JDK)** 11 or higher
3. **Android SDK** with API level 21+ (Android 5.0+)
4. **Node.js** 16+ and npm
5. **Git** for version control

## Quick Start

### 1. Install Dependencies

```bash
# Install Capacitor and mobile dependencies
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/status-bar @capacitor/splash-screen

# Build your web app
npm run build
```

### 2. Initialize Mobile App

```bash
# Initialize Capacitor (if not already done)
npx cap init "DuetTrack AI" "com.duetrack.ai" --web-dir=dist

# Add Android platform
npx cap add android

# Sync Capacitor
npx cap sync
```

### 3. Build APK

```bash
# Build debug APK
npm run mobile:build

# Or manually:
cd android
./gradlew assembleDebug
```

## Detailed Build Process

### Step 1: Environment Setup

#### Install Android Studio
1. Download from [developer.android.com/studio](https://developer.android.com/studio)
2. Install with default settings
3. Launch Android Studio and complete setup wizard

#### Configure Android SDK
1. Open Android Studio
2. Go to **File → Settings → Appearance & Behavior → System Settings → Android SDK**
3. Install the following SDK components:
   - Android SDK Platform (API 21+)
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
   - Android Emulator

### Step 2: Project Configuration

#### Update capacitor.config.ts
```typescript
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
      keystorePassword: 'your-keystore-password',
      keystoreAlias: 'android',
      keystoreAliasPassword: 'your-alias-password',
      releaseType: 'APK'
    }
  }
};

export default config;
```

### Step 3: Build Configurations

#### Debug Build
```bash
# Build debug APK
cd android
./gradlew assembleDebug

# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

#### Release Build
```bash
# Generate signing key (first time only)
keytool -genkey -v -keystore keystore/android.keystore -alias android -keyalg RSA -keysize 2048 -validity 10000

# Build release APK
cd android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

### Step 4: Testing

#### On Android Emulator
1. Open Android Studio
2. Click **AVD Manager** icon
3. Create new virtual device
4. Select device and system image
5. Run emulator
6. Drag and drop APK file to install

#### On Physical Device
1. Enable **Developer Options** on device
2. Enable **USB Debugging**
3. Connect device via USB
4. Accept USB debugging prompt
5. Run: `adb install android/app/build/outputs/apk/debug/app-debug.apk`

### Step 5: Deployment

#### Google Play Store
1. Create Google Play Developer account ($25 one-time fee)
2. Create app in Play Console
3. Upload release APK/AAB
4. Fill app details and screenshots
5. Submit for review

#### Alternative Distribution
- **Firebase App Distribution**
- **Direct APK download**
- **Enterprise distribution**

## Build Scripts

### Package.json Scripts
```json
{
  "scripts": {
    "mobile:setup": "npm run build && npx cap init \"DuetTrack AI\" \"com.duetrack.ai\" --web-dir=dist && npx cap add android",
    "mobile:sync": "npx cap sync",
    "mobile:build": "npm run build && npx cap sync && cd android && ./gradlew assembleDebug",
    "mobile:build:release": "npm run build && npx cap sync && cd android && ./gradlew assembleRelease",
    "mobile:open": "npx cap open android",
    "mobile:clean": "cd android && ./gradlew clean"
  }
}
```

### Automated Build Script
```bash
#!/bin/bash
# build-mobile.sh

echo "🚀 Building DuetTrack AI Mobile App"
echo "====================================="

# Clean previous builds
echo "📦 Cleaning previous builds..."
cd android && ./gradlew clean && cd ..

# Build web app
echo "🏗️  Building web app..."
npm run build

# Sync Capacitor
echo "⚡ Syncing Capacitor..."
npx cap sync

# Build APK
echo "🤖 Building Android APK..."
cd android
./gradlew assembleDebug

# Return to root
cd ..

echo "✅ Build completed!"
echo "📱 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
```

## Troubleshooting

### Common Issues

#### Build Fails with "Could not find com.android.tools.build:gradle"
**Solution:** Update Android Gradle Plugin in `android/build.gradle`:
```gradle
buildscript {
    dependencies {
        classpath 'com.android.tools.build:gradle:7.4.2'
    }
}
```

#### App Crashes on Startup
**Solution:** Check logs with:
```bash
adb logcat | grep AndroidRuntime
```

#### White Screen After Splash
**Solution:** 
1. Check web assets are built: `npm run build`
2. Verify `webDir` in capacitor.config.ts
3. Check browser console for errors

#### Status Bar Issues
**Solution:** Update StatusBar configuration:
```typescript
import { StatusBar, Style } from '@capacitor/status-bar';

StatusBar.setOverlaysWebView({ overlay: false });
StatusBar.setStyle({ style: Style.Dark });
StatusBar.setBackgroundColor({ color: '#ffffff' });
```

### Performance Optimization

#### Reduce APK Size
1. **Enable ProGuard** in `android/app/build.gradle`:
```gradle
buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

2. **Compress images** and use WebP format
3. **Remove unused dependencies**

#### Improve Performance
1. **Enable hardware acceleration** in `AndroidManifest.xml`
2. **Optimize web assets** with code splitting
3. **Use lazy loading** for components
4. **Implement service workers** for offline support

## Security Best Practices

### 1. Secure API Keys
```typescript
// Use environment variables
const API_KEY = process.env.REACT_APP_API_KEY;

// Never hardcode sensitive data
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  // ...
};
```

### 2. Network Security
```xml
<!-- Network security config -->
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">your-api-domain.com</domain>
    </domain-config>
</network-security-config>
```

### 3. Certificate Pinning
Implement certificate pinning for API communications.

## Continuous Integration

### GitHub Actions Example
```yaml
name: Build Android App

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build web app
      run: npm run build
      
    - name: Setup Android SDK
      uses: android-actions/setup-android@v2
      
    - name: Build APK
      run: |
        npx cap sync
        cd android
        ./gradlew assembleDebug
        
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-debug
        path: android/app/build/outputs/apk/debug/app-debug.apk
```

## Next Steps

1. **Add Push Notifications** - Firebase Cloud Messaging
2. **Implement Offline Support** - Service workers and local storage
3. **Add Biometric Authentication** - Fingerprint/Face recognition
4. **Configure Deep Linking** - Handle custom URLs
5. **Add Analytics** - Firebase Analytics or custom solution
6. **Implement Error Tracking** - Sentry or similar service

## Support

- **Capacitor Documentation**: https://capacitorjs.com/docs
- **Android Developer Guide**: https://developer.android.com/guide
- **Gradle Build Tool**: https://gradle.org/guides/

For issues specific to your DuetTrack AI app, refer to the troubleshooting section in `MOBILE_CONVERSION_GUIDE.md`.