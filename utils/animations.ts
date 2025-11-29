/**
 * Modern Animation Utilities for DueTrack AI
 * Provides smooth, performant animations and micro-interactions
 */

// Animation delay utilities
export const animationDelays = {
  'none': 'delay-0',
  'sm': 'delay-75',
  'md': 'delay-150',
  'lg': 'delay-300',
  'xl': 'delay-500',
  '2xl': 'delay-700',
  '3xl': 'delay-1000',
} as const;

// Animation duration utilities
export const animationDurations = {
  'none': 'duration-0',
  'sm': 'duration-150',
  'md': 'duration-300',
  'lg': 'duration-500',
  'xl': 'duration-700',
  '2xl': 'duration-1000',
  '3xl': 'duration-1500',
} as const;

// Animation easing utilities
export const animationEasings = {
  'linear': 'ease-linear',
  'in': 'ease-in',
  'out': 'ease-out',
  'in-out': 'ease-in-out',
  'bounce': 'ease-bounce',
  'smooth': 'ease-smooth',
} as const;

// Common animation combinations for different UI elements
export const animationPresets = {
  // Modal animations
  modal: {
    enter: 'animate-scale-in duration-300 ease-out',
    exit: 'animate-scale-out duration-200 ease-in',
    backdrop: 'animate-fade-in duration-300 ease-out',
  },
  
  // Card animations
  card: {
    hover: 'transition-all duration-300 ease-out hover:scale-105 hover:shadow-medium',
    enter: 'animate-slide-in-up duration-500 ease-out',
    loading: 'animate-pulse',
  },
  
  // Button animations
  button: {
    primary: 'transition-all duration-200 ease-out hover:scale-105 active:scale-95',
    secondary: 'transition-all duration-200 ease-out hover:scale-105 active:scale-95',
    ghost: 'transition-all duration-200 ease-out hover:bg-gray-100 active:bg-gray-200',
  },
  
  // Navigation animations
  nav: {
    item: 'transition-all duration-200 ease-out hover:translate-x-1',
    indicator: 'transition-all duration-300 ease-out',
    mobile: 'animate-slide-in-right duration-300 ease-out',
  },
  
  // Form animations
  form: {
    input: 'transition-all duration-200 ease-out focus:scale-105 focus:shadow-glow',
    error: 'animate-shake duration-500 ease-out',
    success: 'animate-bounce-in duration-600 ease-out',
  },
  
  // Loading animations
  loading: {
    spinner: 'animate-spin',
    pulse: 'animate-pulse',
    shimmer: 'animate-shimmer',
    skeleton: 'animate-pulse bg-gradient-to-r from-gray-200 to-gray-300',
  },
  
  // Notification animations
  notification: {
    enter: 'animate-slide-in-right duration-300 ease-out',
    exit: 'animate-slide-out-right duration-200 ease-in',
    success: 'animate-bounce-in duration-600 ease-out',
    error: 'animate-shake duration-500 ease-out',
  },
  
  // Data visualization animations
  chart: {
    enter: 'animate-fade-in duration-1000 ease-out',
    bar: 'animate-slide-in-up duration-800 ease-out',
    line: 'animate-fade-in duration-1200 ease-out',
  },
} as const;

// Intersection Observer for scroll animations
export const createScrollAnimation = (callback: (entry: IntersectionObserverEntry) => void, options?: IntersectionObserverInit) => {
  const observerOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, observerOptions);
};

// Parallax animation utility
export const createParallaxEffect = (element: HTMLElement, speed: number = 0.5) => {
  const handleScroll = () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -speed;
    element.style.transform = `translateY(${rate}px)`;
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
};

// Smooth scroll utility
export const smoothScrollTo = (target: string | number, duration: number = 1000) => {
  const targetPosition = typeof target === 'string' 
    ? document.querySelector(target)?.getBoundingClientRect().top || 0
    : target;
  
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;

  const animation = (currentTime: number) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    
    const ease = easeInOutQuad(progress);
    window.scrollTo(0, startPosition + distance * ease);
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  };

  requestAnimationFrame(animation);
};

// Easing functions
const easeInOutQuad = (t: number) => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

const easeOutQuad = (t: number) => {
  return t * (2 - t);
};

const easeInQuad = (t: number) => {
  return t * t;
};

// Stagger animation for lists
export const staggerAnimation = (elements: HTMLElement[], delay: number = 100) => {
  elements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add('animate-fade-in');
    }, index * delay);
  });
};

// Ripple effect for buttons
export const createRippleEffect = (event: React.MouseEvent<HTMLButtonElement>) => {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  const ripple = document.createElement('span');
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.className = 'absolute rounded-full bg-white opacity-30 animate-ping';
  
  button.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
};

// Type definitions
export type AnimationDelay = keyof typeof animationDelays;
export type AnimationDuration = keyof typeof animationDurations;
export type AnimationEasing = keyof typeof animationEasings;
export type AnimationPreset = keyof typeof animationPresets;

// Export all utilities
export default {
  animationDelays,
  animationDurations,
  animationEasings,
  animationPresets,
  createScrollAnimation,
  createParallaxEffect,
  smoothScrollTo,
  staggerAnimation,
  createRippleEffect,
};