import React from 'react';

// App Icon SVG Component
export const AppIcon: React.FC<{ size?: number; gradient?: boolean }> = ({ 
  size = 1024, 
  gradient = true 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 1024 1024" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {gradient && (
        <linearGradient id="appIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      )}
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="8" dy="8" stdDeviation="16" floodColor="#000000" floodOpacity="0.2"/>
      </filter>
    </defs>
    
    {/* Background circle */}
    <circle 
      cx="512" 
      cy="512" 
      r="480" 
      fill={gradient ? "url(#appIconGradient)" : "#667eea"}
      filter="url(#shadow)"
    />
    
    {/* Inner circle */}
    <circle 
      cx="512" 
      cy="512" 
      r="400" 
      fill="white" 
      opacity="0.1"
    />
    
    {/* Dollar symbol */}
    <text 
      x="512" 
      y="580" 
      fontSize="400" 
      fontWeight="bold" 
      textAnchor="middle" 
      fill="white"
      fontFamily="Arial, sans-serif"
    >
      $
    </text>
    
    {/* Subtle pattern */}
    <circle cx="200" cy="200" r="60" fill="white" opacity="0.1" />
    <circle cx="824" cy="200" r="40" fill="white" opacity="0.1" />
    <circle cx="200" cy="824" r="50" fill="white" opacity="0.1" />
    <circle cx="824" cy="824" r="70" fill="white" opacity="0.1" />
  </svg>
);

// Splash Screen SVG Component
export const SplashScreen: React.FC<{ size?: number }> = ({ size = 1024 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 1024 1024" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="splashGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
    </defs>
    
    {/* Background */}
    <rect width="1024" height="1024" fill="url(#splashGradient)" />
    
    {/* App icon in center */}
    <g transform="translate(512, 512)">
      <circle cx="0" cy="0" r="120" fill="white" opacity="0.2" />
      <text 
        x="0" 
        y="40" 
        fontSize="160" 
        fontWeight="bold" 
        textAnchor="middle" 
        fill="white"
        fontFamily="Arial, sans-serif"
      >
        $
      </text>
    </g>
    
    {/* App name */}
    <text 
      x="512" 
      y="700" 
      fontSize="48" 
      fontWeight="600" 
      textAnchor="middle" 
      fill="white"
      fontFamily="Arial, sans-serif"
    >
      DuetTrack AI
    </text>
    
    {/* Loading indicator */}
    <circle 
      cx="512" 
      cy="800" 
      r="24" 
      fill="none" 
      stroke="white" 
      strokeWidth="4" 
      strokeDasharray="113" 
      strokeDashoffset="113"
    >
      <animate 
        attributeName="stroke-dashoffset" 
        values="113;0;113" 
        dur="2s" 
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

// Notification Icon SVG Component
 

// App Icon Generator Component
export const AppIconGenerator: React.FC = () => {
  const generateIcons = () => {
    const iconSizes = {
      'mipmap-hdpi': 72,
      'mipmap-mdpi': 48,
      'mipmap-xhdpi': 96,
      'mipmap-xxhdpi': 144,
      'mipmap-xxxhdpi': 192,
      'ic_launcher': 512,
      'ic_launcher_round': 512,
      'ic_launcher_foreground': 432,
      'ic_launcher_background': 432
    };

    const splashSizes = {
      'drawable-land-ldpi': 320,
      'drawable-land-mdpi': 480,
      'drawable-land-hdpi': 800,
      'drawable-land-xhdpi': 1280,
      'drawable-land-xxhdpi': 1600,
      'drawable-land-xxxhdpi': 1920,
      'drawable-port-ldpi': 320,
      'drawable-port-mdpi': 480,
      'drawable-port-hdpi': 800,
      'drawable-port-xhdpi': 1280,
      'drawable-port-xxhdpi': 1600,
      'drawable-port-xxxhdpi': 1920
    };

    return {
      icons: iconSizes,
      splash: splashSizes
    };
  };

  const { icons, splash } = generateIcons();

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">App Icon Generator</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* App Icon Preview */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">App Icon</h3>
          <div className="flex justify-center mb-4">
            <AppIcon size={128} />
          </div>
          <p className="text-sm text-gray-600 mb-4">Primary app icon with gradient background</p>
          
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(icons).slice(0, 6).map(([name, size]) => (
              <div key={name} className="text-center">
                <div className="w-12 h-12 mx-auto mb-1">
                  <AppIcon size={size / 4} gradient={false} />
                </div>
                <p className="text-xs text-gray-500">{name}</p>
                <p className="text-xs text-gray-400">{size}px</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Splash Screen Preview */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Splash Screen</h3>
          <div className="flex justify-center mb-4">
            <SplashScreen size={128} />
          </div>
          <p className="text-sm text-gray-600 mb-4">Loading screen with animated indicator</p>
          
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(splash).slice(0, 4).map(([name, size]) => (
              <div key={name} className="text-center">
                <div className="w-16 h-16 mx-auto mb-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{size}</span>
                </div>
                <p className="text-xs text-gray-500">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Usage Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Usage Instructions:</h4>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Save each icon as PNG file with specified dimensions</li>
          <li>2. Place icons in respective Android drawable folders</li>
          <li>3. Configure splash screen in capacitor.config.ts</li>
          <li>4. Test on different screen sizes and densities</li>
        </ol>
      </div>
    </div>
  );
};

export default {
  AppIcon,
  SplashScreen,
  AppIconGenerator
};