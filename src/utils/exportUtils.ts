import { format } from 'date-fns';

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  filename?: string;
  includeHeaders?: boolean;
}

export interface PaymentExportData {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  date: Date;
  notes?: string;
  status: string;
}

export interface DueExportData {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  dueDate: Date;
  status: string;
  description?: string;
  createdAt: Date;
}

export interface CustomerExportData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  totalDues: number;
  totalPayments: number;
  status: string;
  createdAt: Date;
}

class ExportUtils {
  private static instance: ExportUtils;

  static getInstance(): ExportUtils {
    if (!this.instance) {
      this.instance = new ExportUtils();
    }
    return this.instance;
  }

  // CSV Export Methods
  exportToCSV(data: any[], filename: string = 'export.csv'): void {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const csvContent = this.convertToCSV(data);
    this.downloadFile(csvContent, filename, 'text/csv');
  }

  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        
        // Handle dates
        if (value instanceof Date) {
          return `"${format(value, 'yyyy-MM-dd HH:mm:ss')}"`;
        }
        
        // Handle strings with commas or quotes
        if (typeof value === 'string') {
          if (value.includes(',') || value.includes('"')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
        }
        
        return value;
      }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  }

  // JSON Export Methods
  exportToJSON(data: any[], filename: string = 'export.json'): void {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, filename, 'application/json');
  }

  // Payment Data Export
  exportPayments(payments: PaymentExportData[], options: ExportOptions): void {
    const { format, filename } = options;
    const defaultFilename = `payments_${format(new Date(), 'yyyy-MM-dd')}.${format}`;
    
    const exportData = payments.map(payment => ({
      'Payment ID': payment.id,
      'Customer Name': payment.customerName,
      'Amount': payment.amount,
      'Payment Method': payment.paymentMethod,
      'Date': format(payment.date, 'yyyy-MM-dd HH:mm:ss'),
      'Status': payment.status,
      'Notes': payment.notes || ''
    }));

    switch (format) {
      case 'csv':
        this.exportToCSV(exportData, filename || defaultFilename);
        break;
      case 'json':
        this.exportToJSON(exportData, filename || defaultFilename);
        break;
      case 'pdf':
        this.exportToPDF(exportData, 'Payments Report', filename || defaultFilename);
        break;
    }
  }

  // Due Data Export
  exportDues(dues: DueExportData[], options: ExportOptions): void {
    const { format, filename } = options;
    const defaultFilename = `dues_${format(new Date(), 'yyyy-MM-dd')}.${format}`;
    
    const exportData = dues.map(due => ({
      'Due ID': due.id,
      'Customer Name': due.customerName,
      'Amount': due.amount,
      'Due Date': format(due.dueDate, 'yyyy-MM-dd'),
      'Status': due.status,
      'Description': due.description || '',
      'Created Date': format(due.createdAt, 'yyyy-MM-dd HH:mm:ss')
    }));

    switch (format) {
      case 'csv':
        this.exportToCSV(exportData, filename || defaultFilename);
        break;
      case 'json':
        this.exportToJSON(exportData, filename || defaultFilename);
        break;
      case 'pdf':
        this.exportToPDF(exportData, 'Dues Report', filename || defaultFilename);
        break;
    }
  }

  // Customer Data Export
  exportCustomers(customers: CustomerExportData[], options: ExportOptions): void {
    const { format, filename } = options;
    const defaultFilename = `customers_${format(new Date(), 'yyyy-MM-dd')}.${format}`;
    
    const exportData = customers.map(customer => ({
      'Customer ID': customer.id,
      'Name': customer.name,
      'Email': customer.email,
      'Phone': customer.phone,
      'Address': customer.address || '',
      'Total Dues': customer.totalDues,
      'Total Payments': customer.totalPayments,
      'Status': customer.status,
      'Created Date': format(customer.createdAt, 'yyyy-MM-dd HH:mm:ss')
    }));

    switch (format) {
      case 'csv':
        this.exportToCSV(exportData, filename || defaultFilename);
        break;
      case 'json':
        this.exportToJSON(exportData, filename || defaultFilename);
        break;
      case 'pdf':
        this.exportToPDF(exportData, 'Customers Report', filename || defaultFilename);
        break;
    }
  }

  // PDF Export (Basic HTML-based PDF generation)
  private exportToPDF(data: any[], title: string, filename: string): void {
    // Create HTML table for PDF generation
    const htmlContent = this.generatePDFHTML(data, title);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      throw new Error('Failed to open print window');
    }
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
      // Close the window after printing
      setTimeout(() => {
        if (!printWindow.closed) {
          printWindow.close();
        }
      }, 1000);
    }, 250);
  }

  private generatePDFHTML(data: any[], title: string): string {
    const headers = Object.keys(data[0]);
    
    const tableHeaders = headers.map(header => 
      `<th class="border px-4 py-2 bg-gray-100 font-semibold">${header}</th>`
    ).join('');
    
    const tableRows = data.map(row => {
      const cells = headers.map(header => {
        const value = row[header];
        return `<td class="border px-4 py-2">${value || ''}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .date { color: #666; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { text-align: left; }
          .border { border: 1px solid #ddd; }
          .bg-gray-100 { background-color: #f5f5f5; }
          .font-semibold { font-weight: 600; }
          .px-4 { padding-left: 1rem; padding-right: 1rem; }
          .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${title}</div>
          <div class="date">Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm:ss')}</div>
        </div>
        <table>
          <thead>
            <tr>${tableHeaders}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }

  // Utility method to download file
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // Batch export method
  exportAllData(
    payments: PaymentExportData[],
    dues: DueExportData[],
    customers: CustomerExportData[],
    format: 'csv' | 'json' | 'pdf' = 'csv'
  ): void {
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    
    // Export each dataset
    this.exportPayments(payments, { format, filename: `all_payments_${timestamp}.${format}` });
    this.exportDues(dues, { format, filename: `all_dues_${timestamp}.${format}` });
    this.exportCustomers(customers, { format, filename: `all_customers_${timestamp}.${format}` });
  }
}

export const exportUtils = ExportUtils.getInstance();
export default exportUtils;