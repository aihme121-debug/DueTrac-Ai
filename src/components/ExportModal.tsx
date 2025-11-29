import React, { useState } from 'react';
import { Download, Calendar, Filter, FileText, FileJson, FileSpreadsheet, X } from 'lucide-react';
import { Modal } from './ui/modal';
import { Button, Input, Select, Checkbox, DatePicker } from './ui/ui-components';
import { dataExporter, ExportOptions } from '../utils/dataExporter';
import { DueItem, PaymentTransaction, Customer } from '../types';
import { useErrorHandling } from '../hooks/useErrorHandling';
import { useLoading } from '../hooks/useLoading';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dues: DueItem[];
  payments: PaymentTransaction[];
  customers: Customer[];
  onExportComplete?: (result: any) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  dues,
  payments,
  customers,
  onExportComplete
}) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [exportType, setExportType] = useState<'dues' | 'payments' | 'customers' | 'comprehensive'>('comprehensive');
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [includeSummary, setIncludeSummary] = useState(true);
  
  const { showError, showSuccess, showInfo } = useErrorHandling();
  const { isLoading, withLoading } = useLoading();

  const paymentMethods = ['cash', 'bank_transfer', 'credit_card', 'check', 'other'];
  const dueStatuses = ['pending', 'paid', 'overdue', 'partial'];

  const handleExport = async () => {
    if (!fileName.trim()) {
      showError('Please enter a file name');
      return;
    }

    await withLoading(async () => {
      try {
        const options: ExportOptions = {
          format: exportFormat,
          dateRange: dateRange.start && dateRange.end ? {
            start: dateRange.start,
            end: dateRange.end
          } : undefined,
          filters: {
            status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
            customerIds: selectedCustomers.length > 0 ? selectedCustomers : undefined,
            paymentMethods: selectedPaymentMethods.length > 0 ? selectedPaymentMethods : undefined
          }
        };

        let result;
        
        switch (exportType) {
          case 'dues':
            result = await dataExporter.exportDues(dues, customers, options);
            break;
          case 'payments':
            result = await dataExporter.exportPayments(payments, customers, dues, options);
            break;
          case 'customers':
            result = await dataExporter.exportCustomers(customers, options);
            break;
          case 'comprehensive':
            result = await dataExporter.exportComprehensiveReport(dues, payments, customers, options);
            break;
          default:
            throw new Error('Invalid export type');
        }

        // Update filename if custom name is provided
        const finalResult = {
          ...result,
          filename: `${fileName}.${exportFormat}`
        };

        // Download the file
        dataExporter.downloadExport(finalResult);

        showSuccess(`Successfully exported ${finalResult.recordCount} records`);
        onExportComplete?.(finalResult);
        onClose();
        
      } catch (error) {
        showError('Failed to export data', {
          description: error instanceof Error ? error.message : 'Unknown error occurred'
        });
        console.error('Export error:', error);
      }
    });
  };

  const handleSelectAllStatuses = () => {
    if (selectedStatuses.length === dueStatuses.length) {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses([...dueStatuses]);
    }
  };

  const handleSelectAllPaymentMethods = () => {
    if (selectedPaymentMethods.length === paymentMethods.length) {
      setSelectedPaymentMethods([]);
    } else {
      setSelectedPaymentMethods([...paymentMethods]);
    }
  };

  const handleSelectAllCustomers = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c.id));
    }
  };

  const getFormatIcon = () => {
    switch (exportFormat) {
      case 'csv':
        return <FileSpreadsheet className="w-5 h-5" />;
      case 'json':
        return <FileJson className="w-5 h-5" />;
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      default:
        return <Download className="w-5 h-5" />;
    }
  };

  const getEstimatedRecordCount = () => {
    // Simple estimation based on current filters
    let count = 0;
    
    switch (exportType) {
      case 'dues':
        count = dues.length;
        break;
      case 'payments':
        count = payments.length;
        break;
      case 'customers':
        count = customers.length;
        break;
      case 'comprehensive':
        count = dues.length + payments.length + customers.length;
        break;
    }

    // Apply filter estimates
    if (selectedStatuses.length > 0) {
      count = Math.floor(count * (selectedStatuses.length / dueStatuses.length));
    }
    if (selectedCustomers.length > 0) {
      count = Math.floor(count * (selectedCustomers.length / customers.length));
    }
    if (selectedPaymentMethods.length > 0) {
      count = Math.floor(count * (selectedPaymentMethods.length / paymentMethods.length));
    }

    return Math.max(1, count);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Data"
      size="lg"
      className="max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-6 p-6">
        {/* Export Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Export Type</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'comprehensive', label: 'Comprehensive Report', icon: FileText },
              { value: 'dues', label: 'Dues Only', icon: Calendar },
              { value: 'payments', label: 'Payments Only', icon: Download },
              { value: 'customers', label: 'Customers Only', icon: FileText }
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setExportType(value as any)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  exportType === value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 mx-auto mb-1" />
                <div className="text-xs font-medium">{label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Export Format</label>
          <div className="flex gap-2">
            {[
              { value: 'csv', label: 'CSV', icon: FileSpreadsheet },
              { value: 'json', label: 'JSON', icon: FileJson },
              { value: 'pdf', label: 'PDF', icon: FileText }
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setExportFormat(value as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                  exportFormat === value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* File Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">File Name</label>
          <Input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder={`Enter file name (e.g., financial_report)`}
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            File will be saved as: {fileName || 'financial_report'}.{exportFormat}
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Date Range (Optional)</label>
          <div className="flex gap-2">
            <DatePicker
              selected={dateRange.start}
              onChange={(date) => setDateRange(prev => ({ ...prev, start: date || undefined }))}
              placeholderText="Start date"
              className="flex-1"
            />
            <DatePicker
              selected={dateRange.end}
              onChange={(date) => setDateRange(prev => ({ ...prev, end: date || undefined }))}
              placeholderText="End date"
              className="flex-1"
            />
          </div>
        </div>

        {/* Status Filter (for dues) */}
        {exportType === 'dues' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Due Status</label>
              <button
                onClick={handleSelectAllStatuses}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {selectedStatuses.length === dueStatuses.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {dueStatuses.map(status => (
                <label key={status} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedStatuses.includes(status)}
                    onChange={(checked) => {
                      if (checked) {
                        setSelectedStatuses([...selectedStatuses, status]);
                      } else {
                        setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                      }
                    }}
                  />
                  <span className="text-sm capitalize">{status}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Payment Method Filter (for payments) */}
        {exportType === 'payments' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Payment Methods</label>
              <button
                onClick={handleSelectAllPaymentMethods}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {selectedPaymentMethods.length === paymentMethods.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map(method => (
                <label key={method} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedPaymentMethods.includes(method)}
                    onChange={(checked) => {
                      if (checked) {
                        setSelectedPaymentMethods([...selectedPaymentMethods, method]);
                      } else {
                        setSelectedPaymentMethods(selectedPaymentMethods.filter(m => m !== method));
                      }
                    }}
                  />
                  <span className="text-sm capitalize">{method.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Customer Filter */}
        {(exportType === 'dues' || exportType === 'payments') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Customers</label>
              <button
                onClick={handleSelectAllCustomers}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {selectedCustomers.length === customers.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="max-h-32 overflow-y-auto border rounded-lg p-2">
              {customers.map(customer => (
                <label key={customer.id} className="flex items-center gap-2 py-1">
                  <Checkbox
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={(checked) => {
                      if (checked) {
                        setSelectedCustomers([...selectedCustomers, customer.id]);
                      } else {
                        setSelectedCustomers(selectedCustomers.filter(id => id !== customer.id));
                      }
                    }}
                  />
                  <span className="text-sm">{customer.name}</span>
                  <span className="text-xs text-gray-500">({customer.email})</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Estimated records:</span>
            <span className="font-medium">{getEstimatedRecordCount()}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">Format:</span>
            <div className="flex items-center gap-1">
              {getFormatIcon()}
              <span className="font-medium uppercase">{exportFormat}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            className="flex-1"
            disabled={isLoading || !fileName.trim()}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};