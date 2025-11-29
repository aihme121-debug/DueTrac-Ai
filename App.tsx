import React, { useState, useEffect, useRef, useMemo } from 'react';
import NotificationBell from '@/src/components/NotificationBell';
import { Dashboard } from '@/components/Dashboard';
import { DueListRedesign } from '@/components/DueListRedesign';
import { SmartAddModal } from '@/components/SmartAddModal';
import { DueDetailModal } from '@/components/DueDetailModal';
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';
 
import { AuthModal } from '@/components/AuthModal';
import { UserProfileModal } from '@/components/UserProfileModal';
import { FirebaseTestDashboard } from '@/components/FirebaseTestDashboard';

import { PaymentModal } from '@/components/PaymentModal';
import { PaymentSection } from '@/components/PaymentSection';
import { StorageService } from '@/services/storageService';
import { isConfigured, testFirestoreConnection, db } from '@/services/firebase';
import { DueWithCustomer, PaymentStatus, DueItem, Customer, PromiseRecord, PaymentTransaction } from '@/types';
import { GeminiService } from '@/services/geminiService';
import { ModernButton, ModernCard, ModernBadge, ModernSpinner } from '@/utils/uiComponents';
import { animationPresets } from '@/utils/animations';
 
import { authService, AuthUser } from '@/services/authService';
 
import { 
  LayoutGrid, 
  List, 
  Plus, 
 
  MessageSquare, 
  Loader2, 
  Database, 
  WifiOff, 
  DollarSign,
  Menu,
  X,
  Settings,
  User,
  TrendingUp,
  CreditCard,
  Calendar,
  Users,
  FileText,
  Activity,
  LogOut,
  Volume2,
  VolumeX
} from 'lucide-react';

