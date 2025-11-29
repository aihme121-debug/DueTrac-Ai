import React from 'react';
import { cn } from './utils/cn';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  safeArea?: boolean;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ 
  children, 
  className,
  padding = 'medium',
  safeArea = true
}) => {
  const paddingClasses = {
    none: '',
    small: 'p-2',
    medium: 'p-4',
    large: 'p-6'
  };

  return (
    <div 
      className={cn(
        'mobile-container',
        paddingClasses[padding],
        safeArea && 'mobile-safe-area',
        className
      )}
    >
      {children}
    </div>
  );
};

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'elevated' | 'outlined' | 'filled';
  onClick?: () => void;
}

export const MobileCard: React.FC<MobileCardProps> = ({ 
  children, 
  className,
  variant = 'elevated',
  onClick
}) => {
  const variantClasses = {
    elevated: 'bg-white shadow-lg border border-gray-100',
    outlined: 'bg-white border border-gray-200',
    filled: 'bg-gray-50 border border-transparent'
  };

  return (
    <div 
      className={cn(
        'mobile-card rounded-xl transition-all duration-200',
        variantClasses[variant],
        onClick && 'cursor-pointer active:scale-98 mobile-touch-feedback',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface MobileButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const MobileButton: React.FC<MobileButtonProps> = ({ 
  children, 
  className,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  leftIcon,
  rightIcon
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200'
  };

  const sizeClasses = {
    small: 'mobile-btn-sm',
    medium: 'mobile-btn',
    large: 'mobile-btn-lg'
  };

  return (
    <button
      className={cn(
        'mobile-button inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        loading && 'cursor-wait',
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      )}
      {leftIcon && !loading && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

interface MobileInputProps {
  className?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
  disabled?: boolean;
}

export const MobileInput: React.FC<MobileInputProps> = ({ 
  className,
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  leftIcon,
  rightIcon,
  error = false,
  disabled = false
}) => {
  return (
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {leftIcon}
        </div>
      )}
      <input
        type={type}
        className={cn(
          'mobile-input w-full border rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300',
          leftIcon ? 'pl-10' : 'pl-3',
          rightIcon ? 'pr-10' : 'pr-3',
          disabled && 'bg-gray-100 cursor-not-allowed',
          className
        )}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {rightIcon}
        </div>
      )}
    </div>
  );
};

interface MobileGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'small' | 'medium' | 'large';
}

export const MobileGrid: React.FC<MobileGridProps> = ({ 
  children, 
  className,
  cols = 2,
  gap = 'medium'
}) => {
  const gridClasses = {
    1: 'mobile-grid',
    2: 'mobile-grid-2',
    3: 'tablet-grid-3',
    4: 'tablet-grid-4'
  };

  const gapClasses = {
    small: 'mobile-gap-2',
    medium: 'mobile-gap-4',
    large: 'gap-6'
  };

  return (
    <div 
      className={cn(
        'grid',
        gridClasses[cols],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

interface MobileEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    text: string;
    onClick: () => void;
  };
}

export const MobileEmptyState: React.FC<MobileEmptyStateProps> = ({ 
  icon,
  title,
  description,
  action
}) => {
  return (
    <div className="mobile-empty">
      {icon && (
        <div className="mobile-empty-icon">
          {icon}
        </div>
      )}
      <h3 className="mobile-empty-title">{title}</h3>
      {description && (
        <p className="mobile-empty-description">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          <MobileButton onClick={action.onClick}>
            {action.text}
          </MobileButton>
        </div>
      )}
    </div>
  );
};

interface MobileLoadingProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
}

export const MobileLoading: React.FC<MobileLoadingProps> = ({ 
  text = 'Loading...',
  size = 'medium'
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="mobile-loading">
      <div className={cn(
        'border-2 border-blue-600 border-t-transparent rounded-full animate-spin',
        sizeClasses[size]
      )} />
      {text && (
        <p className="mt-4 text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );
};

export default {
  MobileContainer,
  MobileCard,
  MobileButton,
  MobileInput,
  MobileGrid,
  MobileEmptyState,
  MobileLoading
};