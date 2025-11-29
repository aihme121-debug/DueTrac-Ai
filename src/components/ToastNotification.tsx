import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertTriangle, Info, Clock, Bell, CreditCard, UserPlus, DollarSign } from 'lucide-react';
import type { Notification, NotificationType, NotificationPriority } from '../types';
import { notificationService } from '../services/notificationService';
import { cn } from '../utils/cn';
import { formatDistanceToNow } from 'date-fns';

interface ToastNotificationProps {
  notification: Notification;
  onClose: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ 
  notification, 
  onClose, 
  position = 'top-right' 
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getIcon = () => {
    switch (notification.type) {
      case NotificationType.SUCCESS:
      case NotificationType.PAYMENT_RECEIVED:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case NotificationType.WARNING:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case NotificationType.ERROR:
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case NotificationType.INFO:
      case NotificationType.SYSTEM:
        return <Info className="w-5 h-5 text-blue-500" />;
      case NotificationType.REMINDER:
      case NotificationType.PAYMENT_DUE:
        return <Clock className="w-5 h-5 text-orange-500" />;
      case NotificationType.CUSTOMER_CREATED:
        return <UserPlus className="w-5 h-5 text-purple-500" />;
      case NotificationType.DUE_OVERDUE:
        return <DollarSign className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  const getAnimationClasses = () => {
    if (isExiting) {
      return position.includes('right') ? 'animate-slide-out-right' : 'animate-slide-out-left';
    }
    return position.includes('right') ? 'animate-slide-in-right' : 'animate-slide-in-left';
  };

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleActionClick = (action: any) => {
    console.log('Toast action clicked:', action.action);
    // Handle action click logic here
    handleClose();
  };

  const handleNotificationClick = () => {
    notificationService.markAsRead(notification.id);
    handleClose();
  };

  return (
    <div
      className={cn(
        'fixed z-50 w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg',
        'border border-gray-200 dark:border-gray-700 overflow-hidden',
        'transform transition-all duration-300 ease-in-out',
        getPositionClasses(),
        getAnimationClasses(),
        isHovered && 'scale-105 shadow-xl'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Progress bar for auto-dismiss */}
      <div className="absolute top-0 left-0 h-1 bg-blue-500 animate-progress" />
      
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {notification.message}
                </p>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
              </div>
              
              <button
                onClick={handleClose}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {notification.actions && notification.actions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {notification.actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action)}
                    className={cn(
                      'px-3 py-1 text-xs rounded-md transition-colors',
                      action.type === 'primary' && 'bg-blue-100 text-blue-700 hover:bg-blue-200',
                      action.type === 'secondary' && 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                      action.type === 'danger' && 'bg-red-100 text-red-700 hover:bg-red-200'
                    )}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Clickable overlay */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={handleNotificationClick}
      />
    </div>
  );
};

interface ToastNotificationContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxNotifications?: number;
  autoDismissDelay?: number;
}

export const ToastNotificationContainer: React.FC<ToastNotificationContainerProps> = ({
  position = 'top-right',
  maxNotifications = 5,
  autoDismissDelay = 5000
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleInAppNotification = useCallback((event: CustomEvent) => {
    const notification = event.detail as Notification;
    
    setNotifications(prev => {
      // Remove duplicates
      const filtered = prev.filter(n => n.id !== notification.id);
      
      // Add new notification at the beginning
      const updated = [notification, ...filtered];
      
      // Limit to max notifications
      return updated.slice(0, maxNotifications);
    });

    // Auto-dismiss after delay
    setTimeout(() => {
      handleClose(notification.id);
    }, autoDismissDelay);
  }, [maxNotifications, autoDismissDelay]);

  const handleClose = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  useEffect(() => {
    window.addEventListener('inAppNotification', handleInAppNotification as EventListener);
    
    return () => {
      window.removeEventListener('inAppNotification', handleInAppNotification as EventListener);
    };
  }, [handleInAppNotification]);

  return createPortal(
    <div className="relative">
      {notifications.map((notification) => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          onClose={() => handleClose(notification.id)}
          position={position}
        />
      ))}
    </div>,
    document.body
  );
};

export default ToastNotificationContainer;