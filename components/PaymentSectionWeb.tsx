import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Customer, DueItem, PaymentTransaction } from '../types';
import { DollarSign, Calendar, User, Search, Filter, Download, Eye, Trash2, CreditCard, TrendingUp, TrendingDown, FileText, ArrowUpRight, PieChart, BarChart3 } from 'lucide-react';
import { ModernCard, ModernButton, ModernBadge, ModernInput } from '../utils/uiComponents';
import { animationPresets } from '../utils/animations';
import './PaymentSectionWeb.css';

interface PaymentSectionWebProps {
  payments: PaymentTransaction[];
  customers: Customer[];
  dues: DueItem[];
  onViewPaymentDetails?: (payment: PaymentTransaction) => void;
  onDeletePayment?: (paymentId: string) => void;
}

// Performance-optimized animation variants
const animationVariants = {
  card: {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    hover: { scale: 1.02, y: -2, transition: { duration: 0.2, ease: "easeOut" } },
    tap: { scale: 0.98 }
  },
  header: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  },
  particle: {
    float: {
      y: [-2, 2, -2],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    }
  }
};

// Color system matching mobile design
const colorSystem = {
  primary: {
    gradient: 'bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500',
    text: 'text-white',
    background: 'bg-white/20 backdrop-blur-sm',
    hover: 'hover:bg-white/30'
  },
  card: {
    background: 'bg-white',
    border: 'border border-gray-100',
    shadow: 'shadow-lg hover:shadow-xl',
    hover: 'hover:shadow-2xl hover:scale-[1.02]'
  },
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    muted: 'text-gray-400'
  }
};

// Typography system - improved for mobile
const typography = {
  header: 'text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight',
  subheader: 'text-base sm:text-lg md:text-xl text-white/80',
  cardTitle: 'text-lg sm:text-xl font-semibold',
  cardSubtitle: 'text-xs sm:text-sm text-gray-600',
  amount: 'text-2xl sm:text-3xl font-bold'
};

// Spacing system - improved for mobile
const spacing = {
  container: 'p-3 sm:p-4 md:p-6 lg:p-8',
  card: 'p-3 sm:p-4',
  section: 'mb-6 md:mb-8 lg:mb-10',
  element: 'mb-3 sm:mb-4'
};

