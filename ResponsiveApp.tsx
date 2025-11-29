import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

import { 
  Home, 
  Users, 
  DollarSign, 
  Settings, 
  Menu, 
  X, 
  Plus, 
  Search, 

  Smartphone,
  Tablet,
  Monitor,
  AlertTriangle
} from 'lucide-react';
import { cn } from './utils/cn';

// Import your existing components
import { Dashboard } from './components/Dashboard';
import { PaymentSectionWeb } from './components/PaymentSectionWeb';
import { CustomerSelectModal } from './components/CustomerSelectModal';
import { PaymentModal } from './components/PaymentModal';
import { SmartAddModal } from './components/SmartAddModal';
import { DueDetailModal } from './components/DueDetailModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ErrorState } from './src/components/ErrorState';

// Import types and services
import { DueItem, PaymentTransaction, Customer } from './types';
import { dueService } from './services/dueService';
import { paymentService } from './services/paymentService';
import { customerService } from './services/customerService';

// Mobile UI Components
import MobileNavigation from './MobileNavigation';
import MobileWrapper from './MobileWrapper';

// Error handling
import { errorHandler } from './src/utils/errorHandler';

interface ResponsiveAppProps {
  // Add any props your app needs
}

const ResponsiveApp: React.FC<ResponsiveAppProps> = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  
  // Data state
  const [dues, setDues] = useState<DueItem[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [showDeletePaymentConfirm, setShowDeletePaymentConfirm] = useState(false);

  // Device detection
  useEffect(() => {
    const detectDevice = () => {
      const platform = Capacitor.getPlatform();
      const isNative = Capacitor.isNativePlatform();
      
      if (isNative || window.innerWidth <= 768) {
        setIsMobile(true);
        setDeviceType('mobile');
      } else if (window.innerWidth <= 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  // Mobile initialization
  useEffect(() => {
    const initializeMobile = async () => {
      if (isMobile) {
        try {
          // Configure status bar
          await StatusBar.setOverlaysWebView({ overlay: false });
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });

          // Hide splash screen
          setTimeout(() => {
            SplashScreen.hide();
          }, 2000);
        } catch (error) {
          console.warn('Mobile initialization error:', error);
          errorHandler.showWarning('Some mobile features may not work properly', {
            title: 'Mobile Setup Incomplete',
            duration: 5000
          });
        }
      }
      
      setIsAppReady(true);
    };

    initializeMobile();
  }, [isMobile]);

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data in parallel
        const [duesData, paymentsData, customersData] = await Promise.all([
          dueService.getAllDues(),
          paymentService.getAllPayments(),
          customerService.getAllCustomers()
        ]);
        
        setDues(duesData);
        setPayments(paymentsData);
        setCustomers(customersData);
      } catch (error) {
        console.error('Error fetching data:', error);
        errorHandler.handleFirebaseError(error, 'Failed to load application data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Device type icon
  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };

  const DeviceIcon = getDeviceIcon();

  // Payment modal handlers
  const handleViewPaymentDetails = (payment: PaymentTransaction) => {
    console.log('🖱️ Opening payment details modal for:', payment.id);
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  const handleDeletePayment = (paymentId: string) => {
    console.log('🗑️ Initiating payment deletion for:', paymentId);
    setPaymentToDelete(paymentId);
    setShowDeletePaymentConfirm(true);
  };

  const confirmDeletePayment = async () => {
    if (!paymentToDelete) return;
    
    try {
      await paymentService.deletePayment(paymentToDelete);
      setPayments(prev => prev.filter(p => p.id !== paymentToDelete));
      console.log('✅ Payment deleted successfully:', paymentToDelete);
    } catch (error) {
      console.error('❌ Error deleting payment:', error);
      errorHandler.handleFirebaseError(error, 'Failed to delete payment');
    } finally {
      setPaymentToDelete(null);
      setShowDeletePaymentConfirm(false);
    }
  };

  // Loading state
  if (!isAppReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold">Loading DuetTrack AI...</h2>
          <div className="flex items-center justify-center mt-4 text-white/80">
            <DeviceIcon size={20} className="mr-2" />
            <span className="text-sm">Optimizing for {deviceType}</span>
          </div>
        </div>
      </div>
    );
  }

  // Render appropriate layout based on device
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading data...</p>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'dashboard':
        return <Dashboard dues={dues} payments={payments} />;
      case 'customers':
        return (
          <CustomerSelectModal 
            isOpen={true} 
            onClose={() => setActiveSection('dashboard')} 
            onSelect={(customer) => console.log('Selected customer:', customer)}
            customers={customers}
          />
        );
      case 'payments':
        return (
          <PaymentSectionWeb 
            payments={payments} 
            customers={customers} 
            dues={dues}
            onViewPaymentDetails={handleViewPaymentDetails}
            onDeletePayment={handleDeletePayment}
          />
        );
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-gray-900">Device Information</h3>
                <p className="text-gray-600 mt-2">Running on: {deviceType}</p>
                <p className="text-gray-600">Platform: {Capacitor.getPlatform()}</p>
                <p className="text-gray-600">Native: {Capacitor.isNativePlatform() ? 'Yes' : 'No'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-gray-900">Mobile Features</h3>
                <ul className="text-gray-600 mt-2 space-y-1">
                  <li>✅ Touch-friendly interface</li>
                  <li>✅ Responsive design</li>
                  <li>✅ Mobile navigation</li>
                  <li>✅ Safe area support</li>
                </ul>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard dues={dues} payments={payments} />;
    }
  };

  // Desktop/Tablet Layout
  if (!isMobile) {
    return (
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error('App Error Boundary caught:', error, errorInfo);
        }}
      >

        <div className="min-h-screen bg-gray-50">
          {/* Desktop Navigation */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-8">
                  <h1 className="text-xl font-bold text-gray-900">DuetTrack AI</h1>
                  <nav className="flex space-x-4">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={cn(
                            'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            activeSection === item.id
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                          )}
                        >
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
                <div className="flex items-center space-x-2">
                  <DeviceIcon size={20} className="text-gray-500" />
                  <span className="text-sm text-gray-600 capitalize">{deviceType}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderContent()}
          </main>
        </div>
      </ErrorBoundary>
    );
  }

  // Mobile Layout
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Mobile App Error Boundary caught:', error, errorInfo);
      }}
    >

      <MobileWrapper>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 touch-target"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <h1 className="text-lg font-bold text-gray-900">DuetTrack AI</h1>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 touch-target">
                <Search size={24} />
              </button>

            </div>
          </div>
          
          {/* Safe area for top */}
          <div className="h-[env(safe-area-inset-top)] bg-white" />
        </div>

        {/* Side Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setIsMenuOpen(false)}>
            <div className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <nav className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setIsMenuOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                          'touch-target',
                          isActive 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        )}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="pt-16 pb-20">
          {renderContent()}
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
          <div className="flex items-center justify-around py-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200',
                    'min-w-[60px] touch-target',
                    isActive 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  <Icon size={24} className="mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
          
          {/* Safe area for bottom */}
          <div className="h-[env(safe-area-inset-bottom)] bg-white" />
        </div>

        {/* Floating Action Button */}
        <button className="fixed bottom-24 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg z-20 transition-all duration-200 hover:scale-110 touch-target">
          <Plus size={24} />
        </button>
      </div>
      </MobileWrapper>
      
      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
                <button 
                  onClick={() => setShowPaymentDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Amount</label>
                  <div className="text-2xl font-bold text-green-600">
                    ${selectedPayment.amount.toFixed(2)}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Method</label>
                  <div className="text-lg font-semibold text-gray-900">
                    {selectedPayment.paymentMethod}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Date</label>
                  <div className="text-gray-900">
                    {new Date(selectedPayment.paymentDate).toLocaleDateString()}
                  </div>
                </div>
                
                {selectedPayment.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Notes</label>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {selectedPayment.notes}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPaymentDetails(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Payment Confirmation Modal */}
      {showDeletePaymentConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Payment
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this payment? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeletePaymentConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePayment}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
};

export default ResponsiveApp;