import { DueItem, PaymentTransaction, Customer } from '../types';
import { format } from 'date-fns';

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: {
    status?: string[];
    customerIds?: string[];
    paymentMethods?: string[];
  };
}

export interface ExportResult {
  data: string | Blob;
  filename: string;
  format: string;
  recordCount: number;
}

export class DataExporter {
  private static instance: DataExporter;

  private constructor() {}

  static getInstance(): DataExporter {
    if (!DataExporter.instance) {
      DataExporter.instance = new DataExporter();
    }
    return DataExporter.instance;
  }

  // Export dues data
  async exportDues(dues: DueItem[], customers: Customer[], options: ExportOptions = { format: 'csv' }): Promise<ExportResult> {
    const filteredDues = this.filterDues(dues, options);
    const customerMap = new Map(customers.map(c => [c.id, c]));

    switch (options.format) {
      case 'csv':
        return this.exportDuesToCSV(filteredDues, customerMap);
      case 'json':
        return this.exportDuesToJSON(filteredDues, customerMap);
      case 'pdf':
        return this.exportDuesToPDF(filteredDues, customerMap);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  // Export payments data
  async exportPayments(payments: PaymentTransaction[], customers: Customer[], dues: DueItem[], options: ExportOptions = { format: 'csv' }): Promise<ExportResult> {
    const filteredPayments = this.filterPayments(payments, options);
    const customerMap = new Map(customers.map(c => [c.id, c]));
    const dueMap = new Map(dues.map(d => [d.id, d]));

    switch (options.format) {
      case 'csv':
        return this.exportPaymentsToCSV(filteredPayments, customerMap, dueMap);
      case 'json':
        return this.exportPaymentsToJSON(filteredPayments, customerMap, dueMap);
      case 'pdf':
        return this.exportPaymentsToPDF(filteredPayments, customerMap, dueMap);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  // Export customers data
  async exportCustomers(customers: Customer[], options: ExportOptions = { format: 'csv' }): Promise<ExportResult> {
    const filteredCustomers = this.filterCustomers(customers, options);

    switch (options.format) {
      case 'csv':
        return this.exportCustomersToCSV(filteredCustomers);
      case 'json':
        return this.exportCustomersToJSON(filteredCustomers);
      case 'pdf':
        return this.exportCustomersToPDF(filteredCustomers);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  // Export comprehensive report
  async exportComprehensiveReport(
    dues: DueItem[],
    payments: PaymentTransaction[],
    customers: Customer[],
    options: ExportOptions = { format: 'csv' }
  ): Promise<ExportResult> {
    const filteredDues = this.filterDues(dues, options);
    const filteredPayments = this.filterPayments(payments, options);
    const filteredCustomers = this.filterCustomers(customers, options);
    const customerMap = new Map(customers.map(c => [c.id, c]));
    const dueMap = new Map(dues.map(d => [d.id, d]));

    switch (options.format) {
      case 'csv':
        return this.exportComprehensiveToCSV(filteredDues, filteredPayments, filteredCustomers, customerMap, dueMap);
      case 'json':
        return this.exportComprehensiveToJSON(filteredDues, filteredPayments, filteredCustomers, customerMap, dueMap);
      case 'pdf':
        return this.exportComprehensiveToPDF(filteredDues, filteredPayments, filteredCustomers, customerMap, dueMap);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  // Filter functions
  private filterDues(dues: DueItem[], options: ExportOptions): DueItem[] {
    let filtered = [...dues];

    if (options.dateRange) {
      filtered = filtered.filter(due => {
        const dueDate = new Date(due.dueDate);
        return dueDate >= options.dateRange!.start && dueDate <= options.dateRange!.end;
      });
    }

    if (options.filters?.status) {
      filtered = filtered.filter(due => options.filters!.status!.includes(due.status));
    }

    if (options.filters?.customerIds) {
      filtered = filtered.filter(due => options.filters!.customerIds!.includes(due.customerId));
    }

    return filtered;
  }

  private filterPayments(payments: PaymentTransaction[], options: ExportOptions): PaymentTransaction[] {
    let filtered = [...payments];

    if (options.dateRange) {
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate >= options.dateRange!.start && paymentDate <= options.dateRange!.end;
      });
    }

    if (options.filters?.paymentMethods) {
      filtered = filtered.filter(payment => options.filters!.paymentMethods!.includes(payment.paymentMethod));
    }

    return filtered;
  }

  private filterCustomers(customers: Customer[], options: ExportOptions): Customer[] {
    // For now, just return all customers
    // You could add filtering logic here if needed
    return [...customers];
  }

  // CSV export methods
  private exportDuesToCSV(dues: DueItem[], customerMap: Map<string, Customer>): ExportResult {
    const headers = ['ID', 'Customer', 'Title', 'Amount', 'Paid Amount', 'Due Date', 'Status', 'Created At'];
    const rows = dues.map(due => [
      due.id,
      customerMap.get(due.customerId)?.name || 'Unknown Customer',
      due.title,
      due.amount.toFixed(2),
      due.paidAmount.toFixed(2),
      format(new Date(due.dueDate), 'yyyy-MM-dd'),
      due.status,
      format(new Date(due.createdAt), 'yyyy-MM-dd HH:mm:ss')
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    return {
      data: csvContent,
      filename: `dues_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`,
      format: 'csv',
      recordCount: dues.length
    };
  }

  private exportPaymentsToCSV(payments: PaymentTransaction[], customerMap: Map<string, Customer>, dueMap: Map<string, DueItem>): ExportResult {
    const headers = ['ID', 'Customer', 'Due Title', 'Amount', 'Payment Date', 'Method', 'Notes'];
    const rows = payments.map(payment => [
      payment.id,
      customerMap.get(payment.customerId)?.name || 'Unknown Customer',
      dueMap.get(payment.dueId)?.title || 'Unknown Due',
      payment.amount.toFixed(2),
      format(new Date(payment.paymentDate), 'yyyy-MM-dd'),
      payment.paymentMethod,
      payment.notes || ''
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    return {
      data: csvContent,
      filename: `payments_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`,
      format: 'csv',
      recordCount: payments.length
    };
  }

  private exportCustomersToCSV(customers: Customer[]): ExportResult {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Address'];
    const rows = customers.map(customer => [
      customer.id,
      customer.name,
      customer.email,
      customer.phone || '',
      customer.address || ''
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    return {
      data: csvContent,
      filename: `customers_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`,
      format: 'csv',
      recordCount: customers.length
    };
  }

  private exportComprehensiveToCSV(dues: DueItem[], payments: PaymentTransaction[], customers: Customer[], customerMap: Map<string, Customer>, dueMap: Map<string, DueItem>): ExportResult {
    const headers = ['Type', 'ID', 'Customer', 'Title/Method', 'Amount', 'Date', 'Status'];
    const rows = [
      ...dues.map(due => ['Due', due.id, customerMap.get(due.customerId)?.name || 'Unknown Customer', due.title, due.amount.toFixed(2), format(new Date(due.dueDate), 'yyyy-MM-dd'), due.status]),
      ...payments.map(payment => ['Payment', payment.id, customerMap.get(payment.customerId)?.name || 'Unknown Customer', payment.paymentMethod, payment.amount.toFixed(2), format(new Date(payment.paymentDate), 'yyyy-MM-dd'), 'COMPLETED'])
    ];

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    return {
      data: csvContent,
      filename: `comprehensive_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`,
      format: 'csv',
      recordCount: dues.length + payments.length
    };
  }

  // JSON export methods
  private exportDuesToJSON(dues: DueItem[], customerMap: Map<string, Customer>): ExportResult {
    const data = dues.map(due => ({
      ...due,
      customer: customerMap.get(due.customerId)
    }));

    return {
      data: JSON.stringify(data, null, 2),
      filename: `dues_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.json`,
      format: 'json',
      recordCount: dues.length
    };
  }

  private exportPaymentsToJSON(payments: PaymentTransaction[], customerMap: Map<string, Customer>, dueMap: Map<string, DueItem>): ExportResult {
    const data = payments.map(payment => ({
      ...payment,
      customer: customerMap.get(payment.customerId),
      due: dueMap.get(payment.dueId)
    }));

    return {
      data: JSON.stringify(data, null, 2),
      filename: `payments_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.json`,
      format: 'json',
      recordCount: payments.length
    };
  }

  private exportCustomersToJSON(customers: Customer[]): ExportResult {
    return {
      data: JSON.stringify(customers, null, 2),
      filename: `customers_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.json`,
      format: 'json',
      recordCount: customers.length
    };
  }

  private exportComprehensiveToJSON(dues: DueItem[], payments: PaymentTransaction[], customers: Customer[], customerMap: Map<string, Customer>, dueMap: Map<string, DueItem>): ExportResult {
    const data = {
      dues: dues.map(due => ({ ...due, customer: customerMap.get(due.customerId) })),
      payments: payments.map(payment => ({ ...payment, customer: customerMap.get(payment.customerId), due: dueMap.get(payment.dueId) })),
      customers: customers,
      exportDate: new Date().toISOString()
    };

    return {
      data: JSON.stringify(data, null, 2),
      filename: `comprehensive_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.json`,
      format: 'json',
      recordCount: dues.length + payments.length + customers.length
    };
  }

  // PDF export methods (simplified - just text-based PDF content)
  private exportDuesToPDF(dues: DueItem[], customerMap: Map<string, Customer>): ExportResult {
    let content = `DUES REPORT\nGenerated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n\n`;
    content += `Total Dues: ${dues.length}\n\n`;
    
    dues.forEach(due => {
      const customer = customerMap.get(due.customerId);
      content += `ID: ${due.id}\n`;
      content += `Customer: ${customer?.name || 'Unknown Customer'}\n`;
      content += `Title: ${due.title}\n`;
      content += `Amount: $${due.amount.toFixed(2)}\n`;
      content += `Paid Amount: $${due.paidAmount.toFixed(2)}\n`;
      content += `Due Date: ${format(new Date(due.dueDate), 'yyyy-MM-dd')}\n`;
      content += `Status: ${due.status}\n`;
      content += `Created: ${format(new Date(due.createdAt), 'yyyy-MM-dd HH:mm:ss')}\n`;
      content += '---\n\n';
    });

    return {
      data: content,
      filename: `dues_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.txt`,
      format: 'pdf',
      recordCount: dues.length
    };
  }

  private exportPaymentsToPDF(payments: PaymentTransaction[], customerMap: Map<string, Customer>, dueMap: Map<string, DueItem>): ExportResult {
    let content = `PAYMENTS REPORT\nGenerated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n\n`;
    content += `Total Payments: ${payments.length}\n\n`;
    
    payments.forEach(payment => {
      const customer = customerMap.get(payment.customerId);
      const due = dueMap.get(payment.dueId);
      content += `ID: ${payment.id}\n`;
      content += `Customer: ${customer?.name || 'Unknown Customer'}\n`;
      content += `Due Title: ${due?.title || 'Unknown Due'}\n`;
      content += `Amount: $${payment.amount.toFixed(2)}\n`;
      content += `Payment Date: ${format(new Date(payment.paymentDate), 'yyyy-MM-dd')}\n`;
      content += `Method: ${payment.paymentMethod}\n`;
      content += `Notes: ${payment.notes || 'N/A'}\n`;
      content += '---\n\n';
    });

    return {
      data: content,
      filename: `payments_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.txt`,
      format: 'pdf',
      recordCount: payments.length
    };
  }

  private exportCustomersToPDF(customers: Customer[]): ExportResult {
    let content = `CUSTOMERS REPORT\nGenerated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n\n`;
    content += `Total Customers: ${customers.length}\n\n`;
    
    customers.forEach(customer => {
      content += `ID: ${customer.id}\n`;
      content += `Name: ${customer.name}\n`;
      content += `Email: ${customer.email}\n`;
      content += `Phone: ${customer.phone || 'N/A'}\n`;
      content += `Address: ${customer.address || 'N/A'}\n`;
      content += '---\n\n';
    });

    return {
      data: content,
      filename: `customers_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.txt`,
      format: 'pdf',
      recordCount: customers.length
    };
  }

  private exportComprehensiveToPDF(dues: DueItem[], payments: PaymentTransaction[], customers: Customer[], customerMap: Map<string, Customer>, dueMap: Map<string, DueItem>): ExportResult {
    let content = `COMPREHENSIVE FINANCIAL REPORT\nGenerated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n\n`;
    content += `Summary:\n`;
    content += `- Total Dues: ${dues.length}\n`;
    content += `- Total Payments: ${payments.length}\n`;
    content += `- Total Customers: ${customers.length}\n\n`;

    content += 'DUES:\n';
    dues.forEach(due => {
      const customer = customerMap.get(due.customerId);
      content += `- ${due.title} (${customer?.name}): $${due.amount.toFixed(2)} - ${due.status}\n`;
    });

    content += '\nPAYMENTS:\n';
    payments.forEach(payment => {
      const customer = customerMap.get(payment.customerId);
      content += `- ${customer?.name}: $${payment.amount.toFixed(2)} (${payment.paymentMethod})\n`;
    });

    return {
      data: content,
      filename: `comprehensive_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.txt`,
      format: 'pdf',
      recordCount: dues.length + payments.length + customers.length
    };
  }

  // Download helper
  downloadExport(result: ExportResult): void {
    const blob = new Blob([result.data], { type: this.getMimeType(result.format) });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private getMimeType(format: string): string {
    switch (format) {
      case 'csv':
        return 'text/csv';
      case 'json':
        return 'application/json';
      case 'pdf':
        return 'text/plain'; // Simplified PDF as text
      default:
        return 'text/plain';
    }
  }
}

// Export singleton instance
export const dataExporter = DataExporter.getInstance();

// Export individual functions for backward compatibility
export const exportDues = async (dues: DueItem[], customers: Customer[], options?: ExportOptions) => {
  return dataExporter.exportDues(dues, customers, options);
};

export const exportPayments = async (payments: PaymentTransaction[], customers: Customer[], dues: DueItem[], options?: ExportOptions) => {
  return dataExporter.exportPayments(payments, customers, dues, options);
};

export const exportCustomers = async (customers: Customer[], options?: ExportOptions) => {
  return dataExporter.exportCustomers(customers, options);
};

export const exportComprehensiveReport = async (dues: DueItem[], payments: PaymentTransaction[], customers: Customer[], options?: ExportOptions) => {
  return dataExporter.exportComprehensiveReport(dues, payments, customers, options);
};