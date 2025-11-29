import React, { useState, useCallback } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import { cn } from '../utils/cn';

export interface MobileNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;

  children?: MobileNavItem[];
}

export interface MobileNavigationProps {
  items: MobileNavItem[];
  activeItem?: string;
  onItemClick?: (item: MobileNavItem) => void;
  className?: string;
  position?: 'bottom' | 'top' | 'left' | 'right';
}

export function MobileNavigation({
  items,
  activeItem,
  onItemClick,
  className = '',
  position = 'bottom',
}: MobileNavigationProps) {
  const { isMobile } = useResponsive();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleItemClick = useCallback((item: MobileNavItem) => {
    if (item.onClick) {
      item.onClick();
    }
    if (onItemClick) {
      onItemClick(item);
    }
    setIsMenuOpen(false);
  }, [onItemClick]);

  if (!isMobile) {
    return null;
  }

  const getPositionClass = () => {
    switch (position) {
      case 'top':
        return 'top-0 left-0 right-0';
      case 'bottom':
        return 'bottom-0 left-0 right-0';
      case 'left':
        return 'top-0 left-0 bottom-0';
      case 'right':
        return 'top-0 right-0 bottom-0';
      default:
        return 'bottom-0 left-0 right-0';
    }
  };

  const getOrientationClass = () => {
    return position === 'left' || position === 'right' 
      ? 'flex-col' 
      : 'flex-row';
  };

  return (
    <>
      {/* Backdrop */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Navigation */}
      <nav className={cn(
        'fixed bg-white border-gray-200 border-t z-50',
        getPositionClass(),
        className
      )}>
        <div className={cn(
          'flex items-center justify-around p-2',
          getOrientationClass()
        )}>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-lg transition-colors',
                'hover:bg-gray-100 active:bg-gray-200',
                activeItem === item.id 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600'
              )}
            >
              <div className="relative">
                {item.icon}

              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}

export interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  className?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export function MobileHeader({
  title,
  subtitle,
  leftAction,
  rightAction,
  className = '',
  showBackButton = false,
  onBackClick,
}: MobileHeaderProps) {
  const { isMobile } = useResponsive();

  if (!isMobile) {
    return null;
  }

  return (
    <header className={cn(
      'sticky top-0 z-40 bg-white border-b border-gray-200',
      className
    )}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center flex-1">
          {showBackButton && (
            <button
              onClick={onBackClick}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {leftAction && <div className="ml-2">{leftAction}</div>}
        </div>
        
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        
        <div className="flex items-center justify-end flex-1">
          {rightAction && <div className="mr-2">{rightAction}</div>}
        </div>
      </div>
    </header>
  );
}

export interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: boolean;
  onClick?: () => void;
}

export function MobileCard({
  children,
  className = '',
  padding = 'medium',
  shadow = true,
  onClick,
}: MobileCardProps) {
  const { isMobile } = useResponsive();

  if (!isMobile) {
    return null;
  }

  const paddingClass = {
    none: '',
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6',
  }[padding];

  const shadowClass = shadow ? 'shadow-sm' : '';

  const Component = onClick ? 'button' : 'div';
  const additionalProps = onClick ? { onClick } : {};

  return (
    <Component
      className={cn(
        'bg-white rounded-lg border border-gray-200',
        paddingClass,
        shadowClass,
        onClick && 'active:scale-98 transition-transform',
        className
      )}
      {...additionalProps}
    >
      {children}
    </Component>
  );
}