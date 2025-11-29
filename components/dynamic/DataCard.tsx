import React from 'react';
import { cn } from '../../utils/cn';

export interface DataCardProps {
  title?: string;
  subtitle?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  bordered?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: boolean;
  image?: string;
  imageAlt?: string;
  imagePosition?: 'top' | 'left' | 'right';
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    icon?: React.ReactNode;
  }>;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
}

const variantClasses = {
  default: 'bg-white border-gray-200',
  primary: 'bg-blue-50 border-blue-200',
  success: 'bg-green-50 border-green-200',
  warning: 'bg-yellow-50 border-yellow-200',
  danger: 'bg-red-50 border-red-200',
  info: 'bg-cyan-50 border-cyan-200'
};

const sizeClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg'
};

export const DataCard: React.FC<DataCardProps> = ({
  title,
  subtitle,
  description,
  children,
  className,
  variant = 'default',
  size = 'md',
  bordered = true,
  shadow = 'sm',
  rounded = true,
  image,
  imageAlt,
  imagePosition = 'top',
  actions = [],
  header,
  footer,
  loading = false
}) => {
  const classes = cn(
    'border',
    variantClasses[variant],
    sizeClasses[size],
    shadowClasses[shadow],
    {
      'rounded-lg': rounded,
      'overflow-hidden': image && imagePosition === 'top'
    },
    className
  );

  if (loading) {
    return (
      <div className={classes}>
        <div className="animate-pulse">
          {image && imagePosition === 'top' && (
            <div className="w-full h-48 bg-gray-200"></div>
          )}
          <div className="p-6">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderHeader = () => {
    if (header) return header;
    if (!title && !subtitle && !description) return null;

    return (
      <div className="mb-4">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-600 mb-2">
            {subtitle}
          </p>
        )}
        {description && (
          <p className="text-sm text-gray-700">
            {description}
          </p>
        )}
      </div>
    );
  };

  const renderImage = () => {
    if (!image) return null;

    const imageClasses = cn({
      'w-full h-48 object-cover': imagePosition === 'top',
      'w-24 h-24 object-cover rounded-lg flex-shrink-0': imagePosition === 'left' || imagePosition === 'right'
    });

    return (
      <img
        src={image}
        alt={imageAlt || title || 'Card image'}
        className={imageClasses}
      />
    );
  };

  const renderActions = () => {
    if (actions.length === 0) return null;

    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2',
              {
                'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500': action.variant === 'primary',
                'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500': action.variant === 'secondary',
                'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500': action.variant === 'outline',
                'text-gray-700 hover:bg-gray-100 focus:ring-gray-500': action.variant === 'ghost'
              }
            )}
          >
            {action.icon && <span className="mr-1">{action.icon}</span>}
            {action.label}
          </button>
        ))}
      </div>
    );
  };

  const renderFooter = () => {
    if (footer) return footer;
    if (actions.length > 0) return renderActions();
    return null;
  };

  const renderContent = () => {
    if (imagePosition === 'left' || imagePosition === 'right') {
      return (
        <div className={cn('flex gap-4', {
          'flex-row': imagePosition === 'left',
          'flex-row-reverse': imagePosition === 'right'
        })}>
          {renderImage()}
          <div className="flex-1">
            {renderHeader()}
            {children}
            {renderFooter()}
          </div>
        </div>
      );
    }

    return (
      <>
        {renderImage()}
        <div className="p-6">
          {renderHeader()}
          {children}
          {renderFooter()}
        </div>
      </>
    );
  };

  return (
    <div className={classes}>
      {renderContent()}
    </div>
  );
};

export default DataCard;