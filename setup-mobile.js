#!/usr/bin/env node

/**
 * Mobile App Setup Script
 * This script helps set up your React app for mobile conversion using Capacitor
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`\n${description}...`, 'cyan');
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    log(`✅ ${description} completed successfully`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    return false;
  }
}

function checkPrerequisites() {
  log('\n🔍 Checking prerequisites...', 'blue');
  
  try {
    // Check Node.js
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    log(`✅ Node.js: ${nodeVersion}`, 'green');
    
    // Check npm
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    log(`✅ npm: ${npmVersion}`, 'green');
    
    // Check if package.json exists
    if (fs.existsSync('package.json')) {
      log('✅ package.json found', 'green');
    } else {
      log('❌ package.json not found', 'red');
      return false;
    }
    
    return true;
  } catch (error) {
    log(`❌ Prerequisites check failed: ${error.message}`, 'red');
    return false;
  }
}

function installDependencies() {
  log('\n📦 Installing Capacitor dependencies...', 'blue');
  
  const dependencies = [
    '@capacitor/core',
    '@capacitor/android',
    '@capacitor/status-bar',
    '@capacitor/splash-screen'
  ];
  
  const devDependencies = ['@capacitor/cli'];
  
  // Install dependencies
  const depsCommand = `npm install ${dependencies.join(' ')}`;
  if (!runCommand(depsCommand, 'Installing Capacitor dependencies')) {
    return false;
  }
  
  // Install dev dependencies
  const devDepsCommand = `npm install -D ${devDependencies.join(' ')}`;
  if (!runCommand(devDepsCommand, 'Installing Capacitor CLI')) {
    return false;
  }
  
  return true;
}

function buildWebApp() {
  log('\n🏗️  Building web app...', 'blue');
  return runCommand('npm run build', 'Building web application');
}

function initializeCapacitor() {
  log('\n⚡ Initializing Capacitor...', 'blue');
  
  // Check if capacitor.config.ts already exists
  if (fs.existsSync('capacitor.config.ts')) {
    log('✅ Capacitor config already exists', 'yellow');
    return true;
  }
  
  const command = 'npx cap init "DuetTrack AI" "com.duetrack.ai" --web-dir=dist';
  return runCommand(command, 'Initializing Capacitor');
}

function addAndroidPlatform() {
  log('\n🤖 Adding Android platform...', 'blue');
  
  // Check if android directory already exists
  if (fs.existsSync('android')) {
    log('✅ Android platform already added', 'yellow');
    return true;
  }
  
  const command = 'npx cap add android';
  return runCommand(command, 'Adding Android platform');
}

function syncCapacitor() {
  log('\n🔄 Syncing Capacitor...', 'blue');
  const command = 'npx cap sync';
  return runCommand(command, 'Syncing Capacitor');
}

function createMobileFiles() {
  log('\n📱 Creating mobile-specific files...', 'blue');
  
  try {
    // Create mobile wrapper if it doesn't exist
    if (!fs.existsSync('MobileWrapper.tsx')) {
      const wrapperContent = `import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

interface MobileWrapperProps {
  children: React.ReactNode;
}

export const MobileWrapper: React.FC<MobileWrapperProps> = ({ children }) => {
  const isMobile = Capacitor.isNativePlatform();
  
  return (
    <div className={\`\${isMobile ? 'mobile-safe' : ''} min-h-screen bg-gray-50\`}>
      {children}
    </div>
  );
};

export default MobileWrapper;`;
      
      fs.writeFileSync('MobileWrapper.tsx', wrapperContent);
      log('✅ Created MobileWrapper.tsx', 'green');
    }
    
    // Update package.json scripts if not present
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const mobileScripts = {
      'mobile:setup': 'npm run build && npx cap init "DuetTrack AI" "com.duetrack.ai" --web-dir=dist && npx cap add android',
      'mobile:sync': 'npx cap sync',
      'mobile:build': 'npm run build && npx cap sync && cd android && ./gradlew assembleDebug',
      'mobile:open': 'npx cap open android'
    };
    
    let updated = false;
    Object.keys(mobileScripts).forEach(key => {
      if (!packageJson.scripts[key]) {
        packageJson.scripts[key] = mobileScripts[key];
        updated = true;
      }
    });
    
    if (updated) {
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
      log('✅ Updated package.json with mobile scripts', 'green');
    }
    
    return true;
  } catch (error) {
    log(`❌ Failed to create mobile files: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('\n🚀 Mobile App Setup Script', 'magenta');
  log('================================', 'magenta');
  
  // Check prerequisites
  if (!checkPrerequisites()) {
    log('❌ Prerequisites check failed. Please fix the issues above.', 'red');
    process.exit(1);
  }
  
  // Install dependencies
  if (!installDependencies()) {
    log('❌ Failed to install dependencies', 'red');
    process.exit(1);
  }
  
  // Build web app
  if (!buildWebApp()) {
    log('❌ Failed to build web app', 'red');
    process.exit(1);
  }
  
  // Initialize Capacitor
  if (!initializeCapacitor()) {
    log('❌ Failed to initialize Capacitor', 'red');
    process.exit(1);
  }
  
  // Add Android platform
  if (!addAndroidPlatform()) {
    log('❌ Failed to add Android platform', 'red');
    process.exit(1);
  }
  
  // Sync Capacitor
  if (!syncCapacitor()) {
    log('❌ Failed to sync Capacitor', 'red');
    process.exit(1);
  }
  
  // Create mobile files
  if (!createMobileFiles()) {
    log('❌ Failed to create mobile files', 'red');
    process.exit(1);
  }
  
  log('\n✅ Mobile app setup completed successfully!', 'green');
  log('\n📱 Next steps:', 'cyan');
  log('1. Open Android Studio', 'white');
  log('2. Open the android/ folder in Android Studio', 'white');
  log('3. Wait for Gradle sync to complete', 'white');
  log('4. Run the app on an emulator or device', 'white');
  log('\n🔧 Useful commands:', 'cyan');
  log('npm run mobile:sync    - Sync Capacitor', 'white');
  log('npm run mobile:build   - Build APK', 'white');
  log('npm run mobile:open    - Open in Android Studio', 'white');
  log('\n📖 Read MOBILE_CONVERSION_GUIDE.md for more details', 'yellow');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, runCommand, checkPrerequisites };