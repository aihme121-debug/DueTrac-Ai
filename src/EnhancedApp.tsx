import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import NotificationBell from './components/NotificationBell';
import ToastNotificationContainer from './components/ToastNotification';
import { notificationService } from './services/notificationService';
import { serviceWorkerManager } from './hooks/useServiceWorker';
import './styles/notifications.css';

// Get the current user ID (this should come from your auth system)
const getCurrentUserId = () => {
  // In a real app, this would come from your authentication system
  return localStorage.getItem('userId') || 'demo-user-123';
};

// Initialize notification system
const initializeNotificationSystem = async () => {
  try {
    // Register service worker for push notifications
    await serviceWorkerManager.register();
    
    // Set current user in notification service
    const userId = getCurrentUserId();
    notificationService.setCurrentUser(userId);
    
    console.log('✅ Notification system initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize notification system:', error);
  }
};

// Enhanced App component with notification system
const EnhancedApp: React.FC = () => {
  const userId = getCurrentUserId();

  useEffect(() => {
    initializeNotificationSystem();
    
    return () => {
      notificationService.cleanup();
    };
  }, []);

  return (
    <div className="relative">
      {/* Original App */}
      <App />
      
      {/* Notification System Components */}
      <ToastNotificationContainer 
        position="top-right" 
        maxNotifications={5} 
        autoDismissDelay={5000} 
      />
      
      {/* Notification Bell - Positioned in top right corner */}
      <div className="fixed top-4 right-4 z-50">
        <NotificationBell userId={userId} />
      </div>
    </div>
  );
};

// Auto-notification triggers based on DueTrack AI events
const setupAutoNotifications = () => {
  // Listen for due items that are approaching due date
  const checkUpcomingDues = () => {
    // This would integrate with your existing due tracking logic
    // For now, it's a placeholder that can be called from your components
    console.log('Checking for upcoming due notifications...');
  };

  // Listen for new customers
  const handleNewCustomer = (customer: any) => {
    notificationService.createCustomerCreatedNotification(customer);
  };

  // Listen for payments
  const handleNewPayment = (paymentAmount: number, dueItem: any, customer: any) => {
    notificationService.createPaymentReceivedNotification(paymentAmount, dueItem, customer);
  };

  // Set up periodic checks (every hour)
  setInterval(checkUpcomingDues, 60 * 60 * 1000);

  // Return functions that can be used by your components
  return {
    checkUpcomingDues,
    handleNewCustomer,
    handleNewPayment
  };
};

// Export for use in other components
export const notificationSystem = setupAutoNotifications();

// Mount the enhanced app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<EnhancedApp />);
}

// Handle app installation prompt
let deferredPrompt: any = null;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
  // Optionally, show a custom install button or notification
  console.log('App installation available');
});

// Export functions for manual triggering
export const triggerInstallPrompt = async () => {
  if (deferredPrompt) {
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    
    // Reset the deferred prompt variable
    deferredPrompt = null;
    
    return outcome;
  }
  
  return null;
};

export default EnhancedApp;