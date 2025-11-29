import { db, isConfigured } from '@/services/firebase';
import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  setDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import type { 
  Notification, 
  NotificationPriority, 
  NotificationChannel, 
  NotificationPreferences, 
  NotificationStats,
  NotificationAction,
  DueItem,
  Customer
} from '@/types';
import { NotificationType, NotificationPriority } from '@/types';
import { PaymentStatus } from '@/types';

const NOTIFICATIONS_COL = 'notifications';
const NOTIFICATION_PREFERENCES_COL = 'notification_preferences';

class NotificationService {
  private unsubscribeListeners: Map<string, () => void> = new Map();
  private currentUserId: string | null = null;

  constructor() {
    this.initializeService();
  }

  private initializeService() {
    if (!isConfigured || !db) {
      console.warn('❌ Firebase not configured, notification service disabled');
      return;
    }
    console.log('✅ Notification service initialized');
  }

  setCurrentUser(userId: string) {
    console.log('🔔 NotificationService: Setting current user to:', userId);
    this.currentUserId = userId;
    this.setupRealtimeListeners();
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  private setupRealtimeListeners() {
    if (!this.currentUserId || !db) {
      console.log('🔔 NotificationService: Not setting up listeners - no user or db');
      return;
    }

    console.log('🔔 NotificationService: Setting up realtime listeners for user:', this.currentUserId);

    // Listen for new notifications - simplified query to avoid composite index
    const notificationsQuery = query(
      collection(db, NOTIFICATIONS_COL),
      where('userId', '==', this.currentUserId)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      console.log('🔔 NotificationService: Snapshot received, changes:', snapshot.docChanges().length);
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notification = change.doc.data() as Notification;
          console.log('🔔 NotificationService: New notification received:', notification.title);
          // Filter out archived and scheduled notifications client-side
          if (!notification.archived && !notification.scheduledFor) {
            this.handleNewNotification(notification);
          }
        }
      });
    }, (error) => {
      console.error('🔔 NotificationService: Error in realtime listener:', error);
    });

    this.unsubscribeListeners.set('notifications', unsubscribe);
    console.log('🔔 NotificationService: Realtime listener setup complete');
  }

  private handleNewNotification(notification: Notification) {
    // Handle in-app notifications
    if (notification.channels.includes(NotificationChannel.IN_APP)) {
      this.showInAppNotification(notification);
    }

    // Handle push notifications
    if (notification.channels.includes(NotificationChannel.PUSH)) {
      this.sendPushNotification(notification);
    }
  }

  private showInAppNotification(notification: Notification) {
    // Dispatch custom event for in-app notification display
    const event = new CustomEvent('inAppNotification', { detail: notification });
    window.dispatchEvent(event);
  }

  private async sendPushNotification(notification: Notification) {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        if (Notification.permission === 'granted') {
          await registration.showNotification(notification.title, {
            body: notification.message,
            icon: notification.icon || '/icon-192x192.png',
            badge: notification.badge || '/badge-72x72.png',
            tag: notification.id,
            data: notification.data,
            actions: notification.actions?.map(action => ({
              action: action.action,
              title: action.label,
              icon: action.type === 'primary' ? '/check-icon.png' : undefined
            })),
            requireInteraction: notification.priority === NotificationPriority.URGENT,
            silent: notification.priority === NotificationPriority.LOW
          });
        }
      } catch (error) {
        console.error('Failed to send push notification:', error);
      }
    }
  }

  // Create notification
  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    priority?: NotificationPriority;
    channels?: NotificationChannel[];
    actions?: NotificationAction[];
    data?: Record<string, any>;
    scheduledFor?: string;
    expiresAt?: string;
    tags?: string[];
    icon?: string;
    sound?: string;
    badge?: number;
  }): Promise<string> {
    if (!isConfigured || !db) {
      throw new Error('Firebase not configured');
    }

    const preferences = await this.getUserPreferences(data.userId);
    const effectiveChannels = data.channels || [NotificationChannel.IN_APP];
    const effectivePriority = data.priority || NotificationPriority.MEDIUM;

    // Filter channels based on user preferences
    const enabledChannels = effectiveChannels.filter(channel => {
      if (channel === NotificationChannel.IN_APP) return preferences.channels.inApp;
      if (channel === NotificationChannel.PUSH) return preferences.channels.push;
      if (channel === NotificationChannel.EMAIL) return preferences.channels.email;
      if (channel === NotificationChannel.SMS) return preferences.channels.sms;
      return true;
    });

    // Check if this notification type is enabled for the user
    const typeConfig = preferences.types[data.type];
    if (!typeConfig?.enabled) {
      console.log(`Notification type ${data.type} disabled for user ${data.userId}`);
      return '';
    }

    const notification: Omit<Notification, 'id'> = {
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      priority: typeConfig.priority || effectivePriority,
      channels: typeConfig.channels.filter(ch => enabledChannels.includes(ch)),
      actions: data.actions,
      data: data.data,
      read: false,
      archived: false,
      scheduledFor: data.scheduledFor,
      expiresAt: data.expiresAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clickedCount: 0,
      tags: data.tags,
      icon: data.icon,
      sound: data.sound,
      badge: data.badge
    };

    try {
      const docRef = await addDoc(collection(db, NOTIFICATIONS_COL), notification);
      
      // If scheduled, handle separately
      if (data.scheduledFor) {
        this.scheduleNotification({ ...notification, id: docRef.id });
      } else {
        this.handleNewNotification({ ...notification, id: docRef.id });
      }

      return docRef.id;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  // Get notifications
  async getNotifications(userId: string, options: {
    limit?: number;
    unreadOnly?: boolean;
    type?: NotificationType;
    priority?: NotificationPriority;
    archived?: boolean;
  } = {}): Promise<Notification[]> {
    if (!isConfigured || !db) {
      return [];
    }

    // Simplified query to avoid composite index requirements
    // Remove orderBy to avoid composite index - we'll sort client-side
    let q = query(
      collection(db, NOTIFICATIONS_COL),
      where('userId', '==', userId)
    );

    try {
      const snapshot = await getDocs(q);
      let notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));

      // Apply filters client-side to avoid composite index requirements
      if (options.unreadOnly) {
        notifications = notifications.filter(n => !n.read);
      }

      if (options.type) {
        notifications = notifications.filter(n => n.type === options.type);
      }

      if (options.priority) {
        notifications = notifications.filter(n => n.priority === options.priority);
      }

      if (options.archived !== undefined) {
        notifications = notifications.filter(n => n.archived === options.archived);
      }

      // Apply limit if specified
      if (options.limit) {
        notifications = notifications.slice(0, options.limit);
      }

      // Sort by createdAt descending (newest first) - client-side sorting to avoid composite index
      notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return notifications;
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    if (!isConfigured || !db) {
      throw new Error('Firebase not configured');
    }

    try {
      await setDoc(
        doc(db, NOTIFICATIONS_COL, notificationId),
        {
          read: true,
          readAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          clickedCount: (await this.getNotification(notificationId))?.clickedCount + 1 || 1,
          clickedAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Archive notification
  async archiveNotification(notificationId: string): Promise<void> {
    if (!isConfigured || !db) {
      throw new Error('Firebase not configured');
    }

    try {
      await setDoc(
        doc(db, NOTIFICATIONS_COL, notificationId),
        {
          archived: true,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Failed to archive notification:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    if (!isConfigured || !db) {
      throw new Error('Firebase not configured');
    }

    try {
      await deleteDoc(doc(db, NOTIFICATIONS_COL, notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  // Get notification stats
  async getNotificationStats(userId: string): Promise<NotificationStats> {
    if (!isConfigured || !db) {
      return {
        total: 0,
        unread: 0,
        read: 0,
        archived: 0,
        byType: {} as Record<NotificationType, number>,
        byPriority: {} as Record<NotificationPriority, number>
      };
    }

    try {
      const notifications = await this.getNotifications(userId);
      
      const stats: NotificationStats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.read && !n.archived).length,
        read: notifications.filter(n => n.read && !n.archived).length,
        archived: notifications.filter(n => n.archived).length,
        byType: {} as Record<NotificationType, number>,
        byPriority: {} as Record<NotificationPriority, number>
      };

      // Count by type
      const allTypes: NotificationType[] = [
        NotificationType.INFO,
        NotificationType.SUCCESS,
        NotificationType.WARNING,
        NotificationType.ERROR,
        NotificationType.REMINDER,
        NotificationType.PAYMENT_DUE,
        NotificationType.PAYMENT_RECEIVED,
        NotificationType.CUSTOMER_CREATED,
        NotificationType.DUE_OVERDUE,
        NotificationType.SYSTEM
      ];
      
      allTypes.forEach(type => {
        stats.byType[type] = notifications.filter(n => n.type === type).length;
      });

      // Count by priority
      const allPriorities: NotificationPriority[] = [
        NotificationPriority.LOW,
        NotificationPriority.MEDIUM,
        NotificationPriority.HIGH,
        NotificationPriority.URGENT
      ];
      
      allPriorities.forEach(priority => {
        stats.byPriority[priority] = notifications.filter(n => n.priority === priority).length;
      });

      // Get last notification date
      if (notifications.length > 0) {
        stats.lastNotificationAt = notifications[0].createdAt;
      }

      return stats;
    } catch (error) {
      console.error('Failed to get notification stats:', error);
      return {
        total: 0,
        unread: 0,
        read: 0,
        archived: 0,
        byType: {} as Record<NotificationType, number>,
        byPriority: {} as Record<NotificationPriority, number>
      };
    }
  }

  // Get user preferences
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    if (!isConfigured || !db) {
      return this.getDefaultPreferences(userId);
    }

    try {
      const docRef = doc(db, NOTIFICATION_PREFERENCES_COL, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as NotificationPreferences;
      }
      
      // Return default preferences if not found
      return this.getDefaultPreferences(userId);
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return this.getDefaultPreferences(userId);
    }
  }

  // Update user preferences
  async updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    if (!isConfigured || !db) {
      throw new Error('Firebase not configured');
    }

    try {
      const currentPreferences = await this.getUserPreferences(userId);
      const updatedPreferences: NotificationPreferences = {
        ...currentPreferences,
        ...preferences,
        userId,
        updatedAt: new Date().toISOString()
      };

      await setDoc(
        doc(db, NOTIFICATION_PREFERENCES_COL, userId),
        updatedPreferences,
        { merge: true }
      );
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw error;
    }
  }

  // Get default preferences
  private getDefaultPreferences(userId: string): NotificationPreferences {
    const defaultTypes = {} as Record<NotificationType, { enabled: boolean; channels: NotificationChannel[]; priority: NotificationPriority }>;
    
    const allTypes: NotificationType[] = [
      NotificationType.INFO,
      NotificationType.SUCCESS,
      NotificationType.WARNING,
      NotificationType.ERROR,
      NotificationType.REMINDER,
      NotificationType.PAYMENT_DUE,
      NotificationType.PAYMENT_RECEIVED,
      NotificationType.CUSTOMER_CREATED,
      NotificationType.DUE_OVERDUE,
      NotificationType.SYSTEM
    ];
    
    allTypes.forEach(type => {
      defaultTypes[type] = {
        enabled: true,
        channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
        priority: type === NotificationType.ERROR ? NotificationPriority.HIGH :
                  type === NotificationType.WARNING ? NotificationPriority.MEDIUM :
                  NotificationPriority.LOW
      };
    });

    return {
      userId,
      channels: {
        inApp: true,
        push: true,
        email: false,
        sms: false
      },
      types: defaultTypes,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      dailyDigest: {
        enabled: false,
        time: '09:00'
      },
      updatedAt: new Date().toISOString()
    };
  }

  // Schedule notification
  private scheduleNotification(notification: Notification): void {
    if (!notification.scheduledFor) return;

    const scheduledTime = new Date(notification.scheduledFor).getTime();
    const now = Date.now();
    const delay = scheduledTime - now;

    if (delay > 0) {
      setTimeout(() => {
        this.handleNewNotification(notification);
      }, delay);
    }
  }

  // Get single notification
  private async getNotification(notificationId: string): Promise<Notification | null> {
    if (!isConfigured || !db) {
      return null;
    }

    try {
      const snapshot = await getDocs(query(
        collection(db, NOTIFICATIONS_COL),
        where('__name__', '==', notificationId)
      ));
      
      if (snapshot.empty) return null;
      
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      } as Notification;
    } catch (error) {
      console.error('Failed to get notification:', error);
      return null;
    }
  }

  // Cleanup
  cleanup(): void {
    this.unsubscribeListeners.forEach(unsubscribe => unsubscribe());
    this.unsubscribeListeners.clear();
  }

  // Auto-notification for due items
  async createDueNotifications(dueItem: DueItem, customer: Customer): Promise<void> {
    const userId = this.currentUserId || 'current-user'; // Use current user from service instance
    const dueDate = new Date(dueItem.dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    console.log('🔔 Creating due notifications for:', customer.name, 'Due:', dueItem.amount, 'Days until due:', daysUntilDue);

    // Create notification for new due item
    try {
      await this.createNotification({
        userId,
        title: 'New Due Created',
        message: `New due of $${dueItem.amount} for ${customer.name} created (Due: ${dueDate.toLocaleDateString()})`,
        type: NotificationType.INFO,
        priority: NotificationPriority.LOW,
        channels: [NotificationChannel.IN_APP],
        data: { 
          dueId: dueItem.id, 
          customerId: customer.id,
          customerName: customer.name,
          amount: dueItem.amount,
          dueDate: dueItem.dueDate
        },
        tags: ['due', 'created', customer.id]
      });
      console.log('✅ New due notification created successfully');
    } catch (error) {
      console.error('❌ Failed to create new due notification:', error);
    }

    // Payment due reminder (3 days before)
    if (daysUntilDue === 3 && dueItem.status === PaymentStatus.PENDING) {
      await this.createNotification({
        userId,
        title: 'Payment Due Soon',
        message: `Payment of $${dueItem.amount} from ${customer.name} is due in 3 days`,
        type: NotificationType.PAYMENT_DUE,
        priority: NotificationPriority.MEDIUM,
        channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
        data: { dueId: dueItem.id, customerId: customer.id },
        actions: [
          {
            id: 'view-due',
            label: 'View Due',
            action: 'view-due',
            type: 'primary'
          }
        ],
        tags: ['payment', 'reminder', customer.id]
      });
    }

    // Overdue notification
    if (daysUntilDue < 0 && dueItem.status === PaymentStatus.OVERDUE) {
      await this.createNotification({
        userId,
        title: 'Payment Overdue',
        message: `Payment of $${dueItem.amount} from ${customer.name} is ${Math.abs(daysUntilDue)} days overdue`,
        type: NotificationType.DUE_OVERDUE,
        priority: NotificationPriority.HIGH,
        channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
        data: { dueId: dueItem.id, customerId: customer.id },
        actions: [
          {
            id: 'contact-customer',
            label: 'Contact Customer',
            action: 'contact-customer',
            type: 'primary'
          }
        ],
        tags: ['payment', 'overdue', customer.id]
      });
    }
  }

  // Auto-notification for payment received
  async createPaymentReceivedNotification(paymentAmount: number, dueItem: DueItem, customer: Customer): Promise<void> {
    const userId = this.currentUserId || 'current-user'; // Use current user from service instance

    await this.createNotification({
      userId,
      title: 'Payment Received',
      message: `Received payment of $${paymentAmount} from ${customer.name}`,
      type: NotificationType.PAYMENT_RECEIVED,
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
      data: { dueId: dueItem.id, customerId: customer.id, paymentAmount },
      actions: [
        {
          id: 'view-payment',
          label: 'View Payment',
          action: 'view-payment',
          type: 'primary'
        }
      ],
      tags: ['payment', 'received', customer.id]
    });
  }

  // Auto-notification for new customer
  async createCustomerCreatedNotification(customer: Customer): Promise<void> {
    const userId = this.currentUserId || 'current-user'; // Use current user from service instance

    await this.createNotification({
      userId,
      title: 'New Customer Added',
      message: `Customer ${customer.name} has been added successfully`,
      type: NotificationType.CUSTOMER_CREATED,
      priority: NotificationPriority.LOW,
      channels: [NotificationChannel.IN_APP],
      data: { customerId: customer.id },
      actions: [
        {
          id: 'view-customer',
          label: 'View Customer',
          action: 'view-customer',
          type: 'primary'
        }
      ],
      tags: ['customer', 'created']
    });
  }
}

export const notificationService = new NotificationService();