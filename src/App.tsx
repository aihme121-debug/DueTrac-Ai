import React, { useEffect, useState } from 'react';
import NotificationBell from '@/src/components/NotificationBell';
import ToastNotificationContainer from '@/src/components/ToastNotification';
import { serviceWorkerManager } from '@/src/hooks/useServiceWorker';
import { notificationService } from '@/services/notificationService';
import '@/src/styles/notifications.css';

function App() {
  const [isNotificationSystemReady, setIsNotificationSystemReady] = useState(false);
  const userId = 'current-user'; // This should come from your auth system

  useEffect(() => {
    const initializeNotificationSystem = async () => {
      try {
        // Register service worker for push notifications
        await serviceWorkerManager.register();
        
        // Set current user in notification service
        notificationService.setCurrentUser(userId);
        
        setIsNotificationSystemReady(true);
        console.log('✅ Notification system initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize notification system:', error);
      }
    };

    initializeNotificationSystem();

    return () => {
      notificationService.cleanup();
    };
  }, [userId]);

  return (
    <div className="App">
      {/* Toast Notifications Container */}
      <ToastNotificationContainer 
        position="top-right" 
        maxNotifications={5} 
        autoDismissDelay={5000} 
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">DueTrack AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-8">
                <a href="#docs" className="text-gray-600 hover:text-gray-900">Docs</a>
                <a href="#demo" className="text-gray-600 hover:text-gray-900">Demo</a>
              </nav>
              
              {/* Notification Bell */}
              {isNotificationSystemReady && (
                <NotificationBell userId={userId} />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <section id="docs" className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Documentation</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">Intelligent Positioning</h4>
                          <p className="text-sm text-gray-600">Automatically determines optimal placement based on viewport space</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">Mobile Boundaries</h4>
                          <p className="text-sm text-gray-600">Ensures dropdown stays within mobile viewport limits</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">Flip Positioning</h4>
                          <p className="text-sm text-gray-600">Intelligently flips above when space below is limited</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">Glass Morphism</h4>
                          <p className="text-sm text-gray-600">Modern frosted glass effect with backdrop blur</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">Real-time Updates</h4>
                          <p className="text-sm text-gray-600">Repositions on window resize and scroll events</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">Arrow Positioning</h4>
                          <p className="text-sm text-gray-600">Dynamic arrow that points to the icon</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Test Notification System</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Create Test Data</h4>
                    <div className="space-y-3">
                      <button 
                        onClick={async () => {
                          try {
                            const testCustomer = {
                              id: `test-customer-${Date.now()}`,
                              name: 'Test Customer',
                              email: 'test@example.com',
                              phone: '123-456-7890',
                              address: '123 Test St',
                              totalDue: 500,
                              status: 'active'
                            };
                            
                            const { StorageService } = await import('@/services/storageService');
                            await StorageService.saveCustomer(testCustomer);
                            
                            const testDue = {
                              id: `test-due-${Date.now()}`,
                              customerId: testCustomer.id,
                              amount: 500,
                              paidAmount: 0,
                              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
                              status: 'pending',
                              description: 'Test due for notification system',
                              paymentHistory: [],
                              createdAt: new Date().toISOString()
                            };
                            
                            await StorageService.saveDue(testDue);
                            console.log('✅ Test due created successfully - notification should be triggered');
                            alert('Test due created! Check the notification bell for a new notification.');
                          } catch (error) {
                            console.error('❌ Failed to create test data:', error);
                            alert('Failed to create test data. Check console for details.');
                          }
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Create Test Due
                      </button>
                      
                      <button 
                        onClick={async () => {
                          try {
                            const { StorageService } = await import('@/services/storageService');
                            const dues = await StorageService.getDues();
                            const testDue = dues.find(d => d.status !== 'paid');
                            
                            if (!testDue) {
                              alert('No unpaid due found. Create a test due first.');
                              return;
                            }
                            
                            const paymentData = {
                              dueId: testDue.id,
                              amount: Math.min(200, testDue.amount - testDue.paidAmount),
                              paymentDate: new Date().toISOString(),
                              paymentMethod: 'cash',
                              notes: 'Test payment for notification system'
                            };
                            
                            await StorageService.addPayment(paymentData);
                            console.log('✅ Test payment created successfully - notification should be triggered');
                            alert('Test payment created! Check the notification bell for a new notification.');
                          } catch (error) {
                            console.error('❌ Failed to create test payment:', error);
                            alert('Failed to create test payment. Check console for details.');
                          }
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-2"
                      >
                        Create Test Payment
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      Click these buttons to test the notification system. Each action should create a corresponding notification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
                Professional System - Built with React, TypeScript, and Tailwind CSS
              </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;