import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import App from './App';
import MobileNavigation from './MobileNavigation';
import MobileWrapper from './MobileWrapper';
import './index.css';

// Detect if we're running on mobile
const isMobile = Capacitor.isNativePlatform();
const platform = Capacitor.getPlatform();

// Mobile App Component
const MobileApp: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize mobile-specific features
    const initializeMobile = async () => {
      try {
        // Configure status bar
        if (platform === 'android') {
          await StatusBar.setOverlaysWebView({ overlay: false });
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
        }

        // Hide splash screen after a delay
        setTimeout(() => {
          SplashScreen.hide();
        }, 2000);

        setIsReady(true);
      } catch (error) {
        setIsReady(true);
      }
    };

    if (isMobile) {
      initializeMobile();
    } else {
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold">Loading DuetTrack AI...</h2>
        </div>
      </div>
    );
  }

  return (
    <MobileWrapper>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Navigation */}
        {isMobile && (
          <MobileNavigation
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onAddClick={() => {}}
            onSearchClick={() => {}}
          />
        )}
        
        {/* Main Content */}
        <div className={isMobile ? 'pt-16 pb-20' : ''}>
          <App />
        </div>
      </div>
    </MobileWrapper>
  );
};

// Determine which app to render
const RootApp = isMobile ? MobileApp : App;

// Render the app
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);

// Handle mobile back button
document.addEventListener('backbutton', (e) => {
  e.preventDefault();
  if (window.history.length > 1) {
    window.history.back();
  }
});

// Handle app pause/resume
if (isMobile) {
  window.addEventListener('pause', () => {
    // App paused
  });

  window.addEventListener('resume', () => {
    // App resumed
  });
}