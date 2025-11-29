# DuetTrack AI - Dynamic Notification System

A comprehensive, fully dynamic notification system with modern UI/UX, real-time Firebase synchronization, and push notification support for the DuetTrack AI project.

## 🚀 Features

### Core Features
- **Real-time Notifications**: Instant notifications with Firebase real-time sync
- **Multiple Notification Types**: Info, Success, Warning, Error, Reminder, Payment Due, Payment Received, Customer Created, Due Overdue, System
- **Modern UI/UX**: Beautiful, animated notifications with responsive design
- **Push Notifications**: Native push notifications with service worker support
- **Notification Preferences**: Granular control over notification types and channels
- **Notification History**: Complete history with filtering and search
- **Mobile Optimized**: Fully responsive with mobile-first design

### Advanced Features
- **Smart Scheduling**: Schedule notifications for future delivery
- **Priority Levels**: Urgent, High, Medium, Low priority notifications
- **Multi-channel Support**: In-app, Push, Email, SMS channels
- **Notification Actions**: Interactive buttons within notifications
- **Auto-notifications**: Automatic notifications for due dates, payments, etc.
- **Offline Support**: Service worker caching for offline notifications
- **Export Functionality**: Export notification history as JSON

## 📦 Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase
Ensure your Firebase configuration is set up in `services/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

### 3. Register Service Worker
The service worker is automatically registered when you use the EnhancedApp component.

## 🔧 Integration

### Quick Start
Replace your main App.tsx with the enhanced version:

```typescript
import EnhancedApp from './src/EnhancedApp';

// In your main index.tsx or App.tsx
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<EnhancedApp />);
}
```

### Manual Integration
If you want to integrate manually into your existing app:

#### 1. Add CSS
Import the notification styles in your main CSS file:
```css
@import './src/styles/notifications.css';
```

#### 2. Add Toast Container
Add the toast notification container to your app:
```tsx
import ToastNotificationContainer from './src/components/ToastNotification';

function App() {
  return (
    <div>
      {/* Your existing app content */}
      <ToastNotificationContainer position="top-right" maxNotifications={5} />
    </div>
  );
}
```

#### 3. Add Notification Bell
Add the notification bell to your header or navigation:
```tsx
import NotificationBell from './src/components/NotificationBell';

function Header() {
  const userId = 'your-user-id'; // Get from your auth system
  
  return (
    <header>
      {/* Your existing header content */}
      <NotificationBell userId={userId} />
    </header>
  );
}
```

#### 4. Initialize Service Worker
Initialize the service worker in your app:
```tsx
import { serviceWorkerManager } from './src/hooks/useServiceWorker';

useEffect(() => {
  serviceWorkerManager.register();
  
  return () => {
    // Cleanup if needed
  };
}, []);
```

## 🎯 Usage Examples

### Creating Notifications
```tsx
import { notificationService } from './src/services/notificationService';
import { NotificationType, NotificationPriority, NotificationChannel } from './src/types';

// Create a simple notification
await notificationService.createNotification({
  userId: 'user-123',
  title: 'Payment Due',
  message: 'Payment of $500 is due tomorrow',
  type: NotificationType.PAYMENT_DUE,
  priority: NotificationPriority.MEDIUM,
  channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH]
});

// Create a notification with actions
await notificationService.createNotification({
  userId: 'user-123',
  title: 'New Customer Added',
  message: 'John Doe has been added successfully',
  type: NotificationType.CUSTOMER_CREATED,
  priority: NotificationPriority.LOW,
  channels: [NotificationChannel.IN_APP],
  actions: [
    {
      id: 'view-customer',
      label: 'View Customer',
      action: 'view-customer',
      type: 'primary'
    }
  ]
});
```

### Using Hooks
```tsx
import { useNotifications } from './src/hooks/useNotifications';

function MyComponent() {
  const { 
    notifications, 
    stats, 
    loading, 
    createNotification,
    markAsRead,
    refresh 
  } = useNotifications({ 
    userId: 'user-123',
    autoRefresh: true 
  });

  // Use notifications in your component
  return (
    <div>
      <p>Unread notifications: {stats.unread}</p>
      {notifications.map(notification => (
        <div key={notification.id}>
          {notification.title}
        </div>
      ))}
    </div>
  );
}
```

### Auto-notifications for Due Items
```tsx
import { notificationSystem } from './src/EnhancedApp';

