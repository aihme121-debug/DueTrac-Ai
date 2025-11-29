import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, FileText, Calendar, DollarSign, User, AlertCircle } from 'lucide-react';
import { ModernButton } from '../utils/uiComponents';
import { GeminiService } from '../services/geminiService';
import { DueItem } from '../types';

interface SmartAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editingDue?: DueItem | null; // If provided, we are in edit mode
}

export const SmartAddModal: React.FC<SmartAddModalProps> = ({ isOpen, onClose, onSave, editingDue }) => {
  const [activeTab, setActiveTab] = useState<'AI' | 'MANUAL'>('AI');
  const [aiInput, setAiInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Manual Form State
  const [formData, setFormData] = useState({
    customerName: '',
    amount: '',
    title: '',
    dueDate: new Date().toISOString().split('T')[0],
    shortNote: '',
    lastPaymentDate: '',
    lastPaymentAgreedDate: '',
    phoneNumber: '',
    address: ''
  });

  // Reset or Populate on Open
  useEffect(() => {
    if (isOpen) {
      if (editingDue) {
        setActiveTab('MANUAL');
        setFormData({
          amount: editingDue.amount.toString(),
          title: editingDue.title,
          dueDate: editingDue.dueDate.split('T')[0],
          shortNote: editingDue.shortNote || '',
          lastPaymentDate: editingDue.lastPaymentDate ? editingDue.lastPaymentDate.split('T')[0] : '',
          lastPaymentAgreedDate: editingDue.lastPaymentAgreedDate ? editingDue.lastPaymentAgreedDate.split('T')[0] : '',
          phoneNumber: editingDue.phoneNumber || '',
          address: editingDue.address || '',
          // Use 'any' to access the hacked property passed from App.tsx
          customerName: (editingDue as any).customerName || ''
        });
      } else {
        setActiveTab('AI');
        setAiInput('');
        setFormData({
          customerName: '',
          amount: '',
          title: '',
          dueDate: new Date().toISOString().split('T')[0],
          shortNote: '',
          lastPaymentDate: '',
          lastPaymentAgreedDate: '',
          phoneNumber: '',
          address: ''
        });
      }
      setError('');
    }
  }, [isOpen, editingDue]);

  // HACK: Use a separate prop for initial customer name if editing
  // or just let the user re-type/see it. 
  // Ideally `editingDue` passed from App is `DueWithCustomer`.
  // Let's assume we handle the data injection in the Parent or explicit `initialData` prop.
  // For this implementation, I will expose a method to update form data from outside or just rely on `editingDue` being `DueWithCustomer`.
  
  const handleAiProcess = async () => {
    if (!aiInput.trim()) return;
    setLoading(true);
    setError('');

    try {
      const result = await GeminiService.parseDueEntry(aiInput);
      if (result) {
        setFormData({
          ...formData,
          customerName: result.customerName || '',
          amount: result.amount?.toString() || '',
          dueDate: result.dueDate || new Date().toISOString().split('T')[0],
          title: result.title || '',
          shortNote: result.shortNote || '',
          lastPaymentAgreedDate: result.lastPaymentAgreedDate || '',
          phoneNumber: result.phoneNumber || '',
          address: result.address || ''
        });
        setActiveTab('MANUAL'); // Switch to manual for review
      } else {
        setError('Could not understand the input. Please try again.');
      }
    } catch (e) {
      setError('AI service unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSave = () => {
    console.log("📝 SmartAddModal: handleManualSave called with form data:", formData);
    if (!formData.customerName || !formData.amount || !formData.title) {
      console.log("❌ SmartAddModal: Missing required fields", { 
        customerName: formData.customerName, 
        amount: formData.amount, 
        title: formData.title 
      });
      setError('Please fill in Name, Amount, and Title.');
      return;
    }
    console.log("✅ SmartAddModal: Form validation passed, calling onSave");
    onSave(formData);
    console.log("✅ SmartAddModal: onSave called, closing modal");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-purple-700 p-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-2">
            {editingDue ? <FileText size={20} /> : <Sparkles size={20} className="text-yellow-300" />}
            <h2 className="font-semibold text-lg text-white drop-shadow-sm">{editingDue ? 'Edit Payment Details' : 'Add New Payment'}</h2>
          </div>
          <ModernButton variant="ghost" size="sm" onClick={onClose} className="rounded-full text-white border-white/30 hover:bg-white/20 hover:text-white">
            <X size={18} />
          </ModernButton>
        </div>

        {/* Tabs */}
        {!editingDue && (
          <div className="flex border-b border-gray-100 shrink-0">
            <button
              onClick={() => setActiveTab('AI')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition ${
                activeTab === 'AI' ? 'text-primary border-b-2 border-primary bg-indigo-50/50' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Sparkles size={16} />
              AI Smart Add
            </button>
            <button
              onClick={() => setActiveTab('MANUAL')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition ${
                activeTab === 'MANUAL' ? 'text-primary border-b-2 border-primary bg-indigo-50/50' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <FileText size={16} />
              Manual Entry
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          
          {activeTab === 'AI' ? (
            <div className="space-y-4">
               <p className="text-gray-600 text-sm">
                Describe the due payment naturally. Include the name, amount, and reason. <br/>
                <span className="italic text-gray-400">"John Doe owes me $50 for the consultation. He said he'd pay last Friday but missed it."</span>
              </p>

              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none h-32"
                placeholder="Type here..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex justify-end pt-2">
                <ModernButton
                  onClick={handleAiProcess}
                  disabled={loading || !aiInput.trim()}
                  variant="primary"
                  gradient
                  size="md"
                  className="flex items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  Process with AI
                </ModernButton>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Primary Info */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                     <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title / Description</label>
                     <div className="relative">
                        <FileText size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 rounded-lg pl-10 p-2 focus:ring-2 focus:ring-primary outline-none"
                          placeholder="e.g. Website Design Invoice"
                          value={formData.title}
                          onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                     </div>
                  </div>
                  
                  <div className="col-span-2">
                     <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Customer Name</label>
                     <div className="relative">
                        <User size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 rounded-lg pl-10 p-2 focus:ring-2 focus:ring-primary outline-none"
                          placeholder="e.g. Acme Corp"
                          value={formData.customerName}
                          onChange={e => setFormData({...formData, customerName: e.target.value})}
                        />
                     </div>
                  </div>

                  <div className="col-span-2">
                     <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Phone Number</label>
                     <div className="relative">
                        <input 
                          type="tel" 
                          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                          placeholder="e.g. +1 (555) 123-4567"
                          value={formData.phoneNumber}
                          onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                        />
                     </div>
                  </div>

                  <div className="col-span-2">
                     <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Address</label>
                     <div className="relative">
                        <input 
                          type="text" 
                          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                          placeholder="e.g. 123 Main St, City, State 12345"
                          value={formData.address}
                          onChange={e => setFormData({...formData, address: e.target.value})}
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Amount ($)</label>
                     <div className="relative">
                        <DollarSign size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input 
                          type="number" 
                          className="w-full border border-gray-300 rounded-lg pl-10 p-2 focus:ring-2 focus:ring-primary outline-none"
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={e => setFormData({...formData, amount: e.target.value})}
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Next Due Date</label>
                     <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input 
                          type="date" 
                          className="w-full border border-gray-300 rounded-lg pl-10 p-2 focus:ring-2 focus:ring-primary outline-none"
                          value={formData.dueDate}
                          onChange={e => setFormData({...formData, dueDate: e.target.value})}
                        />
                     </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 my-4"></div>

              {/* Extra Tracking Info */}
              <div className="space-y-3">
                 <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                   <AlertCircle size={14} className="text-gray-400" />
                   Additional Tracking Details
                 </h3>

                 <div className="grid grid-cols-2 gap-3">
                    <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">Last Payment Received</label>
                       <input 
                          type="date" 
                          className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                          value={formData.lastPaymentDate}
                          onChange={e => setFormData({...formData, lastPaymentDate: e.target.value})}
                        />
                    </div>
                    <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">Last Agreed Date</label>
                       <input 
                          type="date" 
                          className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                          title="The date they promised to pay but might have missed"
                          value={formData.lastPaymentAgreedDate}
                          onChange={e => setFormData({...formData, lastPaymentAgreedDate: e.target.value})}
                        />
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Short Note</label>
                    <textarea 
                      className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none h-20"
                      placeholder="e.g. Customer promised to clear by end of month..."
                      value={formData.shortNote}
                      onChange={e => setFormData({...formData, shortNote: e.target.value})}
                    />
                 </div>
              </div>

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

              <div className="pt-4 flex justify-end gap-3">
                <ModernButton
                  onClick={onClose}
                  variant="ghost"
                  size="md"
                >
                  Cancel
                </ModernButton>
                <ModernButton
                  onClick={handleManualSave}
                  variant="primary"
                  gradient
                  size="md"
                  className="flex items-center gap-2"
                >
                  Save Due
                </ModernButton>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};