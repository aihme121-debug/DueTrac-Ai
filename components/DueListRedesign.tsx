import React, { useState, useEffect, useMemo } from 'react';
import { DueWithCustomer, PaymentStatus } from '../types';
import { 
  Calendar, DollarSign, User, AlertCircle, CheckCircle, Clock, Send, Trash2, Edit, 
  FileText, History, Eye, CreditCard, Search, Phone, Mail, Check, Plus, Filter, TrendingUp,
  MoreVertical, ChevronRight, Activity, Zap, Target, MapPin
} from 'lucide-react';
import { VirtualizedList } from '../src/components/VirtualizedList';
import './DueListRedesign.css';

interface DueListRedesignProps {
  dues: DueWithCustomer[];
  onGenerateReminder: (due: DueWithCustomer) => void;
  onEdit: (due: DueWithCustomer) => void;
  onDelete: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onViewDetails: (due: DueWithCustomer) => void;
  onAddPayment?: (due: DueWithCustomer) => void;
}

// Modern color system with gradients
const colorSystem = {
  primary: {
    gradient: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700',
    hover: 'hover:from-blue-600 hover:via-blue-700 hover:to-blue-800',
    text: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  success: {
    gradient: 'bg-gradient-to-br from-green-500 via-green-600 to-green-700',
    hover: 'hover:from-green-600 hover:via-green-700 hover:to-green-800',
    text: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200'
  },
  warning: {
    gradient: 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700',
    hover: 'hover:from-yellow-600 hover:via-yellow-700 hover:to-yellow-800',
    text: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200'
  },
  danger: {
    gradient: 'bg-gradient-to-br from-red-500 via-red-600 to-red-700',
    hover: 'hover:from-red-600 hover:via-red-700 hover:to-red-800',
    text: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200'
  },
  purple: {
    gradient: 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700',
    hover: 'hover:from-purple-600 hover:via-purple-700 hover:to-purple-800',
    text: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200'
  }
};

// Animation variants
const animations = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: "easeOut" }
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export const DueListRedesign: React.FC<DueListRedesignProps> = ({
  dues,
  onGenerateReminder,
  onEdit,
  onDelete,
  onMarkPaid,
  onViewDetails,
  onAddPayment
}) => {
  const [filter, setFilter] = useState<'ALL' | 'OVERDUE' | 'PENDING' | 'PAID'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDue, setSelectedDue] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleCardExpansion = (dueId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dueId)) {
        newSet.delete(dueId);
      } else {
        newSet.add(dueId);
      }
      return newSet;
    });
  };

  const filteredDues = useMemo(() => {
    return dues.filter(due => {
      // Status filter
      if (filter !== 'ALL' && due.status !== filter) return false;
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const customerName = due.customer?.name?.toLowerCase() || '';
        const phoneNumber = due.phoneNumber || due.customer?.phone || '';
        const title = due.title?.toLowerCase() || '';
        
        return customerName.includes(searchLower) || 
               phoneNumber.includes(searchLower) || 
               title.includes(searchLower);
      }
      
      return true;
    });
  }, [dues, filter, searchTerm]);

  const stats = useMemo(() => {
    const total = filteredDues.length;
    const overdue = filteredDues.filter(d => d.status === PaymentStatus.OVERDUE).length;
    const pending = filteredDues.filter(d => d.status === PaymentStatus.PENDING).length;
    const paid = filteredDues.filter(d => d.status === PaymentStatus.PAID).length;
    const partial = filteredDues.filter(d => d.status === PaymentStatus.PARTIAL).length;
    
    return { total, overdue, pending, paid, partial };
  }, [filteredDues]);

  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return { 
          ...colorSystem.success, 
          icon: <CheckCircle size={16} />, 
          label: 'Paid',
          badge: 'bg-green-100 text-green-800 border-green-200'
        };
      case PaymentStatus.OVERDUE:
        return { 
          ...colorSystem.danger, 
          icon: <AlertCircle size={16} />, 
          label: 'Overdue',
          badge: 'bg-red-100 text-red-800 border-red-200'
        };
      case PaymentStatus.PENDING:
        return { 
          ...colorSystem.warning, 
          icon: <Clock size={16} />, 
          label: 'Pending',
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case PaymentStatus.PARTIAL:
        return { 
          ...colorSystem.purple, 
          icon: <TrendingUp size={16} />, 
          label: 'Partial',
          badge: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      default:
        return { 
          ...colorSystem.primary, 
          icon: <DollarSign size={16} />, 
          label: 'Unknown',
          badge: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const getStatusGradient = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'bg-gradient-to-br from-green-500 via-green-600 to-emerald-700';
      case PaymentStatus.OVERDUE:
        return 'bg-gradient-to-br from-red-500 via-red-600 to-rose-700';
      case PaymentStatus.PENDING:
        return 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-700';
      case PaymentStatus.PARTIAL:
        return 'bg-gradient-to-br from-purple-500 via-purple-600 to-violet-700';
      default:
        return 'bg-gradient-to-br from-gray-500 via-gray-600 to-slate-700';
    }
  };

  const renderDueCard = (due: DueWithCustomer, index: number) => {
    const brokenPromise = due.lastPaymentAgreedDate && new Date(due.lastPaymentAgreedDate) < new Date() && due.status !== PaymentStatus.PAID;
    const daysUntilDue = Math.ceil((new Date(due.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const progressPercentage = Math.min((due.paidAmount / due.amount) * 100, 100);
    const statusConfig = getStatusConfig(due.status);
    const isExpanded = expandedCards.has(due.id);
    
    return (
      <div
        key={due.id}
        className="due-card group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
        style={{
          animationDelay: `${index * 0.1}s`,
          animation: isLoaded ? 'slideInUp 0.6s ease-out forwards' : 'none'
        }}
      >
        <div className={`absolute inset-0 rounded-2xl opacity-5 group-hover:opacity-10 transition-opacity duration-300 ${statusConfig.gradient} pointer-events-none`} />
        <div className={`absolute top-0 right-0 w-24 h-24 ${statusConfig.gradient} rounded-bl-3xl transform rotate-45 translate-x-8 -translate-y-8 pointer-events-none`}>
          <div className="absolute bottom-4 left-4 transform -rotate-45">{statusConfig.icon}</div>
        </div>
        <div
          className={`relative overflow-hidden rounded-t-2xl ${getStatusGradient(due.status)} p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:brightness-110`}
          onClick={() => toggleCardExpansion(due.id)}
        >
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          )}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-4 right-4 w-2 h-2 bg-white/40 rounded-full animate-pulse" />
            <div className="absolute bottom-6 left-6 w-1 h-1 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-8 left-12 w-1 h-1 bg-white/25 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {/* Title - Hidden on mobile */}
                <h3 className="hidden sm:block text-lg sm:text-xl font-bold text-white drop-shadow-lg">{due.title}</h3>
                {/* Customer Name - Shown on mobile in title position */}
                <div className="block sm:hidden text-lg font-bold text-white drop-shadow-lg">
                  {due.customer?.name || 'Unknown Customer'}
                </div>
                <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${statusConfig.badge}`}>{statusConfig.label}</span>
                {brokenPromise && (
                  <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-red-600/90 backdrop-blur-sm rounded-full text-xs font-semibold flex items-center gap-1 animate-pulse">
                    <AlertCircle size={10} className="sm:hidden" />
                    <AlertCircle size={12} className="hidden sm:block" />
                    <span className="hidden sm:inline">Broken Promise</span>
                  </span>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'group-hover:translate-x-1'}`}>
                    <ChevronRight size={20} className="text-white/80" />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-white/90">
                {/* Customer name - Hidden on mobile (moved to title position) */}
                <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm rounded-md sm:rounded-lg px-2 sm:px-3 py-1">
                  <User size={12} className="sm:hidden" />
                  <User size={14} className="hidden sm:block" />
                  <span className="font-medium truncate max-w-[100px] sm:max-w-none">{due.customer?.name || 'Unknown Customer'}</span>
                </div>
                {/* Amount - Shown on mobile in customer name position */}
                <div className="block sm:hidden flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-md px-2 py-1">
                  <DollarSign size={12} />
                  <span className="font-medium">${due.amount.toLocaleString()}</span>
                </div>
                {(due.phoneNumber || due.customer?.phone) && (
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm rounded-md sm:rounded-lg px-2 sm:px-3 py-1">
                    <Phone size={12} className="sm:hidden" />
                    <Phone size={14} className="hidden sm:block" />
                    <span className="truncate max-w-[80px] sm:max-w-none">{due.phoneNumber || due.customer?.phone}</span>
                  </div>
                )}
                <div className={`flex items-center gap-1.5 sm:gap-2 rounded-md sm:rounded-lg px-2 sm:px-3 py-1 ${daysUntilDue < 0 ? 'bg-red-500/20 backdrop-blur-sm' : 'bg-white/10 backdrop-blur-sm'}`}>
                  <Calendar size={12} className="sm:hidden" />
                  <Calendar size={14} className="hidden sm:block" />
                  <span className="font-medium">{daysUntilDue < 0 ? `${Math.abs(daysUntilDue)}d overdue` : `${daysUntilDue}d remaining`}</span>
                </div>
              </div>
            </div>
            {/* Amount section - Hidden on mobile (moved to customer name line) */}
            <div className="hidden sm:block text-right bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">${due.amount.toLocaleString()}</div>
              {due.paidAmount > 0 && <div className="text-xs sm:text-sm text-white/80 mt-1">Paid: ${due.paidAmount.toLocaleString()}</div>}
            </div>
          </div>
        </div>
        <div className={`transition-all duration-700 ease-out overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100 transform translate-y-0' : 'max-h-0 opacity-0 transform -translate-y-4'}`}>
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {due.paidAmount > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Payment Progress</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">{Math.round(progressPercentage)}%</span>
                    <div className={`w-3 h-3 rounded-full ${statusConfig.bg} border-2 ${statusConfig.border}`} />
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className={`h-3 rounded-full transition-all duration-1000 ease-out ${statusConfig.gradient}`} style={{ width: `${progressPercentage}%` }} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer pointer-events-none" />
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {due.lastPaymentDate && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                  <div className={`w-10 h-10 ${colorSystem.success.bg} rounded-lg flex items-center justify-center`}>
                    <History size={18} className={colorSystem.success.text} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700">Last Payment</div>
                    <div className="text-gray-600 font-medium">{new Date(due.lastPaymentDate).toLocaleDateString()}</div>
                  </div>
                </div>
              )}
              {due.lastPaymentAgreedDate && (
                <div className={`flex items-center gap-4 p-4 rounded-xl border transition-colors duration-200 ${brokenPromise ? 'bg-red-50 border-red-200 hover:bg-red-100' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                  <div className={`w-10 h-10 ${brokenPromise ? colorSystem.danger.bg : 'bg-blue-50'} rounded-lg flex items-center justify-center`}>
                    <Calendar size={18} className={brokenPromise ? colorSystem.danger.text : 'text-blue-600'} />
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${brokenPromise ? 'text-red-700' : 'text-gray-700'}`}>{brokenPromise ? 'Broken Promise' : 'Promised Date'}</div>
                    <div className={`font-medium ${brokenPromise ? 'text-red-600' : 'text-gray-600'}`}>{new Date(due.lastPaymentAgreedDate).toLocaleDateString()}</div>
                  </div>
                </div>
              )}
            </div>
            {due.shortNote && (
              <div className="p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Note</div>
                    <p className="text-gray-700 leading-relaxed">{due.shortNote}</p>
                  </div>
                </div>
              </div>
            )}
            {/* Title and Address Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Due Title */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-blue-700">Due Title</div>
                  <div className="text-gray-800 font-medium">{due.title}</div>
                </div>
              </div>
              {/* Customer Address */}
              {(due.address || due.customer?.address) && (
                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-green-700">Customer Address</div>
                    <div className="text-gray-800 font-medium leading-relaxed">{due.address || due.customer?.address}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={`p-3 sm:p-4 pt-0 relative z-20 transition-all duration-700 ease-out ${isExpanded ? 'max-h-[500px] opacity-100 transform translate-y-0' : 'max-h-0 opacity-0 transform translate-y-4 overflow-hidden'}`}>
          <div className={`flex flex-col sm:flex-row gap-2 sm:gap-3 transition-all duration-500 ${isExpanded ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: isExpanded ? '200ms' : '0ms' }}>
            <div className="flex flex-wrap gap-2 flex-1 min-w-[200px]">
              <button onClick={() => onViewDetails(due)} className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200 text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md">
                <Eye size={14} className="sm:hidden" />
                <Eye size={16} className="hidden sm:block" />
                <span className="hidden sm:inline">View Details</span>
                <span className="sm:hidden">Details</span>
              </button>
              {due.status !== PaymentStatus.PAID && (
                <>
                  {(due.phoneNumber || due.customer?.phone) && (
                    <button onClick={() => {
                      const phoneNumber = due.phoneNumber || due.customer?.phone;
                      if (phoneNumber) window.location.href = `tel:${phoneNumber}`;
                    }} className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md">
                      <Phone size={14} className="sm:hidden" />
                      <Phone size={16} className="hidden sm:block" />
                      <span className="hidden sm:inline">Call</span>
                      <span className="sm:hidden">Call</span>
                    </button>
                  )}
                  <button onClick={() => onAddPayment && onAddPayment(due)} className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md">
                    <CreditCard size={14} className="sm:hidden" />
                    <CreditCard size={16} className="hidden sm:block" />
                    <span className="hidden sm:inline">Add Payment</span>
                    <span className="sm:hidden">Pay</span>
                  </button>
                  <button onClick={() => onGenerateReminder(due)} className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md">
                    <Mail size={14} className="sm:hidden" />
                    <Mail size={16} className="hidden sm:block" />
                    <span className="hidden sm:inline">Remind</span>
                    <span className="sm:hidden">Remind</span>
                  </button>
                  <button onClick={() => onMarkPaid(due.id)} className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-100 to-green-100 text-green-700 rounded-lg hover:from-emerald-200 hover:to-green-200 transition-all duration-200 text-xs sm:text-sm font-semibold border border-green-200">
                    <Check size={14} className="sm:hidden" />
                    <Check size={16} className="hidden sm:block" />
                    <span className="hidden sm:inline">Mark Paid</span>
                    <span className="sm:hidden">Paid</span>
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-2 sm:flex-col min-w-[80px]">
              <button onClick={() => onEdit(due)} className="flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-200 text-xs sm:text-sm font-medium">
                <Edit size={12} className="sm:hidden" />
                <Edit size={14} className="hidden sm:block" />
                <span className="hidden sm:inline">Edit</span>
                <span className="sm:hidden">Edit</span>
              </button>
              <button onClick={() => onDelete(due.id)} className="flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-3 py-2 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-lg hover:from-red-100 hover:to-red-200 transition-all duration-200 text-xs sm:text-sm font-medium">
                <Trash2 size={12} className="sm:hidden" />
                <Trash2 size={14} className="hidden sm:block" />
                <span className="hidden sm:inline">Delete</span>
                <span className="sm:hidden">Del</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="mb-4 sm:mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-8 mx-2 sm:mx-4 mt-2 sm:mt-4">
            {/* Title Section */}
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg sm:shadow-xl">
                <DollarSign size={24} className="sm:hidden text-white drop-shadow-lg" />
                <DollarSign size={32} className="hidden sm:block text-white drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Due Management
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-0.5 sm:mt-1">Track and manage all your financial obligations</p>
              </div>
            </div>

            {/* Stats Cards - Hidden on mobile for All Dues */}
            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 ${filter === 'ALL' ? 'hidden sm:grid' : 'grid'}`}>
              {[
                { 
                  label: 'Total Dues', 
                  value: stats.total, 
                  icon: Target, 
                  color: colorSystem.primary,
                  trend: '+12%'
                },
                { 
                  label: 'Overdue', 
                  value: stats.overdue, 
                  icon: AlertCircle, 
                  color: colorSystem.danger,
                  trend: '-5%'
                },
                { 
                  label: 'Pending', 
                  value: stats.pending, 
                  icon: Clock, 
                  color: colorSystem.warning,
                  trend: '+8%'
                },
                { 
                  label: 'Partial', 
                  value: stats.partial, 
                  icon: TrendingUp, 
                  color: colorSystem.purple,
                  trend: '+15%'
                },
                { 
                  label: 'Paid', 
                  value: stats.paid, 
                  icon: CheckCircle, 
                  color: colorSystem.success,
                  trend: '+20%'
                }
              ].map((stat, index) => (
                <div 
                  key={stat.label}
                  className={`${stat.color.gradient} ${stat.color.hover} rounded-xl sm:rounded-2xl p-3 sm:p-6 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer group`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-1 sm:mb-3">
                    <div className={`w-6 h-6 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center`}>
                      <stat.icon size={14} className="sm:hidden" />
                      <stat.icon size={20} className="hidden sm:block" />
                    </div>
                    <span className="text-xs font-semibold bg-white/20 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                      {stat.trend}
                    </span>
                  </div>
                  <div className="text-xl sm:text-3xl font-bold mb-0.5 sm:mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="space-y-4 mb-4">
            {/* Search Section - Moved to top of filters */}
            <div className="relative px-2 sm:px-4 mt-4 sm:mt-6">
              <div className="absolute inset-y-0 left-0 pl-5 sm:pl-6 flex items-center pointer-events-none">
                <Search size={16} className="sm:hidden text-gray-400" />
                <Search size={20} className="hidden sm:block text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, phone, or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 sm:pl-14 pr-4 py-2.5 sm:py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
            </div>
            
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center px-2 sm:px-4">
            {[
              { key: 'ALL', label: 'All Dues', icon: DollarSign, count: stats.total },
              { key: 'OVERDUE', label: 'Overdue', icon: AlertCircle, count: stats.overdue },
              { key: 'PENDING', label: 'Pending', icon: Clock, count: stats.pending },
              { key: 'PAID', label: 'Paid', icon: CheckCircle, count: stats.paid }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`flex items-center gap-1.5 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  filter === tab.key 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg sm:shadow-xl' 
                    : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white/90 shadow-md sm:shadow-lg'
                }`}
              >
                <tab.icon size={14} className="sm:hidden" />
                <tab.icon size={18} className="hidden sm:block" />
                <span className="font-semibold text-xs sm:text-sm">{tab.label}</span>
                <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-bold ${
                  filter === tab.key ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
        </div>

        {/* Due Cards Grid - Scrollable Container */}
        <div className="px-4 pb-8">
          <div className="max-h-[60vh] sm:max-h-[65vh] lg:max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 pr-2 sm:pr-3">
            {filteredDues.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <DollarSign size={32} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No dues found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {searchTerm ? `No dues match "${searchTerm}". Try a different search term.` : 'Try selecting a different filter to see more results.'}
                </p>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto mr-1 sm:mr-2 scrollbar-content">
                <VirtualizedList
                  items={filteredDues}
                  itemHeight={420} // Adjusted for new card design
                  containerHeight={800}
                  renderItem={renderDueCard}
                  keyExtractor={(due) => due.id}
                />
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Button */}
        <button 
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 group"
          aria-label="Add new due"
        >
          <Plus size={24} className="text-white" />
          <div className="absolute -top-12 right-0 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Add New Due
          </div>
        </button>
      </div>
    </div>
  );
}

export default DueListRedesign;