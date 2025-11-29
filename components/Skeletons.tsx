import React from 'react';
import { cn } from '../utils/cn';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  width, 
  height, 
  rounded = false, 
  circle = false 
}) => {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div 
      className={cn(
        'animate-pulse bg-gray-200',
        rounded && 'rounded-md',
        circle && 'rounded-full',
        className
      )}
      style={style}
    />
  );
};

interface CardSkeletonProps {
  className?: string;
  lines?: number;
  showHeader?: boolean;
  showFooter?: boolean;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ 
  className, 
  lines = 3, 
  showHeader = true, 
  showFooter = true 
}) => {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <Skeleton width={120} height={20} rounded />
          <Skeleton width={60} height={24} rounded />
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} height={16} rounded />
        ))}
      </div>
      
      {showFooter && (
        <div className="flex items-center justify-between mt-6">
          <Skeleton width={80} height={32} rounded />
          <div className="flex gap-2">
            <Skeleton width={60} height={32} rounded />
            <Skeleton width={60} height={32} rounded />
          </div>
        </div>
      )}
    </div>
  );
};

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  rows = 5, 
  columns = 4, 
  className 
}) => {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} height={16} width={80} rounded />
          ))}
        </div>
      </div>
      
      {/* Body */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} height={16} rounded />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ChartSkeletonProps {
  className?: string;
  height?: number;
}

export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ 
  className, 
  height = 300 
}) => {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton width={120} height={20} rounded />
        <Skeleton width={60} height={24} rounded />
      </div>
      <Skeleton height={height} rounded />
    </div>
  );
};

interface DashboardSkeletonProps {
  className?: string;
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ className }) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} lines={2} showHeader={false} showFooter={false} />
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      
      {/* Table */}
      <TableSkeleton />
    </div>
  );
};

export default {
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  ChartSkeleton,
  DashboardSkeleton
};