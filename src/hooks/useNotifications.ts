import { useState, useEffect, useCallback } from 'react';
import type { Notification, NotificationStats } from '../types';
import { notificationService } from '../services/notificationService';

interface UseNotificationsOptions {
  userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  stats: NotificationStats;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  createNotification: (data: any) => Promise<string>;
}

export const useNotifications = ({
  userId,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}: UseNotificationsOptions): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    read: 0,
    archived: 0,
    byType: {},
    byPriority: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [notificationsData, statsData] = await Promise.all([
        notificationService.getNotifications(userId, { archived: false }),
        notificationService.getNotificationStats(userId)
      ]);
      
      setNotifications(notificationsData);
      setStats(statsData);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      await refresh();
    } catch (err) {
      setError(err as Error);
      console.error('Failed to mark notification as read:', err);
    }
  }, [refresh]);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(unreadNotifications.map(n => notificationService.markAsRead(n.id)));
      await refresh();
    } catch (err) {
      setError(err as Error);
      console.error('Failed to mark all notifications as read:', err);
    }
  }, [notifications, refresh]);

  const archiveNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.archiveNotification(notificationId);
      await refresh();
    } catch (err) {
      setError(err as Error);
      console.error('Failed to archive notification:', err);
    }
  }, [refresh]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      await refresh();
    } catch (err) {
      setError(err as Error);
      console.error('Failed to delete notification:', err);
    }
  }, [refresh]);

  const clearAll = useCallback(async () => {
    try {
      await Promise.all(notifications.map(n => notificationService.deleteNotification(n.id)));
      await refresh();
    } catch (err) {
      setError(err as Error);
      console.error('Failed to clear all notifications:', err);
    }
  }, [notifications, refresh]);

  const createNotification = useCallback(async (data: any) => {
    try {
      const notificationId = await notificationService.createNotification({
        ...data,
        userId
      });
      await refresh();
      return notificationId;
    } catch (err) {
      setError(err as Error);
      console.error('Failed to create notification:', err);
      throw err;
    }
  }, [userId, refresh]);

  // Set up real-time listener
  useEffect(() => {
    const handleInAppNotification = () => {
      refresh();
    };

    window.addEventListener('inAppNotification', handleInAppNotification);

    return () => {
      window.removeEventListener('inAppNotification', handleInAppNotification);
    };
  }, [refresh]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, refresh]);

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Set current user in notification service
  useEffect(() => {
    notificationService.setCurrentUser(userId);
    
    return () => {
      notificationService.cleanup();
    };
  }, [userId]);

  return {
    notifications,
    stats,
    loading,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    clearAll,
    createNotification
  };
};

// Hook for notification preferences
export const useNotificationPreferences = (userId: string) => {
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const prefs = await notificationService.getUserPreferences(userId);
      setPreferences(prefs);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load notification preferences:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updatePreferences = useCallback(async (updates: any) => {
    try {
      await notificationService.updateUserPreferences(userId, updates);
      await loadPreferences();
    } catch (err) {
      setError(err as Error);
      console.error('Failed to update notification preferences:', err);
      throw err;
    }
  }, [userId, loadPreferences]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    loading,
    error,
    loadPreferences,
    updatePreferences
  };
};

// Hook for service worker and push notifications
export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const requestPermission = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await notificationService.requestNotificationPermission();
      setPermission(result);
      return result;
    } catch (err) {
      setError(err as Error);
      console.error('Failed to request notification permission:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const subscribeToPush = useCallback(async (publicVapidKey: string) => {
    try {
      setLoading(true);
      setError(null);
      const sub = await notificationService.subscribeToPushNotifications(publicVapidKey);
      setSubscription(sub);
      return sub;
    } catch (err) {
      setError(err as Error);
      console.error('Failed to subscribe to push notifications:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const unsubscribeFromPush = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await notificationService.unsubscribeFromPushNotifications();
      setSubscription(null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to unsubscribe from push notifications:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check current permission and subscription
  useEffect(() => {
    const checkStatus = async () => {
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }
      
      const sub = await notificationService.getPushSubscription();
      setSubscription(sub);
    };

    checkStatus();
  }, []);

  return {
    permission,
    subscription,
    loading,
    error,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush
  };
};

export default useNotifications;