const App = () => {
  const [dues, setDues] = useState<DueWithCustomer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'LIST' | 'PAYMENTS' | 'FIREBASE_TEST'>('DASHBOARD');
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [arrowPosition, setArrowPosition] = useState({ left: 0 });
  
  // Authentication state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  
  const showError = (title: string, message?: string) => console.error(title, message);
  const showSuccess = (title: string, message?: string) => console.log(title, message);
  
  // Refs for navigation
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const navbarRef = useRef<HTMLDivElement>(null);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDue, setEditingDue] = useState<DueWithCustomer | null>(null);
  
  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedDueForPayment, setSelectedDueForPayment] = useState<DueWithCustomer | null>(null);
  
  // Detail Modal State
  const [viewingDue, setViewingDue] = useState<DueWithCustomer | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string} | null>(null);

  // Reminder State
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderText, setReminderText] = useState('');
  const [reminderLoading, setReminderLoading] = useState(false);

  useEffect(() => {
    loadData();
    
    
    
    // Close mobile menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Authentication effect
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setCurrentUser(user);
      if (user) {
        // User is signed in, load data
        loadData();
        
        // Initialize notification service with current user
        notificationService.setCurrentUser(user.id || 'current-user');
        
      } else {
        // User is signed out, clear data
        setDues([]);
        setCustomers([]);
        setPayments([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    console.log("📊 Starting to load data...");
    setIsLoading(true);
    try {
      console.log("📞 Loading all data...");
      
      // Load all data in parallel
      const [duesData, customersData, paymentsData] = await Promise.all([
        StorageService.getDuesWithCustomers(),
        StorageService.getCustomers(),
        StorageService.getPayments()
      ]);
      
      console.log("📈 Data loaded successfully:");
      console.log("- Dues:", duesData.length, "items");
      console.log("- Customers:", customersData.length, "items");
      console.log("- Payments:", paymentsData.length, "items");
      
      setDues(duesData);
      setCustomers(customersData);
      setPayments(paymentsData);
      
      console.log("✅ All data updated");
    } catch (error: any) {
      console.error("❌ Failed to load data:", error);
      console.error("Error details:", error.message);
      showError("Data Load Failed", "Failed to load data. Please refresh the page.");
    } finally {
      setIsLoading(false);
      console.log("📊 Data loading completed");
    }
  };

  const handleSaveDue = async (formData: any) => {
    console.log("📋 Form data received:", formData);
    if (!formData.customerName || !formData.amount || !formData.title) {
      console.log("❌ Missing required fields:", { 
        customerName: formData.customerName, 
        amount: formData.amount, 
        title: formData.title 
      });
      return;
    }

    setIsLoading(true);

    try {
        console.log("🔍 Starting save process...");
        console.log("📝 Customer name:", formData.customerName);
        console.log("💰 Amount:", formData.amount);
        console.log("📋 Title:", formData.title);
        
        // Find or Create Customer
        let customerId = '';
        console.log("👥 Fetching existing customers...");
        const customers = await StorageService.getCustomers();
        console.log("📊 Found customers:", customers.length);
        
        const existingCustomer = customers.find(c => c.name.toLowerCase() === formData.customerName.toLowerCase());
        
        if (existingCustomer) {
          console.log("✅ Found existing customer:", existingCustomer.name, "ID:", existingCustomer.id);
          customerId = existingCustomer.id;
        } else {
          console.log("🆕 Creating new customer:", formData.customerName);
          const newCustomer: Customer = {
            id: `c_${Date.now()}`,
            name: formData.customerName,
            email: '',
            phone: formData.phoneNumber || '',
            address: formData.address || ''
          };
          console.log("💾 Saving new customer to database...");
          await StorageService.saveCustomer(newCustomer);
          console.log("✅ New customer saved successfully");
          customerId = newCustomer.id;
        }

        // Logic to handle Promise History
        let promiseHistory = editingDue?.promiseHistory || [];
        const newAgreedDate = formData.lastPaymentAgreedDate;
        
        // If a new agreed date is set and it's different from the old one, add to history
        if (newAgreedDate && (!editingDue || editingDue.lastPaymentAgreedDate !== newAgreedDate)) {
          const newPromise: PromiseRecord = {
            id: `pr_${Date.now()}`,
            promisedDate: newAgreedDate,
            createdAt: new Date().toISOString(),
            status: 'PENDING',
            note: formData.shortNote || 'Promise date updated via form'
          };
          promiseHistory = [...promiseHistory, newPromise];
        }

        console.log("📋 Creating due item...");
        const due: DueItem = {
          id: editingDue ? editingDue.id : `d_${Date.now()}`,
          customerId,
          amount: parseFloat(formData.amount),
          paidAmount: editingDue ? editingDue.paidAmount : 0,
          dueDate: formData.dueDate,
          title: formData.title,
          status: editingDue ? editingDue.status : PaymentStatus.PENDING,
          createdAt: editingDue ? editingDue.createdAt : new Date().toISOString(),
          shortNote: formData.shortNote,
          lastPaymentDate: formData.lastPaymentDate || null,
          lastPaymentAgreedDate: formData.lastPaymentAgreedDate || null,
          paymentHistory: editingDue?.paymentHistory || [],
          promiseHistory: promiseHistory, // Save the updated history
          phoneNumber: formData.phoneNumber || undefined,
          address: formData.address || undefined
        };

        console.log("🚀 Attempting to save due:", due);
        console.log("📊 Due ID:", due.id);
        console.log("👤 Customer ID:", due.customerId);
        console.log("💰 Amount:", due.amount);
        
        await StorageService.saveDue(due);
        console.log("📊 Due saved successfully, reloading data...");
        await loadData(); // Reload to get fresh data
        console.log("🔄 Data reloaded successfully");
        setIsAddModalOpen(false);
        setEditingDue(null);
        console.log("✅ Save process completed successfully");
    } catch (error) {
        console.error("❌ Save error:", error);
        console.error("Error name:", (error as any).name);
        console.error("Error stack:", (error as any).stack);
        showError("Save Failed", "Failed to save due: " + (error as Error).message);
        setIsLoading(false);
    }
  };

  const openAdd = () => {
    setEditingDue(null);
    setIsAddModalOpen(true);
  }

  const openEdit = (due: DueWithCustomer) => {
    setEditingDue(due);
    setIsAddModalOpen(true);
  };

  // Open the detail view
  const openDetails = (due: DueWithCustomer) => {
    console.log('📋=== OPEN DETAILS CALLED ===📋');
    console.log('📋 Due object received:', due);
    console.log('📋 Due ID:', due.id);
    console.log('📋 Due title:', due.title);
    console.log('📋 Current state before opening - viewingDue:', !!viewingDue, 'isDetailModalOpen:', isDetailModalOpen);
    
    if (!due || !due.id) {
      console.error('❌ Invalid due object received:', due);
      return;
    }
    
    setViewingDue(due);
    setIsDetailModalOpen(true);
    
    console.log('📋 State after opening - viewingDue set to:', !!due, 'isDetailModalOpen set to:', true);
    console.log('📋=== OPEN DETAILS COMPLETED ===📋');
  };

  const handleDelete = (id: string) => {
    const due = dues.find(d => d.id === id);
    if (due) {
      setItemToDelete({
        id: id,
        name: due.title || 'this due'
      });
      setDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setDeleteLoading(true);
    try {
      await StorageService.deleteDue(itemToDelete.id);
      // Update local state immediately for instant UI feedback
      setDues(prev => prev.filter(d => d.id !== itemToDelete.id));
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting due:', error);
      showError("Delete Failed", "Failed to delete due. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
    setDeleteLoading(false);
  };

  // Payment Handlers
  const handleAddPayment = (due: DueWithCustomer) => {
    setSelectedDueForPayment(due);
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = async (paymentData: {
    customerId: string;
    dueId: string;
    amount: number;
    paymentDate: string;
    paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'other';
    notes: string;
  }) => {
    try {
      console.log('💰 Saving payment:', paymentData);
      await StorageService.addPayment(paymentData);
      
      // Reload data to reflect changes
      await loadData();
      
      setIsPaymentModalOpen(false);
      setSelectedDueForPayment(null);
      console.log('✅ Payment saved successfully');
    } catch (error) {
      console.error('❌ Failed to save payment:', error);
      showError("Payment Failed", "Failed to save payment. Please try again.");
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      console.log('🗑️ Deleting payment:', paymentId);
      await StorageService.deletePayment(paymentId);
      await loadData();
      console.log('✅ Payment deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete payment:', error);
      showError("Delete Failed", "Failed to delete payment. Please try again.");
    }
  };

  const handleMarkPaid = async (id: string) => {
    const due = dues.find(d => d.id === id);
    if (due) {
      setIsLoading(true);
      const updatedDue = { ...due, status: PaymentStatus.PAID, paidAmount: due.amount };
      await StorageService.saveDue(updatedDue);
      await loadData();
      
      // If we are viewing details for this one, update the view state
      if (viewingDue && viewingDue.id === id) {
         setViewingDue({...viewingDue, ...updatedDue} as DueWithCustomer);
      }
    }
  };

  const handleGenerateReminder = async (due: DueWithCustomer) => {
    setReminderModalOpen(true);
    setReminderLoading(true);
    setReminderText('Generating polite reminder...');
    
    const text = await GeminiService.generateReminder(
      due.customer?.name || 'Customer', 
      due.amount - due.paidAmount, 
      due.dueDate, 
      'polite'
    );
    setReminderText(text || "Error generating reminder.");
    setReminderLoading(false);
  };

  // Authentication handlers
  const handleAuthSuccess = () => {
    showSuccess('Authentication Successful', 'Welcome to DueTrack AI!');
  };

  const handleSignOut = () => {
    setActiveTab('DASHBOARD');
    showSuccess('Signed Out', 'You have been signed out successfully');
  };

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const handleOpenUserProfile = () => {
    if (currentUser) {
      setIsUserProfileModalOpen(true);
    }
  };

  const overdueCount = dues.filter(d => d.status === PaymentStatus.OVERDUE).length;











  

  if (isLoading && dues.length === 0) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 text-gray-600 gap-6">
              <div className="relative">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow-primary animate-pulse">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                          <div className="w-4 h-4 bg-gradient-primary rounded animate-bounce" />
                      </div>
                  </div>
                  <div className="absolute -inset-2 bg-gradient-primary/20 rounded-2xl blur-xl animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold text-gray-800 animate-fade-in">DueTrack AI</h2>
                  <p className="text-gray-600 animate-fade-in delay-200">Loading your financial dashboard...</p>
              </div>
              <ModernSpinner size="lg" variant="primary" gradient />
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-gray-900 font-sans">
      
      {/* Modern Top Navigation */}
      <nav ref={navbarRef} className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 px-4 py-4 shadow-soft">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow-primary group-hover:scale-110 transition-transform duration-300">
                <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-gradient-primary rounded animate-pulse" />
                </div>
              </div>
              <div className="absolute -inset-1 bg-gradient-primary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                DueTrack AI
              </h1>
              <p className="text-sm text-gray-500">Smart Financial Management</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center gap-2">
            <ModernButton
              variant={activeTab === 'DASHBOARD' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('DASHBOARD')}
              gradient
              active={activeTab === 'DASHBOARD'}
              gradientTone="primary"
              className={`${activeTab === 'DASHBOARD' ? 'shadow-glow-primary' : 'hover:shadow-medium'} group flex items-center gap-2 w-[120px] h-[44px] px-3 transition-all duration-300`}
            >
              <LayoutGrid size={20} className={`${activeTab === 'DASHBOARD' ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'} transition-all duration-300 flex-shrink-0`} />
              <span className={`${activeTab === 'DASHBOARD' ? 'text-white font-semibold' : 'text-gray-700 group-hover:text-primary-700'} text-sm font-medium transition-all duration-300`}>Dashboard</span>
            </ModernButton>
            
            <ModernButton
              variant={activeTab === 'LIST' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('LIST')}
              gradient
              active={activeTab === 'LIST'}
              gradientTone="primary"
              className={`${activeTab === 'LIST' ? 'shadow-glow-primary' : 'hover:shadow-medium'} group flex items-center gap-2 w-[120px] h-[44px] px-3 transition-all duration-300`}
            >
              <List size={20} className={`${activeTab === 'LIST' ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'} transition-all duration-300 flex-shrink-0`} />
              <span className={`${activeTab === 'LIST' ? 'text-white font-semibold' : 'text-gray-700 group-hover:text-primary-700'} text-sm font-medium transition-all duration-300`}>Dues</span>
            </ModernButton>
            
            <ModernButton
              variant={activeTab === 'PAYMENTS' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('PAYMENTS')}
              gradient
              active={activeTab === 'PAYMENTS'}
              gradientTone="primary"
              className={`${activeTab === 'PAYMENTS' ? 'shadow-glow-primary' : 'hover:shadow-medium'} group flex items-center gap-2 w-[120px] h-[44px] px-3 transition-all duration-300`}
            >
              <DollarSign size={20} className={`${activeTab === 'PAYMENTS' ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'} transition-all duration-300 flex-shrink-0`} />
              <span className={`${activeTab === 'PAYMENTS' ? 'text-white font-semibold' : 'text-gray-700 group-hover:text-primary-700'} text-sm font-medium transition-all duration-300`}>Payments</span>
            </ModernButton>

            <ModernButton
              variant={activeTab === 'FIREBASE_TEST' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('FIREBASE_TEST')}
              gradient
              active={activeTab === 'FIREBASE_TEST'}
              gradientTone="primary"
              className={`${activeTab === 'FIREBASE_TEST' ? 'shadow-glow-primary' : 'hover:shadow-medium'} group flex items-center gap-2 w-[120px] h-[44px] px-3 transition-all duration-300`}
            >
              <Activity size={20} className={`${activeTab === 'FIREBASE_TEST' ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'} transition-all duration-300 flex-shrink-0`} />
              <span className={`${activeTab === 'FIREBASE_TEST' ? 'text-white font-semibold' : 'text-gray-700 group-hover:text-primary-700'} text-sm font-medium transition-all duration-300`}>Firebase</span>
            </ModernButton>
            

          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <NotificationBell userId={currentUser?.id || 'current-user'} />
            
            {/* Profile Menu */}
            <div className="relative" ref={profileMenuRef}>
              {currentUser ? (
                <ModernButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300"
                >
                  <User size={18} className="text-gray-600" />
                </ModernButton>
              ) : (
                <ModernButton
                  variant="primary"
                  size="sm"
                  onClick={handleOpenAuthModal}
                  gradient
                  className="h-10 px-4"
                >
                  Sign In
                </ModernButton>
              )}
              
              {/* Profile Dropdown */}
              {isProfileMenuOpen && currentUser && (
                <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-2 animate-scale-in z-50">
                  <div className="px-3 py-2 text-sm text-gray-700 border-b border-gray-200 mb-2">
                    <div className="font-semibold">{currentUser.displayName || currentUser.email}</div>
                    <div className="text-xs text-gray-500 capitalize">{currentUser.role || 'user'}</div>
                  </div>
                  <button 
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={handleOpenUserProfile}
                  >
                    <Settings size={16} />
                    Profile Settings
                  </button>
                  <button 
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Activity size={16} />
                    Activity
                  </button>
                  <hr className="my-2 border-gray-200" />
                  <button 
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    onClick={handleSignOut}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
            
            {/* Add Due Button */}
            <ModernButton
              variant="primary"
              size="md"
              onClick={openAdd}
              gradient
              className="hidden sm:flex items-center gap-2 px-4 h-10 rounded-xl relative overflow-hidden"
            >
              <div className="flex items-center gap-2 relative z-10">
                <Plus size={16} />
                <span className="text-[12px] font-semibold">Add Due</span>
              </div>
              <span className="absolute inset-0 bg-gradient-primary rounded-xl" />
              <span className="absolute -inset-1 bg-gradient-primary opacity-15 blur-sm rounded-xl" style={{ transform: 'scale(0.95)' }} />
            </ModernButton>
            
            {/* Mobile Menu Button */}
            <ModernButton
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </ModernButton>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div ref={mobileMenuRef} className="lg:hidden mt-4 animate-slide-in-down">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
              <button
                onClick={() => { setActiveTab('DASHBOARD'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-4 h-14 px-5 rounded-xl transition-all duration-200 ${activeTab === 'DASHBOARD' ? 'bg-gradient-primary text-white shadow-lg' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
              >
                <LayoutGrid size={22} className="flex-shrink-0" />
                <span className="text-left inline-flex flex-col min-w-0">
                  <span className={`font-semibold ${activeTab === 'DASHBOARD' ? 'text-white' : 'text-gray-800'}`}>Dashboard</span>
                  <span className={`text-xs ${activeTab === 'DASHBOARD' ? 'text-white/90' : 'text-gray-500'}`}>Overview & Analytics</span>
                </span>
              </button>
              
              <button
                onClick={() => { setActiveTab('LIST'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-4 h-14 px-5 rounded-xl transition-all duration-200 ${activeTab === 'LIST' ? 'bg-gradient-primary text-white shadow-lg' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
              >
                <List size={22} className="flex-shrink-0" />
                <span className="text-left inline-flex flex-col min-w-0">
                  <span className={`font-semibold ${activeTab === 'LIST' ? 'text-white' : 'text-gray-800'}`}>All Dues</span>
                  <span className={`text-xs ${activeTab === 'LIST' ? 'text-white/90' : 'text-gray-500'}`}>Manage payments</span>
                </span>
              </button>
              
              <button
                onClick={() => { setActiveTab('PAYMENTS'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-4 h-14 px-5 rounded-xl transition-all duration-200 ${activeTab === 'PAYMENTS' ? 'bg-gradient-primary text-white shadow-lg' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
              >
                <DollarSign size={22} className="flex-shrink-0" />
                <span className="text-left inline-flex flex-col min-w-0">
                  <span className={`font-semibold ${activeTab === 'PAYMENTS' ? 'text-white' : 'text-gray-800'}`}>Payments</span>
                  <span className={`text-xs ${activeTab === 'PAYMENTS' ? 'text-white/90' : 'text-gray-500'}`}>Track transactions</span>
                </span>
              </button>
              

              
              <hr className="my-4 border-gray-200" />
              
              <button
                onClick={() => { openAdd(); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-4 h-14 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus size={22} className="flex-shrink-0" />
                <span className="text-left inline-flex flex-col min-w-0">
                  <span className="font-semibold">Add Payment</span>
                  <span className="text-xs text-white/90">Create new due</span>
                </span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Enhanced Status Banner */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        {!isConfigured ? (
          <ModernCard variant="glass" className="border-l-4 border-warning-500">
            <div className="flex items-center gap-3">
              <WifiOff size={20} className="text-warning-600" />
              <div>
                <h3 className="font-semibold text-warning-800">Firebase Not Connected</h3>
                <p className="text-sm text-warning-600">Configure Firebase to enable real-time data synchronization</p>
              </div>
            </div>
          </ModernCard>
        ) : (
          <ModernCard variant="glass" className="border-l-4 border-success-500">
            <div className="flex items-center gap-3">
              <Database size={20} className="text-success-600" />
              <div>
                <h3 className="font-semibold text-success-800">Connected to Cloud</h3>
                <p className="text-sm text-success-600">Real-time data synchronization is active</p>
              </div>
            </div>
          </ModernCard>
        )}
      </div>

      {/* Modern Main Content */}
      <main className="max-w-7xl mx-auto p-3 md:p-4 lg:p-6 mt-4 pb-28 lg:pb-0">
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Sidebar / Tabs (Desktop) */}
          <aside className="w-full lg:w-72 flex-shrink-0 hidden lg:block">
            <ModernCard variant="elevated" className="sticky top-28 animate-slide-in-left">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                    <LayoutGrid size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800">Navigation</h2>
                    <p className="text-sm text-gray-500">Quick access</p>
                  </div>
                </div>
                
                <nav className="space-y-3">
                  <ModernButton
                    variant={activeTab === 'DASHBOARD' ? 'primary' : 'ghost'}
                    size="md"
                    onClick={() => setActiveTab('DASHBOARD')}
                    gradient
                    active={activeTab === 'DASHBOARD'}
                    gradientTone="primary"
                    className={`group w-full flex items-center gap-4 justify-start ${activeTab === 'DASHBOARD' ? 'shadow-glow-primary' : 'hover:shadow-medium'} h-14 px-5 rounded-xl`}
                  >
                    <LayoutGrid size={22} className={`${activeTab === 'DASHBOARD' ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'} transition-all duration-300 flex-shrink-0`} />
                    <span className="text-left inline-flex flex-col min-w-0">
                      <span className={`font-semibold ${activeTab === 'DASHBOARD' ? 'text-white' : 'text-gray-800 group-hover:text-primary-700'} transition-all duration-300`}>Dashboard</span>
                      <span className={`text-xs ${activeTab === 'DASHBOARD' ? 'text-white/90' : 'text-gray-500 group-hover:text-primary-600/80'} transition-all duration-300`}>Overview & Analytics</span>
                    </span>
                  </ModernButton>
                  
                  <ModernButton
                    variant={activeTab === 'LIST' ? 'primary' : 'ghost'}
                    size="md"
                    onClick={() => setActiveTab('LIST')}
                    gradient
                    active={activeTab === 'LIST'}
                    gradientTone="primary"
                    className={`group w-full flex items-center gap-4 justify-start ${activeTab === 'LIST' ? 'shadow-glow-primary' : 'hover:shadow-medium'} h-14 px-5 rounded-xl`}
                  >
                    <List size={22} className={`${activeTab === 'LIST' ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'} transition-all duration-300 flex-shrink-0`} />
                    <span className="text-left inline-flex flex-col min-w-0">
                      <span className={`font-semibold ${activeTab === 'LIST' ? 'text-white' : 'text-gray-800 group-hover:text-primary-700'} transition-all duration-300`}>All Dues</span>
                      <span className={`text-xs ${activeTab === 'LIST' ? 'text-white/90' : 'text-gray-500 group-hover:text-primary-600/80'} transition-all duration-300`}>Manage payments</span>
                    </span>
                  </ModernButton>
                  
                  <ModernButton
                    variant={activeTab === 'PAYMENTS' ? 'primary' : 'ghost'}
                    size="md"
                    onClick={() => setActiveTab('PAYMENTS')}
                    gradient
                    active={activeTab === 'PAYMENTS'}
                    gradientTone="primary"
                    className={`group w-full flex items-center gap-4 justify-start ${activeTab === 'PAYMENTS' ? 'shadow-glow-primary' : 'hover:shadow-medium'} h-14 px-5 rounded-xl`}
                  >
                    <DollarSign size={22} className={`${activeTab === 'PAYMENTS' ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'} transition-all duration-300 flex-shrink-0`} />
                    <span className="text-left inline-flex flex-col min-w-0">
                      <span className={`font-semibold ${activeTab === 'PAYMENTS' ? 'text-white' : 'text-gray-800 group-hover:text-primary-700'} transition-all duration-300`}>Payments</span>
                      <span className={`text-xs ${activeTab === 'PAYMENTS' ? 'text-white/90' : 'text-gray-500 group-hover:text-primary-600/80'} transition-all duration-300`}>Track transactions</span>
                    </span>
                  </ModernButton>
                  

                </nav>
                
                <div className="pt-4 border-t border-gray-200">
                  <ModernButton
                    variant="primary"
                    size="md"
                    onClick={openAdd}
                    gradient
                    active={true}
                    gradientTone="primary"
                    className="group w-full flex items-center gap-4 justify-start h-14 px-5 rounded-xl"
                  >
                    <Plus size={22} className="text-white transition-all duration-300 flex-shrink-0" />
                    <span className="text-left inline-flex flex-col min-w-0">
                      <span className="font-semibold text-white transition-all duration-300">Add Payment</span>
                      <span className="text-xs text-white/90 transition-all duration-300">Create new due</span>
                    </span>
                  </ModernButton>
                </div>
              </div>
            </ModernCard>
          </aside>

          {/* Enhanced Content Area */}
          <div className="flex-1">
             {/* Mobile Header */}
             <div className="mb-8 lg:hidden">
               <ModernCard variant="elevated" className="p-6">
                 <div className="flex items-center justify-between">
                   <div>
                     <h1 className="text-2xl font-bold text-gray-800">
                       {activeTab === 'DASHBOARD' ? 'Dashboard' : 
                        activeTab === 'LIST' ? 'All Dues' : 
                        activeTab === 'PAYMENTS' ? 'Payment Management' :
                        activeTab === 'FIREBASE_TEST' ? 'Firebase Test' :
                        'Dashboard'}
                     </h1>
                     <p className="text-sm text-gray-500 mt-1">
                       {activeTab === 'DASHBOARD' ? 'Financial overview and analytics' :
                        activeTab === 'LIST' ? 'Manage your due payments' :
                        activeTab === 'PAYMENTS' ? 'Track payment transactions' :
                        activeTab === 'FIREBASE_TEST' ? 'Test Firebase features' :
                        'Welcome back'}
                     </p>
                   </div>
                   <ModernButton
                     variant="primary"
                     size="md"
                     onClick={openAdd}
                     gradient
                     glow
                     className="sm:hidden"
                   >
                     <Plus size={18} />
                   </ModernButton>
                 </div>
               </ModernCard>
             </div>

             {/* Animated Content Transitions */}
             <div className="animate-fade-in">
               {activeTab === 'DASHBOARD' && <Dashboard dues={dues} payments={payments} />}
               {activeTab === 'LIST' && (
                 <DueListRedesign 
                   dues={dues} 
                   onEdit={openEdit} 
                   onDelete={handleDelete} 
                   onMarkPaid={handleMarkPaid}
                   onGenerateReminder={handleGenerateReminder}
                   onViewDetails={openDetails}
                   onAddPayment={handleAddPayment}
                 />
               )}
               {activeTab === 'PAYMENTS' && (
                 <PaymentSection 
                   payments={payments}
                   customers={customers}
                   dues={dues}
                   onDeletePayment={handleDeletePayment}
                 />
               )}
               {activeTab === 'FIREBASE_TEST' && (
                 <FirebaseTestDashboard />
               )}

             </div>
          </div>
        </div>
      </main>

      {/* Modern Mobile Floating Action Button */}
      <div className="lg:hidden fixed bottom-28 right-6 z-50">
        <ModernButton
          variant="primary"
          size="lg"
          onClick={openAdd}
          gradient
          glow
          className="w-16 h-16 p-0 rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <Plus size={28} />
        </ModernButton>
      </div>

      {/* Modern Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-white/95 via-white/90 to-white/95 backdrop-blur-xl border-t border-white/30 z-40 px-6 py-4 shadow-lg safe-area-bottom">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <button 
            onClick={() => setActiveTab('DASHBOARD')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
              activeTab === 'DASHBOARD' 
                ? 'text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-glow-primary ring-1 ring-white/30' 
                : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <LayoutGrid size={18} />
            <span className="text-[12px] font-semibold tracking-wide">Home</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('LIST')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
              activeTab === 'LIST' 
                ? 'text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-glow-primary ring-1 ring-white/30' 
                : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <List size={18} />
            <span className="text-[12px] font-semibold tracking-wide">Dues</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('PAYMENTS')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
              activeTab === 'PAYMENTS' 
                ? 'text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-glow-primary ring-1 ring-white/30' 
                : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <DollarSign size={18} />
            <span className="text-[12px] font-semibold tracking-wide">Payments</span>
          </button>

          <button 
            onClick={() => setActiveTab('FIREBASE_TEST')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
              activeTab === 'FIREBASE_TEST' 
                ? 'text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-glow-primary ring-1 ring-white/30' 
                : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Activity size={18} />
            <span className="text-[12px] font-semibold tracking-wide">Firebase</span>
          </button>
          

        </div>
      </div>

      {/* Unified Add/Edit Modal */}
      {isAddModalOpen && (
        <SmartAddModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveDue}
          editingDue={editingDue ? { 
            ...editingDue, 
            customerName: editingDue.customer?.name // HACK: Pass name into DueItem for Form
          } as any : null}
        />
      )}

      {/* Full Detail Modal */}
      {isDetailModalOpen && viewingDue && (
        <>
          {console.log('🎨 Rendering DueDetailModal with viewingDue:', viewingDue.id, viewingDue.title)}
          {console.log('🎨 Modal conditions - isDetailModalOpen:', isDetailModalOpen, 'viewingDue exists:', !!viewingDue)}
          <DueDetailModal 
            due={viewingDue}
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            onMarkPaid={handleMarkPaid}
            onGenerateReminder={handleGenerateReminder}
            onAddPayment={handleAddPayment}
          />
        </>
      )}

      {/* Modern Reminder Preview Modal */}
      {reminderModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in">
          <ModernCard variant="elevated" className="w-full max-w-lg animate-scale-in">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <MessageSquare size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">AI Reminder Draft</h2>
                  <p className="text-sm text-gray-500">Generated by our AI assistant</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200 min-h-[120px]">
                {reminderLoading ? (
                  <div className="flex items-center gap-3 text-gray-500">
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <span>AI is crafting your personalized reminder...</span>
                  </div>
                ) : (
                  <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap animate-fade-in">
                    {reminderText}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 justify-end">
                <ModernButton
                  variant="ghost"
                  size="md"
                  onClick={() => setReminderModalOpen(false)}
                >
                  Close
                </ModernButton>
                <ModernButton
                  variant="primary"
                  size="md"
                  onClick={() => {
                    navigator.clipboard.writeText(reminderText);
                  }}
                  disabled={reminderLoading}
                  gradient
                >
                  Copy Text
                </ModernButton>
              </div>
            </div>
          </ModernCard>
        </div>
      )}

      {/* Modern Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        itemName={itemToDelete?.name || 'this item'}
        loading={deleteLoading}
      />

      {/* Modern Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in">
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              setSelectedDueForPayment(null);
            }}
            onSave={handleSavePayment}
            customers={customers}
            dues={dues}
            selectedCustomer={selectedDueForPayment?.customer}
            selectedDue={selectedDueForPayment}
            onError={(title: string, message?: string) => console.error(title, message)}
          />
        </div>
      )}

      {/* Authentication Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {currentUser && (
        <UserProfileModal 
          isOpen={isUserProfileModalOpen}
          onClose={() => setIsUserProfileModalOpen(false)}
          user={currentUser}
          onSignOut={handleSignOut}
        />
      )}

      

    </div>
  );
};

export default App;