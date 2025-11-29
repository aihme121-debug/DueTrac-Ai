import React, { useState, useMemo, useEffect, memo, useCallback } from 'react';
import { Customer, DueItem, PaymentTransaction } from '../types';
import { DollarSign, Calendar, User, Search, Filter, Download, Eye, Trash2, CreditCard, TrendingUp, TrendingDown, FileText, ArrowUpRight, PieChart, BarChart3 } from 'lucide-react';
import { ModernCard, ModernButton, ModernInput } from '../utils/uiComponents';
import { animationPresets } from '../utils/animations';
import { useErrorHandling } from '../src/hooks/useErrorHandling';
import { ErrorState } from '../src/components/ErrorState';

// Memoized PaymentCard component
interface PaymentCardProps {
  payment: PaymentTransaction;
  customer: Customer | undefined;
  due: DueItem | undefined;
  index: number;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onViewPaymentDetails?: (payment: PaymentTransaction) => void;
  onDeletePayment?: (paymentId: string) => void;
}

const PaymentCard = memo<PaymentCardProps>(({
  payment,
  customer,
  due,
  index,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onViewPaymentDetails,
  onDeletePayment
}) => {
  const methodConfig = getPaymentMethodConfig(payment.paymentMethod);
  
  return (
    <ModernCard
      variant="elevated"
      className={`animate-elegant-fade transition-all duration-500 ${
        isHovered ? 'scale-[1.02] shadow-glow-primary' : 'hover:shadow-medium'
      }`}
      hover
      glow
      padding="md"
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Simplified Payment Card Header */}
      <div className={`p-4 ${getPaymentMethodGradient(payment.paymentMethod)} text-white rounded-xl mb-4 relative overflow-hidden`}>
        {/* Single floating particle effect - preserved */}
        <span className="absolute top-3 right-3 w-1 h-1 bg-white/40 rounded-full animate-float" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-md">
              <methodConfig.icon size={20} className="text-white" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="font-bold text-white text-base sm:text-lg truncate">{customer?.name || 'Unknown Customer'}</div>
              <div className="text-white/80 text-xs sm:text-sm truncate">{due?.title || 'Unknown Due'}</div>
            </div>
          </div>
          <ModernBadge
            variant={methodConfig.color as any}
            gradient
            size="sm"
            className="backdrop-blur-sm border border-white/20 flex-shrink-0"
          >
            {methodConfig.label}
          </ModernBadge>
        </div>
      </div>
      
      {/* Simplified Payment Amount */}
      <div className="text-center mb-4">
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">${payment.amount.toFixed(2)}</div>
        <div className="text-sm sm:text-base text-gray-600 font-medium">
          {new Date(payment.paymentDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      </div>
      
      {/* Simplified Payment Details */}
      {payment.notes && (
        <div className="mb-4 p-3 bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl border border-accent-200">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={14} className="text-accent-500" />
            <div className="text-sm font-semibold text-gray-900">Notes</div>
          </div>
          <div className="text-gray-700 text-sm italic leading-relaxed">{payment.notes}</div>
        </div>
      )}
      
      {/* Simplified Action Buttons */}
      <div className="flex gap-2">
        {onViewPaymentDetails && (
          <ModernButton
            onClick={() => onViewPaymentDetails(payment)}
            variant="secondary"
            gradient={false}
            size="md"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm"
          >
            <Eye size={16} />
            View
          </ModernButton>
        )}
        {onDeletePayment && (
          <ModernButton
            onClick={() => onDeletePayment(payment.id)}
            variant="danger"
            gradient={false}
            size="md"
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm"
          >
            <Trash2 size={16} />
            Delete
          </ModernButton>
        )}
      </div>
    </ModernCard>
  );
});

PaymentCard.displayName = 'PaymentCard';

interface PaymentSectionProps {
  payments: PaymentTransaction[];
  customers: Customer[];
  dues: DueItem[];
  onViewPaymentDetails?: (payment: PaymentTransaction) => void;
  onDeletePayment?: (paymentId: string) => void;
}

const PaymentSectionComponent: React.FC<PaymentSectionProps> = ({
  payments,
  customers,
  dues,
  onViewPaymentDetails,
  onDeletePayment
}) => {
  const { errorState, showError, showSuccess, showWarning } = useErrorHandling();
  
  // Memoized callbacks to prevent unnecessary re-renders
  const handleViewPaymentDetails = useCallback((payment: PaymentTransaction) => {
    try {
      onViewPaymentDetails?.(payment);
    } catch (error) {
      showError('Failed to view payment details');
      console.error('View payment details error:', error);
    }
  }, [onViewPaymentDetails, showError]);

  const handleDeletePayment = useCallback(async (paymentId: string) => {
    try {
      onDeletePayment?.(paymentId);
      showSuccess('Payment deleted successfully');
    } catch (error) {
      showError('Failed to delete payment');
      console.error('Delete payment error:', error);
    }
  }, [onDeletePayment, showError, showSuccess]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [animatedPayments, setAnimatedPayments] = useState<PaymentTransaction[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Animate payments entry with enhanced timing
  useEffect(() => {
    if (payments.length > 0) {
      setAnimatedPayments([]);
      payments.forEach((payment, index) => {
        setTimeout(() => {
          setAnimatedPayments(prev => [...prev, payment]);
        }, index * 100);
      });
    } else {
      setAnimatedPayments([]);
    }
  }, [payments]);

  // Create maps for efficient lookups
  const customerMap = useMemo(() => 
    new Map(customers.map(c => [c.id, c])), 
    [customers]
  );

  const dueMap = useMemo(() => 
    new Map(dues.map(d => [d.id, d])), 
    [dues]
  );

  // Filter payments
  const filteredPayments = useMemo(() => {
    let filtered = animatedPayments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment => {
        const customer = customerMap.get(payment.customerId);
        const due = dueMap.get(payment.dueId);
        const searchLower = searchTerm.toLowerCase();
        
        return (
          customer?.name.toLowerCase().includes(searchLower) ||
          customer?.email.toLowerCase().includes(searchLower) ||
          due?.title.toLowerCase().includes(searchLower) ||
          payment.paymentMethod.toLowerCase().includes(searchLower) ||
          payment.notes.toLowerCase().includes(searchLower)
        );
      });
    }

    // Payment method filter
    if (filterMethod !== 'ALL') {
      filtered = filtered.filter(payment => payment.paymentMethod === filterMethod);
    }

    // Date filter
    if (dateFilter !== 'ALL') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'TODAY':
          filtered = filtered.filter(payment => 
            new Date(payment.paymentDate).toDateString() === now.toDateString()
          );
          break;
        case 'WEEK':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(payment => 
            new Date(payment.paymentDate) >= filterDate
          );
          break;
        case 'MONTH':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(payment => 
            new Date(payment.paymentDate) >= filterDate
          );
          break;
      }
    }

    // Sort by payment date (newest first)
    return filtered.sort((a, b) => 
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
  }, [animatedPayments, searchTerm, filterMethod, dateFilter, customerMap, dueMap]);

  // Calculate totals
  const totals = useMemo(() => {
    const total = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const cash = filteredPayments.filter(p => p.paymentMethod === 'cash').reduce((sum, payment) => sum + payment.amount, 0);
    const bank = filteredPayments.filter(p => p.paymentMethod === 'bank_transfer').reduce((sum, payment) => sum + payment.amount, 0);
    const card = filteredPayments.filter(p => p.paymentMethod === 'credit_card').reduce((sum, payment) => sum + payment.amount, 0);
    
    return { total, cash, bank, card };
  }, [filteredPayments]);

  const paymentMethods = ['cash', 'bank_transfer', 'credit_card', 'check', 'other'];

  const getPaymentMethodConfig = (method: string) => {
    switch (method) {
      case 'cash': return { icon: DollarSign, color: 'success', label: 'Cash', gradientTone: 'success' };
      case 'bank_transfer': return { icon: TrendingDown, color: 'accent', label: 'Bank Transfer', gradientTone: 'accent' };
      case 'credit_card': return { icon: CreditCard, color: 'primary', label: 'Credit Card', gradientTone: 'primary' };
      case 'check': return { icon: FileText, color: 'warning', label: 'Check', gradientTone: 'warning' };
      default: return { icon: DollarSign, color: 'neutral', label: 'Other', gradientTone: 'secondary' };
    }
  };

  const getPaymentMethodGradient = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-gradient-success';
      case 'bank_transfer': return 'bg-gradient-accent';
      case 'credit_card': return 'bg-gradient-primary';
      case 'check': return 'bg-gradient-warning';
      default: return 'bg-gradient-secondary';
    }
  };

  const exportPayments = () => {
    try {
      const csvContent = [
        ['Date', 'Customer', 'Due Title', 'Amount', 'Method', 'Notes'],
        ...filteredPayments.map(payment => {
          const customer = customerMap.get(payment.customerId);
          const due = dueMap.get(payment.dueId);
          return [
            new Date(payment.paymentDate).toLocaleDateString(),
            customer?.name || 'Unknown',
            due?.title || 'Unknown',
            payment.amount.toFixed(2),
            payment.paymentMethod,
            payment.notes
          ];
        })
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccess('Payments exported successfully', {
        description: `Exported ${filteredPayments.length} payment records`
      });
    } catch (error) {
      showError('Failed to export payments');
      console.error('Export payments error:', error);
    }
  };

  // Add error state handling
  if (errorState.isError) {
    return (
      <ErrorState
        title="Payment Section Error"
        message={errorState.errorMessage}
        onRetry={() => window.location.reload()}
        showDetails={true}
        error={errorState.error || undefined}
      />
    );
  }

  return (
    <ModernCard variant="elevated" className="overflow-hidden" glow>
      {/* Simplified Header with Preserved Animations */}
      <div className="bg-gradient-luxury p-4 sm:p-6 text-white relative overflow-hidden">
        {/* Floating particles effect - kept for animation */}
        <span className="absolute top-4 right-4 w-2 h-2 bg-white/30 rounded-full animate-float" />
        <span className="absolute bottom-6 left-6 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
        <span className="absolute top-8 left-8 w-1 h-1 bg-white/20 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 relative z-10">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
              <DollarSign size={24} className="sm:size-32 text-white" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                Payment Management
              </h2>
              <p className="text-white/80 text-sm sm:text-base">Track and manage all payment transactions</p>
            </div>
          </div>
          <button
            onClick={exportPayments}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-200 backdrop-blur-sm"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        {/* Simplified Summary Cards with Preserved Animations */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative z-10">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center hover:scale-105 transition-all duration-300">
            <div className="text-xs sm:text-sm text-white/70 mb-1 sm:mb-2">Total Payments</div>
            <div className="text-lg sm:text-2xl font-bold text-white">${totals.total.toFixed(2)}</div>
            <div className="text-xs text-white/60 mt-1">All transactions</div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center hover:scale-105 transition-all duration-300">
            <div className="text-xs sm:text-sm text-white/70 mb-1 sm:mb-2">Cash Payments</div>
            <div className="text-lg sm:text-2xl font-bold text-white">${totals.cash.toFixed(2)}</div>
            <div className="text-xs text-white/60 mt-1">Physical currency</div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center hover:scale-105 transition-all duration-300">
            <div className="text-xs sm:text-sm text-white/70 mb-1 sm:mb-2">Bank Transfers</div>
            <div className="text-lg sm:text-2xl font-bold text-white">${totals.bank.toFixed(2)}</div>
            <div className="text-xs text-white/60 mt-1">Electronic transfers</div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center hover:scale-105 transition-all duration-300">
            <div className="text-xs sm:text-sm text-white/70 mb-1 sm:mb-2">Card Payments</div>
            <div className="text-lg sm:text-2xl font-bold text-white">${totals.card.toFixed(2)}</div>
            <div className="text-xs text-white/60 mt-1">Credit/debit cards</div>
          </div>
        </div>
      </div>

      {/* Simplified Filters for Mobile */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterMethod('ALL')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filterMethod === 'ALL' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              All Methods
            </button>
            {paymentMethods.map(method => {
              const config = getPaymentMethodConfig(method);
              const isActive = filterMethod === method;
              let buttonClass = "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ";
              
              if (isActive) {
                if (config.color === 'success') buttonClass += 'bg-green-600 text-white shadow-md';
                else if (config.color === 'accent') buttonClass += 'bg-purple-600 text-white shadow-md';
                else if (config.color === 'primary') buttonClass += 'bg-blue-600 text-white shadow-md';
                else if (config.color === 'warning') buttonClass += 'bg-yellow-600 text-white shadow-md';
                else buttonClass += 'bg-gray-600 text-white shadow-md';
              } else {
                buttonClass += 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100';
              }
              
              return (
                <button
                  key={method}
                  onClick={() => setFilterMethod(method)}
                  className={buttonClass}
                >
                  <config.icon size={14} />
                  {config.label}
                </button>
              );
            })}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDateFilter('ALL')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                dateFilter === 'ALL' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateFilter('TODAY')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                dateFilter === 'TODAY' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('WEEK')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                dateFilter === 'WEEK' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setDateFilter('MONTH')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                dateFilter === 'MONTH' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Payments Grid */}
      <div className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 lg:p-8">
        {filteredPayments.length === 0 ? (
          <ModernCard variant="elevated" className="text-center" padding="lg" glow>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-2xl flex items-center justify-center shadow-lg">
                <DollarSign size={32} className="text-gray-400 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">No payments found</h3>
                <p className="text-gray-500 text-sm sm:text-base">No payments match your current filters.</p>
                <div className="text-xs sm:text-sm text-gray-400">Try adjusting your search or filter criteria.</div>
              </div>
            </div>
          </ModernCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredPayments.map((payment, index) => {
              const customer = customerMap.get(payment.customerId);
              const due = dueMap.get(payment.dueId);
              const isHovered = hoveredCard === payment.id;
              
              return (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  customer={customer}
                  due={due}
                  index={index}
                  isHovered={isHovered}
                  onMouseEnter={() => setHoveredCard(payment.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onViewPaymentDetails={handleViewPaymentDetails}
                  onDeletePayment={handleDeletePayment}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Enhanced Footer */}
      <div className="p-4 sm:p-6 lg:p-8 border-t border-gray-100/50 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="text-sm sm:text-lg text-gray-600">
            Showing <span className="font-bold text-gray-900">{filteredPayments.length}</span> of 
            <span className="font-bold text-gray-900">{payments.length}</span> payments
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900 bg-gradient-primary bg-clip-text text-transparent">
            Total: ${totals.total.toFixed(2)}
          </div>
        </div>
      </div>
    </ModernCard>
  );
};

// Helper functions for payment method configuration
function getPaymentMethodConfig(method: string) {
  const configs: Record<string, { icon: any; color: string; label: string }> = {
    'CASH': { icon: DollarSign, color: 'success', label: 'Cash' },
    'BANK_TRANSFER': { icon: CreditCard, color: 'primary', label: 'Bank Transfer' },
    'CHECK': { icon: FileText, color: 'warning', label: 'Check' },
    'OTHER': { icon: CreditCard, color: 'secondary', label: 'Other' }
  };
  return configs[method] || configs['OTHER'];
}

function getPaymentMethodGradient(method: string) {
  const gradients: Record<string, string> = {
    'CASH': 'bg-gradient-to-br from-green-500 via-green-600 to-green-700',
    'BANK_TRANSFER': 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700',
    'CHECK': 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700',
    'OTHER': 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700'
  };
  return gradients[method] || gradients['OTHER'];
}

// Export memoized PaymentSection
const PaymentSection = memo(PaymentSectionComponent);
PaymentSection.displayName = 'PaymentSection';

export { PaymentSection };