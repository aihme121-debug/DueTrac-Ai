import React, { useEffect, useState } from 'react';
import { Bell, Settings, Zap, RefreshCw, Send } from 'lucide-react';
import NotificationBell from '../src/components/NotificationBell';
import ToastNotificationContainer from '../src/components/ToastNotification';
import NotificationDashboard from '../src/components/NotificationDashboard';
import NotificationPreferences from '../src/components/NotificationPreferences';
import { useNotifications, useNotificationPreferences } from '../src/hooks/useNotifications';
import { useServiceWorker } from '../src/hooks/useServiceWorker';
import { notificationService } from '../src/services/notificationService';
import { NotificationType, NotificationPriority, NotificationChannel } from '../src/types';
import { serviceWorkerManager } from '../src/hooks/useServiceWorker';

interface NotificationSystemDemoProps {
  userId?: string;
}

const NotificationSystemDemo: React.FC<NotificationSystemDemoProps> = ({ 
  userId = 'demo-user-123' 
}) => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize service worker and notifications
  const {
    registration,
    isSupported,
    isRegistered,
    requestPermission,
    subscribeToPush,
    permission
  } = useServiceWorker();

  const {
    notifications,
    stats,
    createNotification
  } = useNotifications({ 
    userId,
    autoRefresh: true 
  });

  const { preferences } = useNotificationPreferences(userId);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Register service worker
        if (isSupported && !isRegistered) {
          await serviceWorkerManager.register();
        }

        // Request notification permission
        if (permission === 'default') {
          await requestPermission();
        }

        // Set current user in notification service
        notificationService.setCurrentUser(userId);
        
        setIsInitialized(true);
        console.log('✅ Notification system initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize notification system:', error);
      }
    };

    initializeNotifications();

    return () => {
      notificationService.cleanup();
    };
  }, [userId, isSupported, isRegistered, permission, requestPermission]);

  // Demo functions
  const sendTestNotification = async (type: NotificationType) => {
    try {
      const messages = {
        [NotificationType.INFO]: 'This is an informational notification',
        [NotificationType.SUCCESS]: 'Operation completed successfully!',
        [NotificationType.WARNING]: 'Please review this warning message',
        [NotificationType.ERROR]: 'An error occurred while processing your request',
        [NotificationType.REMINDER]: 'Don\'t forget to check your pending dues',
        [NotificationType.PAYMENT_DUE]: 'Payment of $500 is due tomorrow',
        [NotificationType.PAYMENT_RECEIVED]: 'Payment of $250 has been received',
        [NotificationType.CUSTOMER_CREATED]: 'New customer John Doe has been added',
        [NotificationType.DUE_OVERDUE]: 'Payment of $300 is 3 days overdue',
        [NotificationType.SYSTEM]: 'System maintenance scheduled for tonight'
      };

      await createNotification({
        title: `${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} Notification`,
        message: messages[type],
        type,
        priority: type === NotificationType.ERROR ? NotificationPriority.HIGH :
                  type === NotificationType.WARNING ? NotificationPriority.MEDIUM :
                  NotificationPriority.LOW,
        channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
        tags: ['demo', 'test', type]
      });

      console.log(`✅ Test ${type} notification sent`);
    } catch (error) {
      console.error(`❌ Failed to send test notification:`, error);
    }
  };

  const simulateDueNotification = async () => {
    try {
      // Simulate a due item notification
      const dueItem = {
        id: 'demo-due-123',
        customerId: 'demo-customer-456',
        amount: 500,
        paidAmount: 0,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        title: 'Demo Due Payment',
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };

      const customer = {
        id: 'demo-customer-456',
        name: 'Demo Customer',
        phone: '+1234567890',
        email: 'demo@example.com'
      };

      await notificationService.createDueNotifications(dueItem as any, customer as any);
      console.log('✅ Due notification simulation completed');
    } catch (error) {
      console.error('❌ Failed to simulate due notification:', error);
    }
  };

  const simulatePaymentNotification = async () => {
    try {
      const dueItem = {
        id: 'demo-due-123',
        customerId: 'demo-customer-456',
        amount: 500,
        paidAmount: 250,
        dueDate: new Date().toISOString(),
        title: 'Demo Due Payment',
        status: 'PARTIAL',
        createdAt: new Date().toISOString()
      };

      const customer = {
        id: 'demo-customer-456',
        name: 'Demo Customer',
        phone: '+1234567890',
        email: 'demo@example.com'
      };

      await notificationService.createPaymentReceivedNotification(250, dueItem as any, customer as any);
      console.log('✅ Payment notification simulation completed');
    } catch (error) {
      console.error('❌ Failed to simulate payment notification:', error);
    }
  };

  if (!isInitialized) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Initializing Notification System...
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Setting up real-time notifications, push notifications, and service worker...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Toast Notifications Container */}
      <ToastNotificationContainer 
        position="top-right" 
        maxNotifications={5} 
        autoDismissDelay={5000} 
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Zap className="w-8 h-8 text-blue-500" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                DuetTrack AI - Notification System
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationBell userId={userId} />
              
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Notification Preferences"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowDashboard(!showDashboard)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <Bell className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            System Status
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Service Worker
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {isRegistered ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Real-time Sync
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Connected to Firebase
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  Push Notifications
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  {permission === 'granted' ? 'Enabled' : permission === 'denied' ? 'Blocked' : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Demo Controls
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {Object.values(NotificationType).map((type) => (
              <button
                key={type}
                onClick={() => sendTestNotification(type)}
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <div className="flex items-center space-x-3 mb-2">
                  {React.createElement(
                    {
                      [NotificationType.INFO]: Info,
                      [NotificationType.SUCCESS]: CheckCircle,
                      [NotificationType.WARNING]: AlertTriangle,
                      [NotificationType.ERROR]: AlertTriangle,
                      [NotificationType.REMINDER]: Clock,
                      [NotificationType.PAYMENT_DUE]: DollarSign,
                      [NotificationType.PAYMENT_RECEIVED]: CheckCircle,
                      [NotificationType.CUSTOMER_CREATED]: User,
                      [NotificationType.DUE_OVERDUE]: DollarSign,
                      [NotificationType.SYSTEM]: Settings
                    }[type] || Bell,
                    { className: "w-5 h-5" }
                  )}
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Send a test {type.toLowerCase()} notification
                </p>
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={simulateDueNotification}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
            >
              <Bell className="w-4 h-4" />
              <span>Simulate Due Notification</span>
            </button>
            
            <button
              onClick={simulatePaymentNotification}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
            >
              <Bell className="w-4 h-4" />
              <span>Simulate Payment Notification</span>
            </button>
            
            <button
              onClick={refresh}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.unread}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Read</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.read}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Archived</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.archived}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recent Notifications
          </h3>
          
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No notifications yet</p>
              <p className="text-sm mt-1">Use the demo controls above to create some notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.read
                      ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        notification.priority === 'urgent' ? 'bg-red-500' :
                        notification.priority === 'high' ? 'bg-orange-500' :
                        notification.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}></div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Notification Dashboard Modal */}
      {showDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Notification Dashboard
              </h2>
              <button
                onClick={() => setShowDashboard(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <NotificationDashboard userId={userId} />
            </div>
          </div>
        </div>
      )}

      {/* Notification Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Notification Preferences
              </h2>
              <button
                onClick={() => setShowPreferences(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <NotificationPreferences userId={userId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystemDemo;