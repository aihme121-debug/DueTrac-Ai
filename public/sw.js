// Push Notification Service Worker
const CACHE_NAME = 'duetrack-ai-v1';
const NOTIFICATION_CACHE = 'notifications-cache';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/offline.html',
        '/icon-192x192.png',
        '/icon-512x512.png',
        '/badge-72x72.png'
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== NOTIFICATION_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html');
      })
    );
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');
  
  const options = {
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/check-icon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/x-icon.png'
      }
    ]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.body || options.body;
      options.title = data.title || 'DuetTrack AI';
      options.icon = data.icon || options.icon;
      options.badge = data.badge || options.badge;
      options.data = { ...options.data, ...data.data };
      options.actions = data.actions || options.actions;
      options.tag = data.tag || 'duetrack-notification';
      options.requireInteraction = data.requireInteraction || false;
      options.silent = data.silent || false;
    } catch (error) {
      console.error('[Service Worker] Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(options.title || 'DuetTrack AI', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received');
  
  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'close') {
    return;
  }

  event.waitUntil(
    clients.openWindow('/').then((windowClient) => {
      // Handle notification data and navigation
      if (data && data.url) {
        return clients.openWindow(data.url);
      }
      return windowClient;
    })
  );
});

// Background sync for notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

// Sync notifications when back online
async function syncNotifications() {
  try {
    const cache = await caches.open(NOTIFICATION_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
        }
      } catch (error) {
        console.error('[Service Worker] Failed to sync notification:', error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Error syncing notifications:', error);
  }
}

// Periodic background sync for notification cleanup
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cleanup-notifications') {
    event.waitUntil(cleanupNotifications());
  }
});

// Cleanup old notifications
async function cleanupNotifications() {
  try {
    const cache = await caches.open(NOTIFICATION_CACHE);
    const requests = await cache.keys();
    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const data = await response.json();
        if (data.timestamp && data.timestamp < oneWeekAgo) {
          await cache.delete(request);
        }
      }
    }
  } catch (error) {
    console.error('[Service Worker] Error cleaning up notifications:', error);
  }
}

// Message event for communication with the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_NOTIFICATIONS') {
    event.ports[0].postMessage({
      type: 'NOTIFICATIONS',
      notifications: [] // This would be populated from IndexedDB or cache
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_NOTIFICATIONS') {
    // Clear all notifications
    self.registration.getNotifications().then(notifications => {
      notifications.forEach(notification => notification.close());
    });
  }
});

// Handle app installation
self.addEventListener('beforeinstallprompt', (event) => {
  // Prevent the mini-infobar from appearing on mobile
  event.preventDefault();
  
  // Stash the event so it can be triggered later
  self.deferredPrompt = event;
  
  // Notify the app that the prompt is available
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'BEFORE_INSTALL_PROMPT_AVAILABLE',
        prompt: event
      });
    });
  });
});

// Cache notification for offline access
async function cacheNotification(notificationData) {
  try {
    const cache = await caches.open(NOTIFICATION_CACHE);
    const url = `/notification-${Date.now()}`;
    const response = new Response(JSON.stringify({
      ...notificationData,
      timestamp: Date.now()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put(url, response);
  } catch (error) {
    console.error('[Service Worker] Error caching notification:', error);
  }
}