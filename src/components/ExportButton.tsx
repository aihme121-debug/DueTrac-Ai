import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileJson, ChevronDown } from 'lucide-react';
import { exportUtils, ExportOptions } from '../utils/exportUtils';

interface ExportButtonProps {
  dataType: 'payments' | 'dues' | 'customers' | 'all';
  data: any[];
  filename?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

interface ExportFormat {
  key: 'csv' | 'json' | 'pdf';
  label: string;
  icon: React.ReactNode;
  description: string;
}

const exportFormats: ExportFormat[] = [
  {
    key: 'csv',
    label: 'CSV',
    icon: <FileSpreadsheet className="w-4 h-4" />,
    description: 'Export as spreadsheet'
  },
  {
    key: 'json',
    label: 'JSON',
    icon: <FileJson className="w-4 h-4" />,
    description: 'Export as JSON data'
  },
  {
    key: 'pdf',
    label: 'PDF',
    icon: <FileText className="w-4 h-4" />,
    description: 'Export as printable PDF'
  }
];

const ExportButton: React.FC<ExportButtonProps> = ({
  dataType,
  data,
  filename,
  className = '',
  variant = 'primary',
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'pdf'>('csv');

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    if (!data || data.length === 0) {
      alert('No data available for export');
      return;
    }

    setIsExporting(true);
    setIsOpen(false);

    try {
      const options: ExportOptions = {
        format,
        filename
      };

      switch (dataType) {
        case 'payments':
          exportUtils.exportPayments(data, options);
          break;
        case 'dues':
          exportUtils.exportDues(data, options);
          break;
        case 'customers':
          exportUtils.exportCustomers(data, options);
          break;
        case 'all':
          // For 'all' data type, we need to separate the data
          // This assumes the data is structured with a type field
          const payments = data.filter(item => item.type === 'payment');
          const dues = data.filter(item => item.type === 'due');
          const customers = data.filter(item => item.type === 'customer');
          exportUtils.exportAllData(payments, dues, customers, format);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  };

  const getDropdownClasses = () => {
    return `absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${isOpen ? 'block' : 'hidden'}`;
  };

  return (
    <div className="relative inline-block text-left">
      <div className="flex rounded-md shadow-sm">
        <button
          onClick={() => handleExport(selectedFormat)}
          disabled={isExporting || !data || data.length === 0}
          className={getButtonClasses()}
        >
          <Download className={`w-4 h-4 mr-2 ${isExporting ? 'animate-bounce' : ''}`} />
          {isExporting ? 'Exporting...' : 'Export'}
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isExporting || !data || data.length === 0}
          className={`${getButtonClasses()} ml-0 rounded-l-none border-l border-white border-opacity-20`}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <div className={getDropdownClasses()}>
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Export Format
            </div>
            {exportFormats.map((format) => (
              <button
                key={format.key}
                onClick={() => {
                  setSelectedFormat(format.key);
                  handleExport(format.key);
                }}
                className="w-full text-left flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center flex-1">
                  {format.icon}
                  <div className="ml-3">
                    <div className="font-medium">{format.label}</div>
                    <div className="text-xs text-gray-500">{format.description}</div>
                  </div>
                </div>
                {selectedFormat === format.key && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
          
          <div className="border-t border-gray-200">
            <div className="px-3 py-2 text-xs text-gray-500">
              {data?.length || 0} records will be exported
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ExportButton;