// When creating a new due item
const newDue = {
  id: 'due-123',
  customerId: 'customer-456',
  amount: 500,
  dueDate: '2024-01-15',
  // ... other properties
};

const customer = {
  id: 'customer-456',
  name: 'John Doe',
  // ... other properties
};

// This will automatically create notifications
await notificationService.createDueNotifications(newDue, customer);
```

## 📱 Push Notifications

### Request Permission
```tsx
import { useServiceWorker } from './src/hooks/useServiceWorker';

function NotificationSettings() {
  const { requestPermission, permission } = useServiceWorker();
  
  const handleEnableNotifications = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      console.log('Notification permission granted');
    }
  };
  
  return (
    <button onClick={handleEnableNotifications}>
      Enable Push Notifications
    </button>
  );
}
```

### Subscribe to Push
```tsx
const { subscribeToPush } = useServiceWorker();

const handleSubscribe = async () => {
  const publicVapidKey = 'your-public-vapid-key';
  const subscription = await subscribeToPush(publicVapidKey);
  
  // Send subscription to your server
  await fetch('/api/save-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription)
  });
};
```

## 🎨 Customization

### Notification Types
Add custom notification types in `types.ts`:
```typescript
export enum NotificationType {
  // ... existing types
  CUSTOM_TYPE = 'custom_type'
}
```

### Styling
Customize notification appearance in `src/styles/notifications.css`:
```css
.notification-toast {
  /* Your custom styles */
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
```

### Animation Timing
Adjust animation durations in the CSS:
```css
.animate-slide-in-right {
  animation: slide-in-right 0.5s ease-out; /* Slower animation */
}
```

## 🔧 Configuration

### Notification Preferences
Users can customize their notification preferences:
- Enable/disable notification channels (In-app, Push, Email, SMS)
- Set priority levels for different notification types
- Configure quiet hours
- Enable daily digest

### Service Worker Configuration
Configure the service worker in `public/sw.js`:
- Cache strategies
- Push notification handling
- Background sync
- Offline support

## 📊 Firebase Collections

The system uses the following Firebase collections:

### notifications
```typescript
{
  id: string,
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  priority: NotificationPriority,
  channels: NotificationChannel[],
  read: boolean,
  archived: boolean,
  createdAt: string,
  updatedAt: string,
  // ... other fields
}
```

### notification_preferences
```typescript
{
  userId: string,
  channels: {
    inApp: boolean,
    push: boolean,
    email: boolean,
    sms: boolean
  },
  types: {
    [NotificationType]: {
      enabled: boolean,
      channels: NotificationChannel[],
      priority: NotificationPriority
    }
  },
  quietHours: {
    enabled: boolean,
    start: string,
    end: string
  },
  dailyDigest: {
    enabled: boolean,
    time: string
  }
}
```

## 🧪 Testing

### Demo Application
Run the demo application to test all features:
```bash
npm run dev
```

Then navigate to the demo page to see all notification features in action.

### Manual Testing
Test different notification scenarios:
- Create notifications of different types
- Test push notifications (requires HTTPS)
- Test offline notifications
- Test notification preferences
- Test notification history and filtering

## 🔒 Security

### Firebase Security Rules
Configure your Firebase security rules for notifications:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Notifications
    match /notifications/{notificationId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Notification preferences
    match /notification_preferences/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Service Worker not registering**
   - Check if HTTPS is enabled (required for push notifications)
   - Clear browser cache and reload
   - Check browser console for errors

2. **Push notifications not working**
   - Ensure notification permission is granted
   - Check if public VAPID key is correct
   - Verify service worker is active

3. **Firebase connection issues**
   - Check Firebase configuration
   - Verify network connectivity
   - Check Firebase security rules

4. **Notifications not appearing**
   - Check if notification service is initialized
   - Verify user ID is set correctly
   - Check browser console for errors

### Debug Mode
Enable debug mode to see detailed logs:
```typescript
// In your notification service
notificationService.setDebugMode(true);
```

## 📈 Performance

### Optimization Tips
- Use pagination for large notification lists
- Implement notification cleanup (auto-archive old notifications)
- Use Firebase indexes for better query performance
- Cache frequently accessed data
- Use background sync for offline support

### Monitoring
Monitor notification system performance:
- Track notification delivery rates
- Monitor service worker health
- Track user engagement with notifications
- Monitor Firebase usage and costs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the DuetTrack AI system. Please refer to the main project license.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review the demo application
- Check browser console for errors
- Verify Firebase configuration

---

**Happy notifying! 🔔**