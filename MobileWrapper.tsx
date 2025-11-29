import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

interface MobileWrapperProps {
  children: React.ReactNode;
}

export const MobileWrapper: React.FC<MobileWrapperProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [platform, setPlatform] = useState<string>('');

  useEffect(() => {
    // Check if running on mobile
    const mobilePlatform = Capacitor.getPlatform();
    setPlatform(mobilePlatform);
    setIsMobile(mobilePlatform !== 'web');

    if (isMobile) {
      // Configure status bar
      StatusBar.setOverlaysWebView({ overlay: false });
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#ffffff' });

      // Hide splash screen after app is ready
      setTimeout(() => {
        SplashScreen.hide();
      }, 1000);

      // Handle hardware back button
      const handleBackButton = (e: any) => {
        e.preventDefault();
        if (window.history.length > 1) {
          window.history.back();
        }
      };

      document.addEventListener('backbutton', handleBackButton);

      return () => {
        document.removeEventListener('backbutton', handleBackButton);
      };
    }
  }, [isMobile]);

  // Mobile-specific styles
  const mobileStyles = `
    .mobile-safe-area {
      padding-top: env(safe-area-inset-top);
      padding-bottom: env(safe-area-inset-bottom);
      padding-left: env(safe-area-inset-left);
      padding-right: env(safe-area-inset-right);
    }
    
    .mobile-status-bar {
      height: env(safe-area-inset-top);
      background-color: #ffffff;
    }
    
    .mobile-bottom-bar {
      height: env(safe-area-inset-bottom);
      background-color: #ffffff;
    }
    
    /* Prevent text selection on mobile */
    .mobile-content * {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    
    /* Enable text selection for input fields */
    .mobile-content input,
    .mobile-content textarea,
    .mobile-content select {
      -webkit-user-select: text;
      -khtml-user-select: text;
      -moz-user-select: text;
      -ms-user-select: text;
      user-select: text;
    }
    
    /* Smooth scrolling */
    .mobile-content {
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
    }
    
    /* Touch-friendly buttons */
    .mobile-content button,
    .mobile-content .touch-target {
      min-height: 44px;
      min-width: 44px;
    }
    
    /* Enhanced safe area handling */
    .safe-area-top {
      padding-top: max(env(safe-area-inset-top), 16px);
    }
    
    .safe-area-bottom {
      padding-bottom: max(env(safe-area-inset-bottom), 16px);
    }
    
    .safe-area-left {
      padding-left: max(env(safe-area-inset-left), 16px);
    }
    
    .safe-area-right {
      padding-right: max(env(safe-area-inset-right), 16px);
    }
    
    /* Prevent zoom on double tap */
    .mobile-content {
      touch-action: manipulation;
    }
  `;

  return (
    <>
      {isMobile && (
        <style dangerouslySetInnerHTML={{ __html: mobileStyles }} />
      )}
      <div 
        className={`${isMobile ? 'mobile-content mobile-safe-area' : ''} min-h-screen bg-gray-50`}
        data-platform={platform}
      >
        {isMobile && (
          <div className="mobile-status-bar" />
        )}
        {children}
        {isMobile && (
          <div className="mobile-bottom-bar" />
        )}
      </div>
    </>
  );
};

export default MobileWrapper;