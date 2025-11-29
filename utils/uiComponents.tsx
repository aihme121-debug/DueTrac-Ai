/**
 * Modern UI Components Library for DueTrack AI
 * Provides reusable, animated components with contemporary design
 */

import React from 'react';
import { cn } from './cn';
import { animationPresets } from './animations';

// Modern Button Component
export interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  gradient?: boolean;
  glow?: boolean;
  loading?: boolean;
  ripple?: boolean;
  animated?: boolean;
  contrast?: boolean;
  active?: boolean;
  gradientTone?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
  gradientTransition?: boolean;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  gradient = false,
  glow = false,
  loading = false,
  ripple = true,
  animated = true,
  contrast = false,
  active = false,
  gradientTone,
  gradientTransition = false,
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && !loading && !disabled) {
      const ripple = document.createElement('span');
      const rect = e.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.className = 'absolute rounded-full bg-white/40 backdrop-blur-sm animate-ping pointer-events-none';
      
      e.currentTarget.appendChild(ripple);
      setTimeout(() => ripple.remove(), 800);
    }
    
    if (onClick && !loading && !disabled) {
      onClick(e);
    }
  };

  const baseClasses = 'relative overflow-hidden isolate font-semibold rounded-xl transition-all duration-700 ease-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-300';
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
    xl: 'px-8 py-5 text-xl',
  };
  
  const tone = gradientTone || (variant as 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger');

  const variantClasses = {
    primary: gradient 
      ? 'bg-gradient-primary text-white shadow-glow-primary hover:shadow-lg'
      : 'bg-primary-600 text-white hover:bg-primary-700 shadow-soft hover:shadow-medium',
    secondary: gradient
      ? 'bg-gradient-secondary text-white shadow-glow-secondary hover:shadow-lg'
      : 'bg-secondary-600 text-white hover:bg-secondary-700 shadow-soft hover:shadow-medium',
    accent: gradient
      ? 'bg-gradient-accent text-white shadow-lg hover:shadow-xl'
      : 'bg-accent-500 text-white hover:bg-accent-600 shadow-soft hover:shadow-medium',
    success: gradient
      ? 'bg-gradient-success text-white shadow-lg hover:shadow-xl'
      : 'bg-success-500 text-white hover:bg-success-600 shadow-soft hover:shadow-medium',
    warning: gradient
      ? 'bg-gradient-warning text-white shadow-lg hover:shadow-xl'
      : 'bg-warning-500 text-white hover:bg-warning-600 shadow-soft hover:shadow-medium',
    danger: gradient
      ? 'bg-gradient-danger text-white shadow-lg hover:shadow-xl'
      : 'bg-danger-500 text-white hover:bg-danger-600 shadow-soft hover:shadow-medium',
    ghost: 'bg-transparent text-gray-900 hover:bg-gray-200 hover:text-gray-900 border border-gray-300 hover:border-gray-400',
  };
  
  const glowClasses = glow ? 'hover:shadow-glow' : '';
  const contrastClasses = contrast && !gradient && variant === 'ghost' ? 'text-gray-900' : '';
  const animationClasses = animated ? 'transition-all duration-700 ease-out hover:scale-[1.02] active:scale-[0.98]' : '';
  
  return (
    <button
      className={cn(
        baseClasses,
        sizeClasses[size],
        gradientTransition ? 'bg-transparent border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 backdrop-blur-sm' : variantClasses[variant],
        contrastClasses,
        glowClasses,
        animationClasses,
        className
      )}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {gradientTransition && (
        <>
          {/* Clean gradient background without overlay artifacts */}
          <span
            className={cn(
              'absolute inset-0 rounded-xl transition-all duration-1000 ease-out',
              `bg-gradient-${tone}`,
              active ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
              'transform origin-center',
              active && 'animate-gradient-shift'
            )}
            style={{ backgroundSize: '300% 300%' }}
            aria-hidden
          />
          {/* Subtle shimmer effect - controlled opacity */}
          {active && (
            <span 
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{ backgroundSize: '300% 100%' }}
              aria-hidden
            />
          )}
          {/* Controlled glow effect without overflow */}
          {active && (
            <span 
              className="absolute inset-0 rounded-xl bg-gradient-primary opacity-15"
              aria-hidden
            />
          )}
        </>
      )}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl backdrop-blur-sm">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <span
        className={cn(
          'relative z-10 transition-all duration-700 ease-out inline-flex items-center gap-3',
          loading && 'opacity-0',
          gradientTransition && (active
            ? 'text-white drop-shadow-lg font-semibold tracking-wide'
            : 'text-gray-700 group-hover:text-gray-800 group-hover:font-medium')
        )}
      >
        {children}
      </span>
    </button>
  );
};

