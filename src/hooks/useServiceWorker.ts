import { useState, useEffect } from 'react';

export interface ServiceWorkerManagerState {
  registration: ServiceWorkerRegistration | null;
  error: Error | null;
  isSupported: boolean;
  isRegistered: boolean;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private error: Error | null = null;
  private isSupported = false;
  private isRegistered = false;

  constructor() {
    this.isSupported = 'serviceWorker' in navigator;
  }

  async register(): Promise<ServiceWorkerManagerState> {
    if (!this.isSupported) {
      console.warn('Service Worker not supported');
      return {
        registration: null,
        error: new Error('Service Worker not supported'),
        isSupported: false,
        isRegistered: false
      };
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      this.registration = registration;
      this.isRegistered = true;
      
      console.log('Service Worker registered successfully');
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              this.showUpdateNotification();
            }
          });
        }
      });

      return {
        registration,
        error: null,
        isSupported: true,
        isRegistered: true
      };
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      this.error = error as Error;
      return {
        registration: null,
        error: error as Error,
        isSupported: true,
        isRegistered: false
      };
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      this.isRegistered = !result;
      return result;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission;
    } catch (error) {
      console.error('Notification permission request failed:', error);
      return 'denied';
    }
  }

  async subscribeToPushNotifications(publicVapidKey: string): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('Service Worker not registered');
      return null;
    }

    if (Notification.permission !== 'granted') {
      console.error('Notification permission not granted');
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicVapidKey)
      });

      console.log('Push subscription created');
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  async unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Push subscription cancelled');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      return false;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private showUpdateNotification() {
    // Dispatch custom event for app to handle update notification
    const event = new CustomEvent('swUpdateAvailable');
    window.dispatchEvent(event);
  }

  async getPushSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      return null;
    }

    try {
      return await this.registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Failed to get push subscription:', error);
      return null;
    }
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  getError(): Error | null {
    return this.error;
  }

  isServiceWorkerSupported(): boolean {
    return this.isSupported;
  }

  isServiceWorkerRegistered(): boolean {
    return this.isRegistered;
  }

  // Send message to service worker
  async sendMessage(message: any): Promise<void> {
    if (!this.registration?.active) {
      console.error('Service Worker not active');
      return;
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(event.data.error);
        } else {
          resolve(event.data);
        }
      };

      this.registration!.active!.postMessage(message, [messageChannel.port2]);
    });
  }

  // Cache notification for offline access
  async cacheNotification(notificationData: any): Promise<void> {
    try {
      await this.sendMessage({
        type: 'CACHE_NOTIFICATION',
        data: notificationData
      });
    } catch (error) {
      console.error('Failed to cache notification:', error);
    }
  }

  // Clear all cached notifications
  async clearCachedNotifications(): Promise<void> {
    try {
      await this.sendMessage({
        type: 'CLEAR_NOTIFICATIONS'
      });
    } catch (error) {
      console.error('Failed to clear cached notifications:', error);
    }
  }
}

export const serviceWorkerManager = new ServiceWorkerManager();

// Hook for React components
export const useServiceWorker = () => {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [needsUpdate, setNeedsUpdate] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setNeedsUpdate(true);
    };

    window.addEventListener('swUpdateAvailable', handleUpdateAvailable);

    return () => {
      window.removeEventListener('swUpdateAvailable', handleUpdateAvailable);
    };
  }, []);

  const registerServiceWorker = async () => {
    const result = await serviceWorkerManager.register();
    setRegistration(result.registration);
    setError(result.error);
    setIsSupported(result.isSupported);
    setIsRegistered(result.isRegistered);
    return result;
  };

  const unregisterServiceWorker = async () => {
    const result = await serviceWorkerManager.unregister();
    setIsRegistered(!result);
    return result;
  };

  const requestNotificationPermission = async () => {
    return await serviceWorkerManager.requestNotificationPermission();
  };

  const subscribeToPush = async (publicVapidKey: string) => {
    return await serviceWorkerManager.subscribeToPushNotifications(publicVapidKey);
  };

  const unsubscribeFromPush = async () => {
    return await serviceWorkerManager.unsubscribeFromPushNotifications();
  };

  const getPushSubscription = async () => {
    return await serviceWorkerManager.getPushSubscription();
  };

  const updateServiceWorker = async () => {
    if (registration) {
      try {
        await registration.update();
        setNeedsUpdate(false);
      } catch (error) {
        console.error('Failed to update Service Worker:', error);
      }
    }
  };

  return {
    registration,
    error,
    isSupported,
    isRegistered,
    needsUpdate,
    registerServiceWorker,
    unregisterServiceWorker,
    requestNotificationPermission,
    subscribeToPush,
    unsubscribeFromPush,
    getPushSubscription,
    updateServiceWorker
  };
};

export default serviceWorkerManager;