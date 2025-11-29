import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, Check, AlertTriangle, Info, CheckCircle, Clock, Settings, Trash2, Archive, Filter, Search, BellOff } from 'lucide-react';
import type { Notification, NotificationPriority } from '@/types';
import { NotificationType } from '@/types';
import { notificationService } from '@/services/notificationService';
import { cn } from '@/utils/cn';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onRead, 
  onArchive, 
  onDelete 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const getIcon = () => {
    switch (notification.type) {
      case NotificationType.SUCCESS:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case NotificationType.WARNING:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case NotificationType.ERROR:
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case NotificationType.INFO:
        return <Info className="w-5 h-5 text-blue-500" />;
      case NotificationType.REMINDER:
        return <Clock className="w-5 h-5 text-purple-500" />;
      case NotificationType.PAYMENT_DUE:
        return <Clock className="w-5 h-5 text-orange-500" />;
      case NotificationType.PAYMENT_RECEIVED:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case NotificationPriority.URGENT:
        return 'border-l-red-500';
      case NotificationPriority.HIGH:
        return 'border-l-orange-500';
      case NotificationPriority.MEDIUM:
        return 'border-l-yellow-500';
      case NotificationPriority.LOW:
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
  };

  const handleArchive = () => {
    setIsExiting(true);
    setTimeout(() => {
      onArchive(notification.id);
    }, 300);
  };

  const handleDelete = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDelete(notification.id);
    }, 300);
  };

  return (
    <div
      className={cn(
        'relative group bg-white/60 backdrop-blur-sm border border-white/20',
        'rounded-2xl p-4 shadow-soft hover:shadow-medium transition-all duration-300',
        'border-l-4 cursor-pointer transform',
        getPriorityColor(),
        notification.read ? 'opacity-70' : 'opacity-100',
        isExiting ? 'animate-slide-out-right' : 'animate-slide-in-left',
        isHovered && 'scale-[1.02] -translate-y-1',
        'hover:bg-white/80'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 mt-1">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            'bg-gradient-to-br from-white/80 to-white/60 shadow-inner',
            notification.priority === NotificationPriority.URGENT && 'bg-red-100/80',
            notification.priority === NotificationPriority.HIGH && 'bg-orange-100/80',
            notification.priority === NotificationPriority.MEDIUM && 'bg-yellow-100/80',
            notification.priority === NotificationPriority.LOW && 'bg-blue-100/80'
          )}>
            {getIcon()}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={cn(
                  'text-sm font-semibold text-gray-900',
                  !notification.read && 'font-bold'
                )}>
                  {notification.title}
                </h4>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-glow-blue" />
                )}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {notification.message}
              </p>
              
              {notification.actions && notification.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {notification.actions.map((action) => (
                    <button
                      key={action.id}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200',
                        'backdrop-blur-sm border',
                        action.type === 'primary' && 'bg-blue-500/90 text-white border-blue-400 hover:bg-blue-600 shadow-glow-blue',
                        action.type === 'secondary' && 'bg-gray-500/90 text-white border-gray-400 hover:bg-gray-600',
                        action.type === 'danger' && 'bg-red-500/90 text-white border-red-400 hover:bg-red-600 shadow-glow-red'
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle action click
                        console.log('Action clicked:', action.action);
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end space-y-2 ml-4">
              <span className="text-xs text-gray-500 font-medium">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </span>
              
              <div className={cn(
                'flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200',
                'transform translate-y-0 group-hover:translate-y-0'
              )}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchive();
                  }}
                  className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200"
                  title="Archive"
                >
                  <Archive className="w-4 h-4" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {notification.tags && notification.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/20">
          {notification.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-blue-100/80 to-purple-100/80 text-blue-700 rounded-full backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

interface NotificationCenterProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  userId, 
  isOpen, 
  onClose 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');
  const [stats, setStats] = useState({ total: 0, unread: 0 });

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const options: any = {};
      
      if (filter === 'unread') {
        options.unreadOnly = true;
      } else if (filter === 'archived') {
        options.archived = true;
      } else {
        options.archived = false;
      }

      if (selectedType !== 'all') {
        options.type = selectedType;
      }

      const notificationData = await notificationService.getNotifications(userId, options);
      
      // Filter by search term
      const filtered = notificationData.filter(notification => 
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      setNotifications(filtered);
      
      const stats = await notificationService.getNotificationStats(userId);
      setStats({ total: stats.total, unread: stats.unread });
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, filter, searchTerm, selectedType]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      
      // Set up real-time listener
      const handleInAppNotification = (event: CustomEvent) => {
        loadNotifications();
      };
      
      window.addEventListener('inAppNotification', handleInAppNotification);
      
      return () => {
        window.removeEventListener('inAppNotification', handleInAppNotification);
      };
    }
  }, [isOpen, loadNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleArchive = async (notificationId: string) => {
    try {
      await notificationService.archiveNotification(notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Failed to archive notification:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(unreadNotifications.map(n => notificationService.markAsRead(n.id)));
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      try {
        await Promise.all(notifications.map(n => notificationService.deleteNotification(n.id)));
        loadNotifications();
      } catch (error) {
        console.error('Failed to clear all notifications:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-96 max-h-[80vh] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 transform transition-all duration-300 ease-out overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Notifications
                </h2>
                <p className="text-sm text-gray-500">
                  {stats.unread > 0 ? `${stats.unread} unread` : 'All caught up!'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleMarkAllAsRead}
                className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200"
                title="Mark all as read"
              >
                <Check className="w-4 h-4" />
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="p-4 border-b border-gray-200/50 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-gray-200/50 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="flex-1 px-3 py-2 bg-white/50 border border-gray-200/50 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="archived">Archived</option>
              </select>
              
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="flex-1 px-3 py-2 bg-white/50 border border-gray-200/50 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
              >
                <option value="all">All Types</option>
                {Object.values(NotificationType).map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).split('_').join(' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="relative">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-500"></div>
                  <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/20"></div>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <div className="relative mb-4">
                  <BellOff className="w-16 h-16 opacity-40" />
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {filter === 'unread' ? 'No unread notifications' : 
                   filter === 'archived' ? 'No archived notifications' :
                   'All caught up!'}
                </h3>
                <p className="text-sm text-gray-500 text-center max-w-xs">
                  {filter === 'unread' ? "You've read all your notifications" : 
                   filter === 'archived' ? 'Your archive is empty' :
                   'You have no new notifications at the moment'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={handleMarkAsRead}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

interface NotificationBellProps {
  userId: string;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ userId, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const stats = await notificationService.getNotificationStats(userId);
      setUnreadCount(stats.unread);
    } catch (error) {
      console.error('Failed to load notification stats:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadStats();
    
    // Set up real-time listener
    const handleInAppNotification = () => {
      loadStats();
    };
    
    window.addEventListener('inAppNotification', handleInAppNotification);
    
    return () => {
      window.removeEventListener('inAppNotification', handleInAppNotification);
    };
  }, [loadStats]);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      loadStats();
    }
  };

  return (
    <>
      <button
        onClick={handleBellClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'relative p-3 text-gray-600 hover:text-gray-900 transition-all duration-300',
          'rounded-2xl backdrop-blur-sm border border-white/20',
          'bg-gradient-to-br from-white/40 to-white/20 shadow-soft',
          'hover:shadow-medium hover:scale-105 active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          isOpen && 'shadow-glow-blue scale-105',
          className
        )}
      >
        <div className="relative">
          <Bell className={cn(
            'w-5 h-5 transition-all duration-300',
            isHovered && 'animate-ring'
          )} />
          
          {!loading && unreadCount > 0 && (
            <div className="absolute -top-1 -right-1">
              <div className="relative">
                <span className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></span>
                <span className="relative bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </div>
            </div>
          )}
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[998] bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-0 z-[999] pointer-events-none">
            <div className="absolute right-4 top-20 pointer-events-auto">
              <NotificationCenter
                userId={userId}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default NotificationBell;