/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        accent: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #d946ef 0%, #c026d3 50%, #a21caf 100%)',
        'gradient-accent': 'linear-gradient(135deg, #eab308 0%, #ca8a04 50%, #a16207 100%)',
        'gradient-success': 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
        'gradient-warning': 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
        'gradient-danger': 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 50%, #feca57 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #4834d4 0%, #686de0 50%, #22a6b3 100%)',
        'gradient-forest': 'linear-gradient(135deg, #6ab04c 0%, #badc58 50%, #22a6b3 100%)',
        'gradient-purple': 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 50%, #be2edd 100%)',
        'gradient-gold': 'linear-gradient(135deg, #f39c12 0%, #f1c40f 50%, #e67e22 100%)',
        'gradient-dark': 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #7f8c8d 100%)',
        'gradient-light': 'linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 50%, #95a5a6 100%)',
        'gradient-premium': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        'gradient-luxury': 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
        'gradient-crystal': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        'gradient-aurora': 'linear-gradient(135deg, #00c9ff 0%, #92fe9d 50%, #00c9ff 100%)',
        'gradient-neon': 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
        'gradient-silk': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9a9e 100%)',
        'gradient-midnight': 'linear-gradient(135deg, #2c3e50 0%, #3498db 50%, #9b59b6 100%)',
        'gradient-sunset-glow': 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 50%, #ffeb3b 100%)',
        'gradient-ocean-deep': 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e8ba3 100%)',
        'gradient-forest-mist': 'linear-gradient(135deg, #134e5e 0%, #71b280 50%, #2d6a4f 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'slide-in-down': 'slideInDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-in',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'bounce-out': 'bounceOut 0.4s ease-in',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'gradient-shift': 'gradientShift 3s ease infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'smooth-scale': 'smoothScale 0.3s ease-out',
        'elegant-fade': 'elegantFade 0.4s ease-out',
        'color-flow': 'colorFlow 4s ease-in-out infinite',
        'breathe': 'breathe 3s ease-in-out infinite',
        'gradient-wave': 'gradientWave 3s ease-in-out infinite',
        'smooth-glow': 'smoothGlow 2s ease-in-out infinite',
        'elegant-pulse': 'elegantPulse 1.5s ease-in-out infinite',
        'liquid-flow': 'liquidFlow 4s ease-in-out infinite',
        'crystal-shimmer': 'crystalShimmer 2.5s ease-in-out infinite',
        'sunset-pulse': 'sunsetPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.3)', opacity: '0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glowPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(14, 165, 233, 0.3), 0 0 40px rgba(14, 165, 233, 0.1)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(14, 165, 233, 0.5), 0 0 60px rgba(14, 165, 233, 0.2)',
            transform: 'scale(1.02)'
          },
        },
        smoothScale: {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        elegantFade: {
          '0%': { opacity: '0', transform: 'translateY(5px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        colorFlow: {
          '0%, 100%': { filter: 'hue-rotate(0deg)' },
          '50%': { filter: 'hue-rotate(10deg)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.01)', opacity: '0.95' },
        },
        gradientWave: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '25%': { backgroundPosition: '100% 0%' },
          '50%': { backgroundPosition: '100% 50%' },
          '75%': { backgroundPosition: '0% 100%' },
        },
        smoothGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.2), 0 0 40px rgba(255, 255, 255, 0.1)',
            filter: 'brightness(1)'
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(255, 255, 255, 0.4), 0 0 60px rgba(255, 255, 255, 0.2)',
            filter: 'brightness(1.1)'
          },
        },
        elegantPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.03)', opacity: '0.9' },
        },
        liquidFlow: {
          '0%, 100%': { transform: 'translateX(0) scale(1)', filter: 'hue-rotate(0deg)' },
          '25%': { transform: 'translateX(2px) scale(1.01)', filter: 'hue-rotate(5deg)' },
          '50%': { transform: 'translateX(0) scale(1.02)', filter: 'hue-rotate(10deg)' },
          '75%': { transform: 'translateX(-2px) scale(1.01)', filter: 'hue-rotate(5deg)' },
        },
        crystalShimmer: {
          '0%, 100%': { 
            backgroundPosition: '0% 0%',
            filter: 'brightness(1) saturate(1)'
          },
          '50%': { 
            backgroundPosition: '100% 100%',
            filter: 'brightness(1.2) saturate(1.3)'
          },
        },
        sunsetPulse: {
          '0%, 100%': { 
            filter: 'hue-rotate(0deg) saturate(1) brightness(1)',
            transform: 'scale(1)'
          },
          '50%': { 
            filter: 'hue-rotate(15deg) saturate(1.2) brightness(1.1)',
            transform: 'scale(1.01)'
          },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 15px -5px rgba(0, 0, 0, 0.06)',
        'glow': '0 0 30px rgba(59, 130, 246, 0.3)',
        'glow-primary': '0 0 30px rgba(14, 165, 233, 0.4)',
        'glow-secondary': '0 0 30px rgba(217, 70, 239, 0.4)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        'full': '9999px',
      },
      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}