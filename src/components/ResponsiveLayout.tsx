import React from 'react';
import { useResponsive } from '../hooks/useResponsive';

export interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  largeDesktop?: React.ReactNode;
}

export function ResponsiveLayout({
  children,
  className = '',
  mobile,
  tablet,
  desktop,
  largeDesktop,
}: ResponsiveLayoutProps) {
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();

  // If specific layouts are provided, use them based on screen size
  if (isMobile && mobile) return <>{mobile}</>;
  if (isTablet && tablet) return <>{tablet}</>;
  if (isDesktop && desktop) return <>{desktop}</>;
  if (isLargeDesktop && largeDesktop) return <>{largeDesktop}</>;

  // Otherwise, render children with responsive classes
  return (
    <div className={`responsive-layout ${className}`}>
      {children}
    </div>
  );
}

export interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    largeDesktop?: number;
  };
  gap?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    largeDesktop?: number;
  };
}

export function ResponsiveGrid({
  children,
  className = '',
  cols = { mobile: 1, tablet: 2, desktop: 3, largeDesktop: 4 },
  gap = { mobile: 4, tablet: 4, desktop: 6, largeDesktop: 8 },
}: ResponsiveGridProps) {
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();

  const getGridClass = () => {
    const currentCols = isLargeDesktop ? cols.largeDesktop : isDesktop ? cols.desktop : isTablet ? cols.tablet : cols.mobile;
    const currentGap = isLargeDesktop ? gap.largeDesktop : isDesktop ? gap.desktop : isTablet ? gap.tablet : gap.mobile;
    
    return `grid grid-cols-${currentCols} gap-${currentGap}`;
  };

  return (
    <div className={`${getGridClass()} ${className}`}>
      {children}
    </div>
  );
}

export interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  direction?: {
    mobile?: 'vertical' | 'horizontal';
    tablet?: 'vertical' | 'horizontal';
    desktop?: 'vertical' | 'horizontal';
    largeDesktop?: 'vertical' | 'horizontal';
  };
  spacing?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    largeDesktop?: number;
  };
  align?: {
    mobile?: 'start' | 'center' | 'end' | 'stretch';
    tablet?: 'start' | 'center' | 'end' | 'stretch';
    desktop?: 'start' | 'center' | 'end' | 'stretch';
    largeDesktop?: 'start' | 'center' | 'end' | 'stretch';
  };
}

export function ResponsiveStack({
  children,
  className = '',
  direction = { mobile: 'vertical', tablet: 'vertical', desktop: 'horizontal', largeDesktop: 'horizontal' },
  spacing = { mobile: 4, tablet: 4, desktop: 6, largeDesktop: 8 },
  align = { mobile: 'stretch', tablet: 'stretch', desktop: 'center', largeDesktop: 'center' },
}: ResponsiveStackProps) {
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();

  const getStackClass = () => {
    const currentDirection = isLargeDesktop ? direction.largeDesktop : isDesktop ? direction.desktop : isTablet ? direction.tablet : direction.mobile;
    const currentSpacing = isLargeDesktop ? spacing.largeDesktop : isDesktop ? spacing.desktop : isTablet ? spacing.tablet : spacing.mobile;
    const currentAlign = isLargeDesktop ? align.largeDesktop : isDesktop ? align.desktop : isTablet ? align.tablet : align.mobile;
    
    const flexDirection = currentDirection === 'vertical' ? 'flex-col' : 'flex-row';
    const gapClass = `gap-${currentSpacing}`;
    const alignClass = `items-${currentAlign === 'start' ? 'start' : currentAlign === 'end' ? 'end' : currentAlign === 'center' ? 'center' : 'stretch'}`;
    
    return `flex ${flexDirection} ${gapClass} ${alignClass}`;
  };

  return (
    <div className={`${getStackClass()} ${className}`}>
      {children}
    </div>
  );
}

export interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: {
    mobile?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    tablet?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    desktop?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    largeDesktop?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  };
  padding?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    largeDesktop?: number;
  };
}

export function ResponsiveContainer({
  children,
  className = '',
  maxWidth = { mobile: 'full', tablet: 'full', desktop: 'lg', largeDesktop: 'xl' },
  padding = { mobile: 4, tablet: 6, desktop: 8, largeDesktop: 8 },
}: ResponsiveContainerProps) {
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();

  const getContainerClass = () => {
    const currentMaxWidth = isLargeDesktop ? maxWidth.largeDesktop : isDesktop ? maxWidth.desktop : isTablet ? maxWidth.tablet : maxWidth.mobile;
    const currentPadding = isLargeDesktop ? padding.largeDesktop : isDesktop ? padding.desktop : isTablet ? padding.tablet : padding.mobile;
    
    const maxWidthClass = currentMaxWidth === 'full' ? 'max-w-full' : `max-w-${currentMaxWidth}`;
    const paddingClass = `px-${currentPadding}`;
    
    return `w-full mx-auto ${maxWidthClass} ${paddingClass}`;
  };

  return (
    <div className={`${getContainerClass()} ${className}`}>
      {children}
    </div>
  );
}