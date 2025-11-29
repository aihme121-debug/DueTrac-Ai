import React, { useState, useCallback, useMemo } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import { cn } from '../utils/cn';

export interface BulkOperation<T = any> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: (items: T[]) => Promise<void>;
  confirmation?: {
    title: string;
    message: string;
  };
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

export interface BulkOperationsBarProps<T = any> {
  selectedItems: T[];
  operations: BulkOperation<T>[];
  onOperationComplete?: () => void;
  onOperationError?: (error: Error) => void;
  className?: string;
  showCount?: boolean;
}

export function BulkOperationsBar<T>({
  selectedItems,
  operations,
  onOperationComplete,
  onOperationError,
  className = '',
  showCount = true,
}: BulkOperationsBarProps<T>) {
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmOperation, setConfirmOperation] = useState<BulkOperation<T> | null>(null);

  const handleOperation = useCallback(async (operation: BulkOperation<T>) => {
    if (operation.confirmation) {
      setConfirmOperation(operation);
      return;
    }

    setLoading(operation.id);
    try {
      await operation.action(selectedItems);
      onOperationComplete?.();
    } catch (error) {
      onOperationError?.(error as Error);
    } finally {
      setLoading(null);
    }
  }, [selectedItems, onOperationComplete, onOperationError]);

  const handleConfirmOperation = useCallback(async () => {
    if (!confirmOperation) return;

    setLoading(confirmOperation.id);
    setConfirmOperation(null);
    
    try {
      await confirmOperation.action(selectedItems);
      onOperationComplete?.();
    } catch (error) {
      onOperationError?.(error as Error);
    } finally {
      setLoading(null);
    }
  }, [confirmOperation, selectedItems, onOperationComplete, onOperationError]);

  if (selectedItems.length === 0) {
    return null;
  }

  const getButtonVariant = (variant: BulkOperation['variant']) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <>
      <div className={cn(
        'fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-40',
        isMobile ? 'bottom-16' : 'bottom-4',
        className
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showCount && (
              <span className="text-sm font-medium text-gray-900">
                {selectedItems.length} items selected
              </span>
            )}
            
            <div className="flex space-x-2">
              {operations.map((operation) => (
                <button
                  key={operation.id}
                  onClick={() => handleOperation(operation)}
                  disabled={loading === operation.id || operation.disabled}
                  className={cn(
                    'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    getButtonVariant(operation.variant),
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {loading === operation.id ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : operation.icon}
                  {!isMobile && operation.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmOperation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {confirmOperation.confirmation?.title}
            </h3>
            <p className="text-gray-600 mb-6">
              {confirmOperation.confirmation?.message}
            </p>
            
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setConfirmOperation(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOperation}
                disabled={loading === confirmOperation.id}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  getButtonVariant(confirmOperation.variant),
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {loading === confirmOperation.id ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export interface BulkSelectAllProps {
  checked: boolean;
  indeterminate: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function BulkSelectAll({
  checked,
  indeterminate,
  onChange,
  label = 'Select all',
  className = '',
}: BulkSelectAllProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label className={cn('inline-flex items-center cursor-pointer', className)}>
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <span className="ml-2 text-sm text-gray-700">{label}</span>
    </label>
  );
}

export interface BulkActionsDropdownProps<T = any> {
  operations: BulkOperation<T>[];
  selectedItems: T[];
  onOperationComplete?: () => void;
  onOperationError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
}

export function BulkActionsDropdown<T>({
  operations,
  selectedItems,
  onOperationComplete,
  onOperationError,
  disabled = false,
  className = '',
}: BulkActionsDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleOperation = useCallback(async (operation: BulkOperation<T>) => {
    setLoading(operation.id);
    setIsOpen(false);
    
    try {
      await operation.action(selectedItems);
      onOperationComplete?.();
    } catch (error) {
      onOperationError?.(error as Error);
    } finally {
      setLoading(null);
    }
  }, [selectedItems, onOperationComplete, onOperationError]);

  if (selectedItems.length === 0 || operations.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
      >
        Bulk Actions
        <svg className="ml-2 -mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="py-1">
            {operations.map((operation) => (
              <button
                key={operation.id}
                onClick={() => handleOperation(operation)}
                disabled={loading === operation.id || operation.disabled}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
                  'flex items-center space-x-2'
                )}
              >
                {loading === operation.id ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  operation.icon
                )}
                <span>{operation.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}