// Modern Card Component
export interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'glass' | 'elevated';
  gradientColor?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
  animated?: boolean;
  hover?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  className,
  variant = 'default',
  gradientColor = 'primary',
  animated = true,
  hover = true,
  glow = false,
  padding = 'md',
  ...props
}) => {
  const baseClasses = 'rounded-2xl backdrop-blur-sm transition-all duration-300 ease-out';
  
  const variantClasses = {
    default: 'bg-white shadow-soft border border-gray-100',
    gradient: `bg-gradient-${gradientColor} text-white shadow-lg`,
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-lg',
    elevated: 'bg-white shadow-medium hover:shadow-strong',
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };
  
  const hoverClasses = hover ? 'hover:scale-105 hover:shadow-xl' : '';
  const glowClasses = glow ? 'hover:shadow-glow' : '';
  const animationClasses = animated ? 'animate-fade-in' : '';
  
  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        hoverClasses,
        glowClasses,
        animationClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Modern Input Component
export interface ModernInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const ModernInput: React.FC<ModernInputProps> = ({
  label,
  error,
  success,
  icon,
  className,
  variant = 'outlined',
  size = 'md',
  animated = true,
  ...props
}) => {
  const baseClasses = 'w-full rounded-xl transition-all duration-200 ease-out focus:outline-none';
  
  const variantClasses = {
    default: 'bg-white border-2 border-gray-200 focus:border-primary-500 focus:shadow-glow-primary',
    filled: 'bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary-500',
    outlined: 'bg-transparent border-2 border-gray-300 focus:border-primary-500 focus:shadow-glow-primary',
    ghost: 'bg-transparent border-2 border-transparent focus:bg-white focus:border-primary-500',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };
  
  const stateClasses = error
    ? 'border-danger-500 focus:border-danger-500 focus:shadow-glow-danger'
    : success
    ? 'border-success-500 focus:border-success-500 focus:shadow-glow-success'
    : '';
  
  const animationClasses = animated ? 'focus:scale-105' : '';
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            stateClasses,
            animationClasses,
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-danger-600 animate-shake">{error}</p>
      )}
      {success && (
        <p className="text-sm text-success-600">{success}</p>
      )}
    </div>
  );
};

// Modern Badge Component
export interface ModernBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  gradient?: boolean;
  animated?: boolean;
  pill?: boolean;
}

export const ModernBadge: React.FC<ModernBadgeProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  gradient = false,
  animated = true,
  pill = true,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-medium';
  
  const variantClasses = {
    primary: gradient
      ? 'bg-gradient-primary text-white'
      : 'bg-primary-100 text-primary-800',
    secondary: gradient
      ? 'bg-gradient-secondary text-white'
      : 'bg-secondary-100 text-secondary-800',
    accent: gradient
      ? 'bg-gradient-accent text-white'
      : 'bg-accent-100 text-accent-800',
    success: gradient
      ? 'bg-gradient-success text-white'
      : 'bg-success-100 text-success-800',
    warning: gradient
      ? 'bg-gradient-warning text-white'
      : 'bg-warning-100 text-warning-800',
    danger: gradient
      ? 'bg-gradient-danger text-white'
      : 'bg-danger-100 text-danger-800',
    neutral: 'bg-gray-100 text-gray-800',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };
  
  const shapeClasses = pill ? 'rounded-full' : 'rounded-lg';
  const animationClasses = animated ? 'animate-fade-in' : '';
  
  return (
    <span
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        shapeClasses,
        animationClasses,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// Modern Progress Bar
export interface ModernProgressProps {
  value: number;
  max?: number;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
  gradient?: boolean;
  animated?: boolean;
  showPercentage?: boolean;
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ModernProgress: React.FC<ModernProgressProps> = ({
  value,
  max = 100,
  variant = 'primary',
  gradient = false,
  animated = true,
  showPercentage = false,
  height = 'md',
  className,
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };
  
  const variantClasses = {
    primary: gradient ? 'bg-gradient-primary' : 'bg-primary-500',
    secondary: gradient ? 'bg-gradient-secondary' : 'bg-secondary-500',
    accent: gradient ? 'bg-gradient-accent' : 'bg-accent-500',
    success: gradient ? 'bg-gradient-success' : 'bg-success-500',
    warning: gradient ? 'bg-gradient-warning' : 'bg-warning-500',
    danger: gradient ? 'bg-gradient-danger' : 'bg-danger-500',
  };
  
  const animationClasses = animated ? 'transition-all duration-500 ease-out' : '';
  
  return (
    <div className={cn('w-full', className)}>
      <div className={cn('bg-gray-200 rounded-full overflow-hidden', heightClasses[height])}>
        <div
          className={cn(
            'h-full rounded-full',
            variantClasses[variant],
            animationClasses,
            animated && 'animate-fade-in'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="mt-2 text-sm text-gray-600 text-right">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};

// Modern Loading Spinner
export interface ModernSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
  gradient?: boolean;
  className?: string;
}

export const ModernSpinner: React.FC<ModernSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  gradient = false,
  className,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };
  
  const variantClasses = {
    primary: gradient ? 'bg-gradient-primary' : 'border-primary-500',
    secondary: gradient ? 'bg-gradient-secondary' : 'border-secondary-500',
    accent: gradient ? 'bg-gradient-accent' : 'border-accent-500',
    success: gradient ? 'bg-gradient-success' : 'border-success-500',
    warning: gradient ? 'bg-gradient-warning' : 'border-warning-500',
    danger: gradient ? 'bg-gradient-danger' : 'border-danger-500',
  };
  
  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <div
        className={cn(
          'absolute inset-0 rounded-full border-2 border-transparent animate-spin',
          variant === 'primary' && gradient ? 'bg-gradient-primary' : '',
          variant === 'secondary' && gradient ? 'bg-gradient-secondary' : '',
          variant === 'accent' && gradient ? 'bg-gradient-accent' : '',
          variant === 'success' && gradient ? 'bg-gradient-success' : '',
          variant === 'warning' && gradient ? 'bg-gradient-warning' : '',
          variant === 'danger' && gradient ? 'bg-gradient-danger' : '',
          !gradient && `border-t-transparent ${variantClasses[variant]}`
        )}
      />
    </div>
  );
};

export default {
  ModernButton,
  ModernCard,
  ModernInput,
  ModernBadge,
  ModernProgress,
  ModernSpinner,
};