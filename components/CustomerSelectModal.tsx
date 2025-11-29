import React, { useState } from 'react';
import { Customer } from '../types';
import { User, Search, X, Plus } from 'lucide-react';
import { ModernButton } from '../utils/uiComponents';

interface CustomerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
  customers: Customer[];
  title?: string;
  allowCreateNew?: boolean;
  onCreateNew?: () => void;
}

export const CustomerSelectModal: React.FC<CustomerSelectModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  customers,
  title = "Select Customer",
  allowCreateNew = false,
  onCreateNew
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User className="text-indigo-600" size={20} />
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            </div>
            <ModernButton variant="ghost" size="sm" onClick={onClose}>
              <X size={18} />
            </ModernButton>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              autoFocus
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {filteredCustomers.length > 0 ? (
            <div className="space-y-2">
              {filteredCustomers.map(customer => (
                <button
                  key={customer.id}
                  onClick={() => {
                    onSelect(customer);
                    onClose();
                  }}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-300 transition group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 group-hover:text-indigo-600">
                        {customer.name}
                      </div>
                      {customer.email && (
                        <div className="text-sm text-gray-500 mt-1">{customer.email}</div>
                      )}
                      {customer.phone && (
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      )}
                    </div>
                    <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                      <User size={16} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'No customers match your search' : 'No customers found'}
              </p>
              {allowCreateNew && onCreateNew && (
                <ModernButton
                  onClick={() => {
                    onCreateNew();
                    onClose();
                  }}
                  variant="primary"
                  gradient
                  size="md"
                  className="inline-flex items-center gap-2"
                >
                  <Plus size={16} />
                  Create New Customer
                </ModernButton>
              )}
            </div>
          )}
        </div>

        {allowCreateNew && onCreateNew && filteredCustomers.length > 0 && (
          <div className="p-6 border-t border-gray-100">
            <ModernButton
              onClick={() => {
                onCreateNew();
                onClose();
              }}
              variant="secondary"
              size="md"
              className="w-full inline-flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Create New Customer
            </ModernButton>
          </div>
        )}
      </div>
    </div>
  );
};