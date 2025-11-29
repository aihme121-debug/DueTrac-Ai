import React, { useState, useEffect } from 'react';
import { Customer, DueItem } from '../types';
import { DollarSign, Calendar, User, X, Plus, Search } from 'lucide-react';
import { ModernButton } from '../utils/uiComponents';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (paymentData: {
    customerId: string;
    dueId: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    notes: string;
  }) => void;
  customers: Customer[];
  dues: DueItem[];
  selectedCustomer?: Customer;
  selectedDue?: DueItem;
  onError?: (title: string, message: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customers,
  dues,
  selectedCustomer,
  selectedDue,
  onError
}) => {
  const [formData, setFormData] = useState({
    customerId: '',
    dueId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    notes: ''
  });

  const [customerSearch, setCustomerSearch] = useState('');
  const [dueSearch, setDueSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showDueDropdown, setShowDueDropdown] = useState(false);

  useEffect(() => {
    if (selectedCustomer) {
      setFormData(prev => ({ ...prev, customerId: selectedCustomer.id }));
    }
    if (selectedDue) {
      setFormData(prev => ({ ...prev, dueId: selectedDue.id, amount: (selectedDue.amount - selectedDue.paidAmount).toString() }));
    }
  }, [selectedCustomer, selectedDue]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredDues = dues.filter(due =>
    (due.customerId === formData.customerId || !formData.customerId) &&
    (due.status === 'PENDING' || due.status === 'PARTIAL') &&
    (due.title.toLowerCase().includes(dueSearch.toLowerCase()) ||
     due.amount.toString().includes(dueSearch))
  );

  const selectedCustomerData = customers.find(c => c.id === formData.customerId);
  const selectedDueData = dues.find(d => d.id === formData.dueId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId || !formData.dueId || !formData.amount) {
      onError?.('Validation Error', 'Please fill in all required fields');
      return;
    }

    const paymentAmount = parseFloat(formData.amount);
    if (selectedDueData && paymentAmount > (selectedDueData.amount - selectedDueData.paidAmount)) {
      onError?.('Validation Error', `Payment amount cannot exceed remaining balance of $${(selectedDueData.amount - selectedDueData.paidAmount).toFixed(2)}`);
      return;
    }

    onSave({
      customerId: formData.customerId,
      dueId: formData.dueId,
      amount: paymentAmount,
      paymentDate: formData.paymentDate,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes
    });

    // Reset form
    setFormData({
      customerId: '',
      dueId: '',
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      notes: ''
    });
    setCustomerSearch('');
    setDueSearch('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="text-indigo-600" size={20} />
              <h2 className="text-xl font-bold text-gray-900">Add Payment</h2>
            </div>
            <ModernButton
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X size={18} />
            </ModernButton>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Customer Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Customer *</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search and select customer..."
                value={selectedCustomerData ? selectedCustomerData.name : customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <User className="absolute right-3 top-2.5 text-gray-400" size={16} />
              
              {showCustomerDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map(customer => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, customerId: customer.id }));
                          setCustomerSearch(customer.name);
                          setShowCustomerDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        {customer.email && (
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500 text-sm">No customers found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Due Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Due Item *</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search and select due..."
                value={selectedDueData ? `${selectedDueData.title} - $${selectedDueData.amount}` : dueSearch}
                onChange={(e) => {
                  setDueSearch(e.target.value);
                  setShowDueDropdown(true);
                }}
                onFocus={() => setShowDueDropdown(true)}
                disabled={!formData.customerId}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                required
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
              
              {showDueDropdown && formData.customerId && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                  {filteredDues.length > 0 ? (
                    filteredDues.map(due => (
                      <button
                        key={due.id}
                        type="button"
                        onClick={() => {
                          const remaining = due.amount - due.paidAmount;
                          setFormData(prev => ({ 
                            ...prev, 
                            dueId: due.id,
                            amount: remaining.toString()
                          }));
                          setDueSearch(`${due.title} - $${due.amount}`);
                          setShowDueDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{due.title}</div>
                        <div className="text-sm text-gray-500">
                          Amount: ${due.amount} | Paid: ${due.paidAmount} | Remaining: ${(due.amount - due.paidAmount).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400">
                          Due: {new Date(due.dueDate).toLocaleDateString()}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500 text-sm">No dues found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Payment Amount */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Payment Amount *</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            {selectedDueData && (
              <p className="text-sm text-gray-500">
                Remaining balance: ${(selectedDueData.amount - selectedDueData.paidAmount).toFixed(2)}
              </p>
            )}
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Payment Date *</label>
            <div className="relative">
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <Calendar className="absolute right-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="check">Check</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              placeholder="Optional payment notes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <ModernButton
              type="button"
              onClick={onClose}
              variant="ghost"
              size="md"
              className="flex-1"
            >
              Cancel
            </ModernButton>
            <ModernButton
              type="submit"
              variant="primary"
              gradient
              size="md"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Add Payment
            </ModernButton>
          </div>
        </form>
      </div>
    </div>
  );
};