export const PaymentSectionWeb: React.FC<PaymentSectionWebProps> = ({
  payments,
  customers,
  dues,
  onViewPaymentDetails,
  onDeletePayment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [animatedPayments, setAnimatedPayments] = useState<PaymentTransaction[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  

  // Performance-optimized animation with RAF
  useEffect(() => {
    setIsLoaded(true);
    if (payments.length > 0) {
      setAnimatedPayments([]);
      payments.forEach((payment, index) => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            setAnimatedPayments(prev => [...prev, payment]);
          }, index * 50); // Faster animation for web
        });
      });
    } else {
      setAnimatedPayments([]);
    }
  }, [payments]);

  // Optimized memoization
  const customerMap = useMemo(() => 
    new Map(customers.map(c => [c.id, c])), 
    [customers]
  );

  const dueMap = useMemo(() => 
    new Map(dues.map(d => [d.id, d])), 
    [dues]
  );

  // Optimized filtering with useMemo and messages
  const filteredPayments = useMemo(() => {
    let filtered = animatedPayments;

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
      
      if (searchTerm.length > 2) {
        
      }
    }

    if (filterMethod !== 'ALL') {
      const methodConfig = getPaymentMethodConfig(filterMethod);
      const beforeFilter = filtered.length;
      filtered = filtered.filter(payment => payment.paymentMethod === filterMethod);
      
      
    }

    if (dateFilter !== 'ALL') {
      const now = new Date();
      const filterDate = new Date();
      let dateLabel = '';
      
      switch (dateFilter) {
        case 'TODAY':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(payment => 
            new Date(payment.paymentDate).toDateString() === now.toDateString()
          );
          dateLabel = 'today';
          break;
        case 'WEEK':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(payment => 
            new Date(payment.paymentDate) >= filterDate
          );
          dateLabel = 'this week';
          break;
        case 'MONTH':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(payment => 
            new Date(payment.paymentDate) >= filterDate
          );
          dateLabel = 'this month';
          break;
      }
      
      
    }

    return filtered.sort((a, b) => 
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
  }, [animatedPayments, searchTerm, filterMethod, dateFilter, customerMap, dueMap, getPaymentMethodConfig]);

  // Optimized totals calculation
  const totals = useMemo(() => {
    const total = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const cash = filteredPayments.filter(p => p.paymentMethod === 'cash').reduce((sum, payment) => sum + payment.amount, 0);
    const bank = filteredPayments.filter(p => p.paymentMethod === 'bank_transfer').reduce((sum, payment) => sum + payment.amount, 0);
    const card = filteredPayments.filter(p => p.paymentMethod === 'credit_card').reduce((sum, payment) => sum + payment.amount, 0);
    
    return { total, cash, bank, card };
  }, [filteredPayments]);

  const paymentMethods = ['cash', 'bank_transfer', 'credit_card', 'check', 'other'];

  const getPaymentMethodConfig = useCallback((method: string) => {
    switch (method) {
      case 'cash': return { icon: DollarSign, color: 'success', label: 'Cash', gradient: 'bg-gradient-success' };
      case 'bank_transfer': return { icon: TrendingDown, color: 'accent', label: 'Bank Transfer', gradient: 'bg-gradient-accent' };
      case 'credit_card': return { icon: CreditCard, color: 'primary', label: 'Credit Card', gradient: 'bg-gradient-primary' };
      case 'check': return { icon: FileText, color: 'warning', label: 'Check', gradient: 'bg-gradient-warning' };
      default: return { icon: DollarSign, color: 'neutral', label: 'Other', gradient: 'bg-gradient-secondary' };
    }
  }, []);

  // Performance-optimized export function
  const exportPayments = useCallback(() => {
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

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      
    }
  }, [filteredPayments, customerMap, dueMap]);

  // Section-specific hover handlers
  const handleCardMouseEnter = useCallback((paymentId: string) => {
    setHoveredCard(paymentId);
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    setHoveredCard(null);
  }, []);

  // Enhanced payment operation handlers with messages
  const handleViewPaymentDetails = useCallback((payment: PaymentTransaction) => {
    if (onViewPaymentDetails) {
      onViewPaymentDetails(payment);
      const customer = customerMap.get(payment.customerId);
    }
  }, [onViewPaymentDetails, customerMap]);

  const handleDeletePayment = useCallback((paymentId: string) => {
    if (onDeletePayment) {
      const payment = payments.find(p => p.id === paymentId);
      const customer = payment ? customerMap.get(payment.customerId) : null;
      onDeletePayment(paymentId);
    }
  }, [onDeletePayment, payments, customerMap]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 ${spacing.container}`}>
      {/* Enhanced Header Section - Mobile Design Language */}
      <div className={`${colorSystem.primary.gradient} rounded-2xl ${colorSystem.card.shadow} p-6 mb-10 relative overflow-hidden`}>
        {/* Animated Background Particles - Web Optimized */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-particle absolute top-6 right-6 w-3 h-3 bg-white/30 rounded-full" />
          <div className="floating-particle absolute bottom-8 left-8 w-2 h-2 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          <div className="floating-particle absolute top-12 left-12 w-1 h-1 bg-white/20 rounded-full" style={{ animationDelay: '1s' }} />
          <div className="floating-particle absolute bottom-4 right-12 w-1 h-1 bg-white/25 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>

        {/* Header Content - Fixed for mobile overlap */}
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className={`interactive-element w-10 h-10 sm:w-12 sm:h-12 ${colorSystem.primary.background} rounded-xl flex items-center justify-center border border-white/30 shadow-lg flex-shrink-0`}>
                <DollarSign size={20} className={`${colorSystem.primary.text} sm:text-base`} />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className={`${typography.header} ${colorSystem.primary.text} mb-1 sm:mb-2`}>
                  Payment Management
                </h1>
                <p className={`${typography.subheader} max-w-2xl text-sm sm:text-base`}>
                  Track and manage all payment transactions with real-time insights
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={exportPayments}
                className={`payment-button ${colorSystem.primary.background} ${colorSystem.primary.text} px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-semibold ${colorSystem.primary.hover} backdrop-blur-sm border border-white/30 flex items-center gap-2 sm:gap-3 whitespace-nowrap`}
              >
                <Download size={16} className="sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Export CSV</span>
              </button>
            </div>
          </div>

          {/* Summary Cards - Fixed for mobile overlap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { label: 'Total Payments', value: totals.total, icon: DollarSign, description: 'All transactions' },
              { label: 'Cash Payments', value: totals.cash, icon: DollarSign, description: 'Physical currency' },
              { label: 'Bank Transfers', value: totals.bank, icon: TrendingDown, description: 'Electronic transfers' },
              { label: 'Card Payments', value: totals.card, icon: CreditCard, description: 'Credit/debit cards' }
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={`summary-card ${colorSystem.primary.background} rounded-2xl p-4 sm:p-6 text-center cursor-pointer group`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-center mb-2 sm:mb-3">
                  <stat.icon size={20} className={`${colorSystem.primary.text} group-hover:scale-110 transition-transform duration-300 sm:w-6 sm:h-6`} />
                </div>
                <div className={`${typography.amount} ${colorSystem.primary.text} mb-1 group-hover:scale-105 transition-transform duration-300`}>
                  ${stat.value.toFixed(2)}
                </div>
                <div className={`text-xs sm:text-sm ${colorSystem.primary.text} opacity-80 mb-1`}>
                  {stat.label}
                </div>
                <div className={`text-xs ${colorSystem.primary.text} opacity-60`}>
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Filters Section - Fixed for mobile overlap */}
      <div className={`${colorSystem.card.background} rounded-3xl ${colorSystem.card.border} ${colorSystem.card.shadow} p-4 sm:p-6 mb-6 md:mb-8 lg:mb-10`}>
        <div className="space-y-4 sm:space-y-6">
          {/* Search Input - Full width on mobile */}
          <div className="relative">
            <Search size={18} className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search payments by customer, amount, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="payment-input w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white text-sm sm:text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Payment Method Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Payment Method</label>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <button
                  onClick={() => setFilterMethod('ALL')}
                  className={`filter-button px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold ${
                    filterMethod === 'ALL' 
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Methods
                </button>
                {paymentMethods.map(method => {
                  const config = getPaymentMethodConfig(method);
                  const isActive = filterMethod === method;
                  return (
                    <button
                      key={method}
                      onClick={() => setFilterMethod(method)}
                      className={`filter-button flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold ${
                        isActive 
                          ? `${config.gradient.replace('bg-gradient', 'bg')} text-white shadow-lg transform scale-105` 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <config.icon size={12} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{config.label}</span>
                      <span className="sm:hidden">{config.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Time Period</label>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {[
                  { key: 'ALL', label: 'All Time' },
                  { key: 'TODAY', label: 'Today' },
                  { key: 'WEEK', label: 'This Week' },
                  { key: 'MONTH', label: 'This Month' }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setDateFilter(filter.key)}
                    className={`filter-button px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold ${
                      dateFilter === filter.key 
                        ? 'bg-purple-600 text-white shadow-lg transform scale-105' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Payments Grid - Fixed for mobile overlap */}
      <div className="space-y-4 sm:space-y-6">
        {filteredPayments.length === 0 ? (
          <ModernCard variant="elevated" className="text-center" padding="xl" glow>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 sm:gap-4 py-6 sm:py-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-xl flex items-center justify-center shadow-lg mx-auto sm:mx-0">
                <DollarSign size={20} className="text-gray-400 animate-pulse sm:w-5 sm:h-5" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">No payments found</h3>
                <p className="text-gray-500 text-xs mb-1">No payments match your current filters.</p>
                <div className="text-xs text-gray-400">Try adjusting your search or filter criteria.</div>
              </div>
            </div>
          </ModernCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filteredPayments.map((payment, index) => {
              const customer = customerMap.get(payment.customerId);
              const due = dueMap.get(payment.dueId);
              const methodConfig = getPaymentMethodConfig(payment.paymentMethod);
              const isHovered = hoveredCard === payment.id;
              
              return (
                <div
                  key={payment.id}
                  className={`payment-card ${colorSystem.card.background} ${colorSystem.card.border} rounded-2xl ${colorSystem.card.shadow} overflow-hidden group payment-card-staggered mb-4 sm:mb-6 lg:mb-8 ${
                    isHovered ? 'shadow-xl' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onMouseEnter={() => handleCardMouseEnter(payment.id)}
                  onMouseLeave={handleCardMouseLeave}
                >
                  {/* Enhanced Card Header with Mobile Design Language */}
                  <div className={`${methodConfig.gradient} text-white p-3 sm:p-4 relative overflow-hidden min-h-[80px] sm:min-h-[100px]`}>
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white/40 rounded-full animate-float" />
                      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                    </div>
                    
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="payment-icon w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg flex-shrink-0">
                          <methodConfig.icon size={16} className="text-white sm:w-5 sm:h-5" />
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="text-white font-bold truncate text-sm">
                            {customer?.name || 'Unknown Customer'}
                          </div>
                          <div className="text-white/80 truncate text-xs">
                            {due?.title || 'Unknown Due'}
                          </div>
                        </div>
                      </div>
                      <ModernBadge
                        variant={methodConfig.color as any}
                        gradient
                        size="xs"
                        className="backdrop-blur-sm border border-white/20 flex-shrink-0 flex items-center gap-1 self-start sm:self-center"
                      >
                        <methodConfig.icon size={12} className="text-white sm:w-3 sm:h-3" />
                        <span className="text-xs">{config.label}</span>
                      </ModernBadge>
                    </div>
                  </div>
                  
                  {/* Enhanced Payment Amount Section - Mobile Optimized */}
                  <div className="p-3 sm:p-4 border-b border-gray-100 min-h-[60px] sm:min-h-[80px]">
                    <div className="text-center">
                      <div className={`text-base sm:text-xl font-bold ${colorSystem.text.primary} mb-1 group-hover:scale-105 transition-transform duration-300`}>
                        ${payment.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Payment Details - Mobile Optimized */}
                  {payment.notes ? (
                    <div className="p-3 sm:p-4 border-b border-gray-100 min-h-[50px] sm:min-h-[60px]">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200 h-full">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText size={14} className="text-gray-500 flex-shrink-0" />
                          <div className="text-sm font-semibold text-gray-900">Notes</div>
                        </div>
                        <div className="text-gray-700 text-xs leading-relaxed max-h-12 overflow-hidden">
                          {payment.notes}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 sm:p-4 border-b border-gray-100 min-h-[50px] sm:min-h-[60px]">
                      <div className="h-full flex items-center justify-center">
                        <div className="text-gray-400 text-xs italic">No notes available</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Enhanced Action Buttons - Mobile Optimized */}
                  <div className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      {onViewPaymentDetails && (
                        <button
                          onClick={() => handleViewPaymentDetails(payment)}
                          className="payment-button flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow-md text-xs min-h-[40px]"
                        >
                          <Eye size={14} />
                          <span>View Details</span>
                        </button>
                      )}
                      {onDeletePayment && (
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          className="payment-button flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-all duration-200 shadow-sm hover:shadow-md text-xs min-h-[40px]"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Enhanced Footer */}
      <div className={`${colorSystem.card.background} ${colorSystem.card.border} rounded-3xl ${colorSystem.card.shadow} p-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-gray-600">
            Showing <span className="font-bold text-gray-900">{filteredPayments.length}</span> of 
            <span className="font-bold text-gray-900">{payments.length}</span> payments
          </div>
          <div className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Total: ${totals.total.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSectionWeb;