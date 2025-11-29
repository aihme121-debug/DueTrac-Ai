import React from 'react';
import { AlertTriangle, X, Trash2, Info } from 'lucide-react';
import { ModernCard, ModernButton } from '../utils/uiComponents';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  loading?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Confirmation',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  itemName,
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <ModernCard variant="elevated" className="w-full max-w-lg animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-danger rounded-xl flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">This action is irreversible</p>
            </div>
          </div>
          <ModernButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="rounded-full"
          >
            <X size={20} />
          </ModernButton>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-200">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-danger-600 mt-1 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-gray-700 font-medium">
                  {itemName ? (
                    <>
                      {message} <span className="font-bold text-gray-900">"{itemName}"</span>?
                    </>
                  ) : (
                    <>{message}</>
                  )}
                </p>
                <div className="flex items-center gap-2 text-sm text-danger-700">
                  <Trash2 size={14} />
                  <span>This action will permanently delete the item and cannot be reversed.</span>
                </div>
              </div>
            </div>
          </div>
          
          <ModernCard variant="glass" className="border-l-4 border-warning-500">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <AlertTriangle size={16} className="text-warning-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-warning-800">Backup Recommendation</p>
                <p className="text-xs text-warning-600">Consider exporting your data before deletion</p>
              </div>
            </div>
          </ModernCard>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 bg-gray-50/50 rounded-b-2xl">
          <ModernButton
            variant="ghost"
            size="lg"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </ModernButton>
          <ModernButton
            variant="danger"
            size="lg"
            onClick={onConfirm}
            disabled={loading}
            gradient
            className="flex-1"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 size={18} />
                <span>Delete Permanently</span>
              </div>
            )}
          </ModernButton>
        </div>
      </ModernCard>
    </div>
  );
};

export default DeleteConfirmationModal;