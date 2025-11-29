import React from 'react';
import { cn } from '../../utils/cn';

export interface GridProps {
  children?: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12'
};

const gapClasses = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8'
};

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch'
};

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly'
};

export const Grid: React.FC<GridProps> = ({
  children,
  className,
  cols = 1,
  gap = 'md',
  responsive = true,
  align = 'stretch',
  justify = 'start'
}) => {
  const classes = cn(
    'grid',
    gridCols[cols],
    gapClasses[gap],
    alignClasses[align],
    justifyClasses[justify],
    {
      'md:grid-cols-2': responsive && cols === 1,
      'md:grid-cols-3': responsive && cols === 2,
      'md:grid-cols-4': responsive && cols === 3,
      'lg:grid-cols-6': responsive && cols >= 4
    },
    className
  );

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export default Grid;