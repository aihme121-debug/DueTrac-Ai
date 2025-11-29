import React from 'react';
import { cn } from '../../utils/cn';

export interface ContainerProps {
  children?: React.ReactNode;
  className?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'transparent' | 'white' | 'gray' | 'dark';
  border?: boolean;
  rounded?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
}

const maxWidthClasses = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full'
};

const paddingClasses = {
  none: 'p-0',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8'
};

const backgroundClasses = {
  transparent: 'bg-transparent',
  white: 'bg-white',
  gray: 'bg-gray-50',
  dark: 'bg-gray-900'
};

const shadowClasses = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl'
};

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  maxWidth = 'lg',
  padding = 'md',
  background = 'transparent',
  border = false,
  rounded = false,
  shadow = 'none',
  center = false
}) => {
  const classes = cn(
    'mx-auto',
    maxWidthClasses[maxWidth],
    paddingClasses[padding],
    backgroundClasses[background],
    {
      'border border-gray-200': border,
      'rounded-lg': rounded,
      [shadowClasses[shadow]]: shadow !== 'none',
      'flex items-center justify-center': center
    },
    className
  );

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export default Container;