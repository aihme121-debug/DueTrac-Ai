import React, { useState, useEffect } from 'react';
import { DueWithCustomer, PaymentStatus } from '../types';
import { Calendar, DollarSign, User, AlertCircle, CheckCircle, Clock, Send, Trash2, Edit, FileText, History, Eye, CreditCard, TrendingUp, TrendingDown, MoreVertical, ArrowUpRight, Search } from 'lucide-react';
import { ModernCard, ModernBadge, ModernButton, ModernProgress, ModernInput } from '../utils/uiComponents';
import { animationPresets } from '../utils/animations';
import { VirtualizedList } from '../src/components/VirtualizedList';
import './DueList.css';

interface DueListProps {
  dues: DueWithCustomer[];
  onGenerateReminder: (due: DueWithCustomer) => void;
  onEdit: (due: DueWithCustomer) => void;
  onDelete: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onViewDetails: (due: DueWithCustomer) => void;
  onAddPayment?: (due: DueWithCustomer) => void;
}

export const DueList: React.FC<DueListProps> = ({ dues, onGenerateReminder, onEdit, onDelete, onMarkPaid, onViewDetails, onAddPayment }) => {
  const [filter, setFilter] = useState<'ALL' | 'OVERDUE' | 'PENDING' | 'PAID'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDues = dues.filter(due => {
    // Status filter
    if (filter !== 'ALL' && due.status !== filter) return false;
    
    // Search filter - search by customer name and phone number
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const customerName = due.customer?.name?.toLowerCase() || '';
      const phoneNumber = due.phoneNumber || due.customer?.phone || '';
      
      const matchesName = customerName.includes(searchLower);
      const matchesPhone = phoneNumber.toLowerCase().includes(searchLower);
      
      if (!matchesName && !matchesPhone) return false;
    }
    
    return true;
  });

  // Extract due card rendering logic for virtualization
  const renderDueCard = (due: DueWithCustomer) => {
    const brokenPromise = due.lastPaymentAgreedDate && new Date(due.lastPaymentAgreedDate) < new Date() && due.status !== PaymentStatus.PAID;
    const daysUntilDue = Math.ceil((new Date(due.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const progressPercentage = Math.min((due.paidAmount / due.amount) * 100, 100);
    const statusConfig = getStatusConfig(due.status);
    
    return (
      <div
        key={due.id}
        className="due-card-container bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
      >
        {/* Simplified Card Header */}
        <div className={`p-2 ${getStatusGradient(due.status)} text-white rounded-t-lg`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                <h3 className="text-sm font-bold text-white truncate">
                  {due.title}
                </h3>
                <span className={`px-1.5 py-0.5 rounded-md text-xs font-medium flex items-center gap-1 ${
                  due.status === PaymentStatus.PAID ? 'bg-green-500/90' :
                  due.status === PaymentStatus.OVERDUE ? 'bg-red-500/90' :
                  due.status === PaymentStatus.PARTIAL ? 'bg-purple-500/90' :
                  'bg-yellow-500/90'
                }`}>
                  {statusConfig.icon}
                  <span>{statusConfig.label}</span>
                </span>
                {brokenPromise && (
                  <span className="px-1.5 py-0.5 bg-red-600/90 rounded-md text-xs font-medium flex items-center gap-1">
                    <AlertCircle size={10} />
                    <span>Broken Promise</span>
                  </span>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-1 text-xs text-white/90">
                <div className="flex items-center gap-1">
                  <User size={12} />
                  <span className="truncate">{due.customer?.name || 'Unknown Customer'}</span>
                </div>
                {(due.phoneNumber || due.customer?.phone) && (
                  <div className="flex items-center gap-1">
                    <span>📞</span>
                    <span>{due.phoneNumber || due.customer?.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>
                    {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)}d overdue` : `${daysUntilDue}d remaining`}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-white">
                ${due.amount.toLocaleString()}
              </div>
              {due.paidAmount > 0 && (
                <div className="text-sm text-white/90">
                  Paid: ${due.paidAmount.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Simplified Card Body */}
        <div className="p-2 space-y-2">
          {/* Simplified Progress Bar */}
          {due.paidAmount > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Payment Progress</span>
                <span className="font-semibold">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Simplified Additional Info */}
          <div className="space-y-2">
            {due.lastPaymentDate && (
              <div className="flex items-center gap-2 text-xs">
                <History size={14} className="text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900">Last Payment</div>
                  <div className="text-gray-600">{new Date(due.lastPaymentDate).toLocaleDateString()}</div>
                </div>
              </div>
            )}
            
            {due.lastPaymentAgreedDate && (
              <div className="flex items-center gap-2 text-xs">
                <Calendar size={14} className="text-gray-500" />
                <div>
                  <div className={`font-medium ${brokenPromise ? 'text-red-700' : 'text-gray-900'}`}>
                    {brokenPromise ? 'Broken Promise' : 'Promised Date'}
                  </div>
                  <div className={brokenPromise ? 'text-red-600' : 'text-gray-600'}>
                    {new Date(due.lastPaymentAgreedDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
            
            {due.shortNote && (
              <div className="flex items-start gap-2 text-xs bg-gray-50 rounded-md p-2 border border-gray-200">
                <FileText size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 mb-0.5">Note</div>
                  <span className="text-gray-700 leading-relaxed">{due.shortNote}</span>
                </div>
              </div>
            )}
          </div>

          {/* Simplified Action Buttons */}
          <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onViewDetails(due)}
              className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-all duration-200 text-xs font-medium"
            >
              <Eye size={12} />
              View
            </button>
            
            {due.status !== PaymentStatus.PAID && (
              <div className="flex flex-wrap gap-2">
                {(due.phoneNumber || due.customer?.phone) && (
                  <button
                    onClick={() => {
                      const phoneNumber = due.phoneNumber || due.customer?.phone;
                      if (phoneNumber) {
                        window.location.href = `tel:${phoneNumber}`;
                      }
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-200 text-xs font-medium min-w-[60px] justify-center"
                  >
                    📞
                    Call
                  </button>
                )}
                
                <button
                  onClick={() => onAddPayment && onAddPayment(due)}
                  className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all duration-200 text-xs font-medium min-w-[60px] justify-center"
                >
                  <CreditCard size={12} />
                  Payment
                </button>
                
                <button
                  onClick={() => onGenerateReminder(due)}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 text-xs font-medium min-w-[60px] justify-center"
                >
                  <Send size={12} />
                  Remind
                </button>
                
                <button
                  onClick={() => onMarkPaid(due.id)}
                  className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-all duration-200 text-xs font-medium min-w-[60px] justify-center"
                >
                  <CheckCircle size={12} />
                  Paid
                </button>
              </div>
            )}
            
            <div className="ml-auto flex gap-1">
              <button
                onClick={() => onEdit(due)}
                className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-all duration-200 text-xs font-medium min-w-[50px] justify-center"
              >
                <Edit size={12} />
                Edit
              </button>
              
              <button
                onClick={() => onDelete(due.id)}
                className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-all duration-200 text-xs font-medium min-w-[50px] justify-center"
              >
                <Trash2 size={12} />
                Del
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID: 
        return {
          variant: 'success' as const,
          icon: <CheckCircle size={16} />,
          gradient: true,
          label: 'Paid',
          gradientTone: 'success'
        };
      case PaymentStatus.OVERDUE: 
        return {
          variant: 'danger' as const,
          icon: <AlertCircle size={16} />,
          gradient: true,
          label: 'Overdue',
          gradientTone: 'danger'
        };
      case PaymentStatus.PENDING: 
        return {
          variant: 'warning' as const,
          icon: <Clock size={16} />,
          gradient: true,
          label: 'Pending',
          gradientTone: 'warning'
        };
      case PaymentStatus.PARTIAL: 
        return {
          variant: 'purple' as const,
          icon: <DollarSign size={16} />,
          gradient: true,
          label: 'Partial',
          gradientTone: 'purple'
        };
      default:
        return {
          variant: 'secondary' as const,
          icon: <DollarSign size={16} />,
          gradient: false,
          label: 'Unknown',
          gradientTone: 'secondary'
        };
    }
  };

  const getStatusGradient = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'bg-gradient-to-r from-green-500 via-green-600 to-green-700';
      case PaymentStatus.OVERDUE:
        return 'bg-gradient-to-r from-red-500 via-red-600 to-red-700';
      case PaymentStatus.PENDING:
        return 'bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700';
      case PaymentStatus.PARTIAL:
        return 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700';
      default:
        return 'bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700';
    }
  };

  return (
    <div className="due-list-container">
      {/* Enhanced Header with Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-md">
                <DollarSign size={16} className="text-white" />
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Due Management</h2>
            </div>
            <div className="flex items-center gap-2">
              <ModernInput
                placeholder="Search by customer name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
                icon={<Search size={16} />}
              />
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              {
                label: 'Total Dues',
                value: filteredDues.length,
                color: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700'
              },
              {
                label: 'Overdue',
                value: filteredDues.filter(d => d.status === PaymentStatus.OVERDUE).length,
                color: 'bg-gradient-to-br from-red-500 via-red-600 to-red-700'
              },
              {
                label: 'Pending',
                value: filteredDues.filter(d => d.status === PaymentStatus.PENDING).length,
                color: 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700'
              },
              {
                label: 'Paid',
                value: filteredDues.filter(d => d.status === PaymentStatus.PAID).length,
                color: 'bg-gradient-to-br from-green-500 via-green-600 to-green-700'
              }
            ].map((stat) => (
              <div 
                key={stat.label} 
                className={`${stat.color} rounded-lg p-2 flex flex-col items-center justify-center text-center`}
              >
                <div className="text-lg sm:text-xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-white/70 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Simplified Filter Tabs */}
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-1 justify-center">
            {[
              { key: 'ALL', label: 'All Dues', icon: DollarSign, color: 'primary' },
              { key: 'OVERDUE', label: 'Overdue', icon: AlertCircle, color: 'danger' },
              { key: 'PENDING', label: 'Pending', icon: Clock, color: 'warning' },
              { key: 'PAID', label: 'Paid', icon: CheckCircle, color: 'success' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all duration-200 ${
                  filter === tab.key 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={14} />
                <span className="font-medium text-xs">{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  filter === tab.key ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {dues.filter(d => tab.key === 'ALL' ? true : d.status === tab.key).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Simplified Due Cards List */}
        <div className="p-2 bg-white">
          {filteredDues.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <DollarSign size={24} className="text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No dues found</h3>
              <p className="text-gray-500 text-sm">
                {searchTerm ? `No dues match "${searchTerm}". Try a different search term.` : 'Try selecting a different filter to see more results.'}
              </p>
            </div>
          ) : (
            <div className="pb-2">
              <VirtualizedList
                items={filteredDues}
                itemHeight={220} // Adjusted height to prevent content overlap
                containerHeight={600} // Fixed height for the container
                renderItem={renderDueCard}
                keyExtractor={(due) => due.id}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};