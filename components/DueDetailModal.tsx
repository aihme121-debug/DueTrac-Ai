import React, { useMemo, useState } from 'react';
import { X, Calendar, User, Phone, Mail, CheckCircle, AlertCircle, Clock, History, MessageCircle } from 'lucide-react';
import { DueWithCustomer, PaymentStatus } from '../types';
import { ModernButton } from '../utils/uiComponents';

interface DueDetailModalProps {
  due: DueWithCustomer | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkPaid: (id: string) => void;
  onGenerateReminder: (due: DueWithCustomer) => void;
  onAddPayment?: (due: DueWithCustomer) => void;
}

export const DueDetailModal: React.FC<DueDetailModalProps> = ({ due, isOpen, onClose, onMarkPaid, onGenerateReminder, onAddPayment }) => {
  console.log('🎯 DueDetailModal rendered with:', { dueId: due?.id, isOpen, hasDue: !!due });
  const [timelineFilter, setTimelineFilter] = useState<'ALL' | 'PAYMENT' | 'PROMISE'>('ALL');
  
  // Create a combined timeline of events
  const timeline = useMemo(() => {
    if (!due) return [];
    
    const events: { type: 'CREATED' | 'PAYMENT' | 'PROMISE' | 'DUE' | 'PROMISE_BROKEN', date: Date, data: any, id: string }[] = [];

    // Created At
    events.push({ type: 'CREATED', date: new Date(due.createdAt), data: { note: 'Debt entry created' }, id: 'created' });

    // Payment History
    due.paymentHistory?.forEach(p => {
      events.push({ type: 'PAYMENT', date: new Date(p.date), data: p, id: `pay_${p.id}` });
    });

    // Promise History
    due.promiseHistory?.forEach(p => {
      events.push({ type: 'PROMISE', date: new Date(p.createdAt), data: p, id: `prom_make_${p.id}` });
      if (p.status === 'BROKEN') {
        events.push({ type: 'PROMISE_BROKEN', date: new Date(p.promisedDate), data: p, id: `prom_break_${p.id}` });
      }
    });

    // Due Date (If passed and not paid)
    if (new Date(due.dueDate) < new Date() && due.status !== 'PAID') {
        // Only show overdue event if it's actually past due
        events.push({ type: 'DUE', date: new Date(due.dueDate), data: { note: 'Original Due Date Missed' }, id: 'overdue_event' });
    }

    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [due]);

  const filteredTimeline = useMemo(() => {
    if (timelineFilter === 'ALL') return timeline;
    if (timelineFilter === 'PAYMENT') return timeline.filter(e => e.type === 'PAYMENT');
    if (timelineFilter === 'PROMISE') return timeline.filter(e => e.type === 'PROMISE' || e.type === 'PROMISE_BROKEN');
    return timeline;
  }, [timeline, timelineFilter]);

  if (!isOpen || !due) {
    console.log('🚫 DueDetailModal not rendering - isOpen:', isOpen, 'due:', !!due);
    return null;
  }

  const remaining = due.amount - due.paidAmount;
  const progressPercent = Math.min(100, (due.paidAmount / due.amount) * 100);

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID: return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1"><CheckCircle size={12}/> PAID</span>;
      case PaymentStatus.OVERDUE: return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold border border-red-200 flex items-center gap-1"><AlertCircle size={12}/> OVERDUE</span>;
      case PaymentStatus.PARTIAL: return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 flex items-center gap-1"><Clock size={12}/> PARTIAL</span>;
      default: return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 flex items-center gap-1"><Clock size={12}/> PENDING</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-gray-100 p-4 sm:p-6 flex justify-between items-start shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{due.title}</h2>
              {getStatusBadge(due.status)}
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <User size={16} />
              <span className="font-medium truncate">{due.customer?.name}</span>
            </div>
          </div>
          <ModernButton variant="ghost" size="sm" onClick={onClose} className="rounded-full flex-shrink-0 ml-2">
            <X size={20} />
          </ModernButton>
        </div>

        {/* Body - Responsive Layout */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Column: Stats & Info */}
          <div className="w-full lg:w-1/3 bg-white p-6 lg:border-r border-gray-100 overflow-y-auto">
            
            {/* Amount Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-4 text-white shadow-lg mb-6">
               <div className="text-indigo-100 text-sm font-medium mb-2">Total Outstanding</div>
               <div className="text-3xl sm:text-4xl font-bold mb-4">${remaining.toLocaleString()}</div>
               
               <div className="space-y-2">
                 <div className="flex justify-between text-xs text-indigo-100">
                   <span>Paid: ${due.paidAmount.toLocaleString()}</span>
                   <span>Total: ${due.amount.toLocaleString()}</span>
                 </div>
                 <div className="w-full bg-black/20 rounded-full h-2">
                   <div 
                     className="bg-white/90 h-2 rounded-full transition-all duration-500" 
                     style={{ width: `${progressPercent}%` }}
                   ></div>
                 </div>
               </div>
            </div>

            {/* Dates & Contact */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Key Dates</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Next Due Date</div>
                      <div className="font-semibold">{new Date(due.dueDate).toDateString()}</div>
                    </div>
                  </div>
                  {due.lastPaymentAgreedDate && (
                    <div className="flex items-center gap-3 text-gray-700">
                       <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                          <MessageCircle size={16} />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Last Promise</div>
                          <div className="font-semibold">{new Date(due.lastPaymentAgreedDate).toDateString()}</div>
                        </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Customer Details</h3>
                <div className="space-y-3 text-sm">
                   {(due.phoneNumber || due.customer?.phone) && (
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-gray-600">
                         <Phone size={14} /> {due.phoneNumber || due.customer.phone}
                       </div>
                       <button
                         onClick={() => {
                           const phoneNumber = due.phoneNumber || due.customer?.phone;
                           if (phoneNumber) {
                             window.location.href = `tel:${phoneNumber}`;
                           }
                         }}
                         className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs"
                       >
                         📞 Call
                       </button>
                     </div>
                   )}
                   {due.customer?.email && (
                     <div className="flex items-center gap-2 text-gray-600">
                       <Mail size={14} /> {due.customer.email}
                     </div>
                   )}
                   {due.customer?.notes && (
                     <div className="bg-gray-50 p-3 rounded-lg text-gray-600 text-xs italic border border-gray-100">
                        "{due.customer.notes}"
                     </div>
                   )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-4">
                 {due.status !== 'PAID' && (
                    <>
                      {(due.phoneNumber || due.customer?.phone) && (
                        <button 
                          onClick={() => {
                            const phoneNumber = due.phoneNumber || due.customer?.phone;
                            if (phoneNumber) {
                              window.location.href = `tel:${phoneNumber}`;
                            }
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          <Phone size={18} />
                          Call Now
                        </button>
                      )}
                      <button 
                        onClick={() => onAddPayment && onAddPayment(due)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-credit-card">
                          <rect width="20" height="14" x="2" y="5" rx="2"/>
                          <line x1="2" x2="22" y1="10" y2="10"/>
                        </svg>
                        Add Payment
                      </button>
                      <button 
                        onClick={() => onGenerateReminder(due)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <MessageCircle size={18} />
                        Generate Reminder
                      </button>
                      <button 
                        onClick={() => onMarkPaid(due.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <CheckCircle size={18} />
                        Mark as Paid
                      </button>
                    </>
                 )}
              </div>

            </div>
          </div>

          {/* Right Column: Dynamic Timeline */}
          <div className="w-full lg:w-2/3 bg-gray-50/50 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <History size={20} className="text-gray-400" />
                  Activity History
                </h3>
                <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                    {['ALL', 'PAYMENT', 'PROMISE'].map(type => (
                        <button 
                            key={type}
                            onClick={() => setTimelineFilter(type as any)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition ${timelineFilter === type ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {type === 'ALL' ? 'All' : type === 'PAYMENT' ? 'Payments' : 'Promises'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pb-10">
              {filteredTimeline.map((event) => (
                <div key={event.id} className="relative pl-8">
                  {/* Dot Icon */}
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center
                    ${event.type === 'PAYMENT' ? 'bg-green-500' : ''}
                    ${event.type === 'PROMISE' ? 'bg-purple-500' : ''}
                    ${event.type === 'PROMISE_BROKEN' ? 'bg-red-500' : ''}
                    ${event.type === 'DUE' ? 'bg-orange-500' : ''}
                    ${event.type === 'CREATED' ? 'bg-gray-400' : ''}
                  `}></div>

                  {/* Content */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider
                        ${event.type === 'PAYMENT' ? 'text-green-600' : ''}
                        ${event.type === 'PROMISE' ? 'text-purple-600' : ''}
                        ${event.type === 'PROMISE_BROKEN' ? 'text-red-600' : ''}
                        ${event.type === 'DUE' ? 'text-orange-600' : ''}
                        ${event.type === 'CREATED' ? 'text-gray-500' : ''}
                      `}>
                        {event.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-400">{event.date.toLocaleDateString()}</span>
                    </div>

                    <div className="text-gray-800 font-medium">
                      {event.type === 'PAYMENT' && `Received payment of $${event.data.amount}`}
                      {event.type === 'PROMISE' && `Customer promised to pay on ${new Date(event.data.promisedDate).toLocaleDateString()}`}
                      {event.type === 'PROMISE_BROKEN' && `Missed promised payment date: ${new Date(event.data.promisedDate).toLocaleDateString()}`}
                      {event.type === 'DUE' && `Payment was due on this date`}
                      {event.type === 'CREATED' && `Debt record created`}
                    </div>

                    {event.data.note && (
                       <div className="mt-2 text-sm text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 italic">
                         "{event.data.note}"
                       </div>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredTimeline.length === 0 && (
                <div className="pl-8 text-gray-400 italic">No history available for this filter.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
