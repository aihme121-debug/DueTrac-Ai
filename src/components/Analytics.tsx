import React from 'react';
import { useResponsive } from '../hooks/useResponsive';

export interface AnalyticsCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  subtitle?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function AnalyticsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  subtitle,
  icon,
  loading = false,
  className = '',
}: AnalyticsCardProps) {
  const { isMobile } = useResponsive();

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-gray-900`}>{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      
      <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 mb-1`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      
      {change !== undefined && (
        <div className={`flex items-center ${getChangeColor()}`}>
          <span className="ml-1 text-sm font-medium">
            {change > 0 ? '+' : ''}{change}%
          </span>
        </div>
      )}
      
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

export interface SimpleChartProps {
  data: Array<{ name: string; value: number }>;
  title?: string;
  height?: number;
  color?: string;
  loading?: boolean;
  className?: string;
}

export function SimpleChart({
  data,
  title,
  height = 200,
  color = '#3B82F6',
  loading = false,
  className = '',
}: SimpleChartProps) {
  const { isMobile } = useResponsive();

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="text-gray-500 text-center py-8">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      
      <div className="relative" style={{ height: `${height}px` }}>
        <div className="absolute inset-0 flex items-end justify-between">
          {data.map((point, index) => {
            const barHeight = ((point.value - minValue) / range) * (height - 20);
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center justify-end">
                <div 
                  className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                  style={{ 
                    height: `${Math.max(barHeight, 10)}px`,
                    backgroundColor: color,
                    opacity: 0.8
                  }}
                />
                
                <div className="text-xs text-gray-600 mt-2 text-center">
                  {point.name}
                </div>
                
                <div className="text-xs font-medium text-gray-900 mt-1">
                  {point.value.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}