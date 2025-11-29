# Android Mobile App Conversion Guide

This guide will help you convert your React web app to an Android mobile app using Capacitor.

## Prerequisites

1. **Node.js and npm** - Make sure you have Node.js (v16+) and npm installed
2. **Java Development Kit (JDK)** - Install JDK 11 or higher
3. **Android Studio** - Download and install Android Studio
4. **Android SDK** - Install through Android Studio

## Step 1: Install Dependencies

First, install the Capacitor dependencies:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

## Step 2: Build Your Web App

Build your React app for production:

```bash
npm run build
```

## Step 3: Initialize Capacitor

Initialize Capacitor with your app details:

```bash
npx cap init "DuetTrack AI" "com.duetrack.ai" --web-dir=dist
```

## Step 4: Add Android Platform

Add Android as a target platform:

```bash
npx cap add android
```

## Step 5: Sync and Build

Sync your web assets and build the Android app:

```bash
npx cap sync
npx cap build android
```

## Step 6: Open in Android Studio

Open the Android project in Android Studio:

```bash
npx cap open android
```

## Step 7: Build APK

In Android Studio:
1. Wait for Gradle sync to complete
2. Click "Build" → "Build Bundle(s) / APK(s)" → "Build APK(s)"
3. The APK will be generated in `android/app/build/outputs/apk/debug/`

## Mobile-Specific Features

### 1. Mobile Wrapper Component
The `MobileWrapper.tsx` component handles:
- Safe area insets for notches and home indicators
- Platform detection
- Status bar configuration
- Touch-friendly interactions

### 2. Mobile Navigation
The `MobileNavigation.tsx` component provides:
- Bottom tab navigation
- Top header with menu
- Floating action button
- Touch-friendly button sizes (44px minimum)

### 3. Mobile Optimizations
- Viewport meta tag with `viewport-fit=cover`
- Touch-friendly CSS
- Prevent zoom on double-tap
- Smooth scrolling
- Loading screen

## Configuration Files

### capacitor.config.ts
Contains Android-specific settings:
- App ID and name
- Web directory
- Android build options
- Splash screen configuration

### Mobile HTML Template
The `mobile.html` includes:
- Proper viewport settings
- Mobile-specific CSS
- Loading screen
- Back button handling

## Testing

### Local Testing
1. Enable USB debugging on your Android device
2. Connect device to computer
3. In Android Studio, click "Run" button
4. Select your device

### Emulator Testing
1. Create Android Virtual Device (AVD) in Android Studio
2. Run the app on the emulator

## Distribution

### Debug APK
Located at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK
1. Generate signing key
2. Configure signing in `capacitor.config.ts`
3. Build release version in Android Studio

## Troubleshooting

### Common Issues

1. **Build fails with "Could not find com.android.tools.build:gradle"**
   - Update Android Gradle Plugin in `android/build.gradle`

2. **App crashes on startup**
   - Check Capacitor configuration
   - Verify all dependencies are installed

3. **White screen after splash**
   - Check web assets are built correctly
   - Verify `webDir` in capacitor.config.ts

4. **Status bar issues**
   - Update StatusBar configuration in `MobileWrapper.tsx`

### Performance Optimization

1. **Enable ProGuard**
   - Minimize APK size
   - Obfuscate code

2. **Optimize images**
   - Compress images
   - Use appropriate formats

3. **Lazy loading**
   - Implement code splitting
   - Load components on demand

## Next Steps

1. Add push notifications
2. Implement offline functionality
3. Add biometric authentication
4. Configure deep linking
5. Add analytics

## Support

For Capacitor-specific issues:
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor Community](https://github.com/ionic-team/capacitor)

For Android-specific issues:
- [Android Developer Documentation](https://developer.android.com/)
- [Android Studio Help](https://developer.android.com/studio/intro)