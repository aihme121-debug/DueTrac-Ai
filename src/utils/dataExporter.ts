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
    switch (options.format) {
      case 'csv':
        return this.exportComprehensiveCSV(dues, payments, customers, options);
      case 'json':
        return this.exportComprehensiveJSON(dues, payments, customers, options);
      case 'pdf':
        return this.exportComprehensivePDF(dues, payments, customers, options);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  private filterDues(dues: DueItem[], options: ExportOptions): DueItem[] {
    let filtered = dues;

    if (options.dateRange) {
      filtered = filtered.filter(due => {
        const dueDate = new Date(due.dueDate);
        return dueDate >= options.dateRange!.start && dueDate <= options.dateRange!.end;
      });
    }

    if (options.filters?.status && options.filters.status.length > 0) {
      filtered = filtered.filter(due => options.filters!.status!.includes(due.status));
    }

    if (options.filters?.customerIds && options.filters.customerIds.length > 0) {
      filtered = filtered.filter(due => options.filters!.customerIds!.includes(due.customerId));
    }

    return filtered;
  }

  private filterPayments(payments: PaymentTransaction[], options: ExportOptions): PaymentTransaction[] {
    let filtered = payments;

    if (options.dateRange) {
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate >= options.dateRange!.start && paymentDate <= options.dateRange!.end;
      });
    }

    if (options.filters?.paymentMethods && options.filters.paymentMethods.length > 0) {
      filtered = filtered.filter(payment => 
        options.filters!.paymentMethods!.includes(payment.paymentMethod)
      );
    }

    if (options.filters?.customerIds && options.filters.customerIds.length > 0) {
      filtered = filtered.filter(payment => 
        options.filters!.customerIds!.includes(payment.customerId)
      );
    }

    return filtered;
  }

  private filterCustomers(customers: Customer[], options: ExportOptions): Customer[] {
    let filtered = customers;

    if (options.dateRange) {
      filtered = filtered.filter(customer => {
        const createdDate = new Date(customer.createdAt);
        return createdDate >= options.dateRange!.start && createdDate <= options.dateRange!.end;
      });
    }

    return filtered;
  }

  private exportDuesToCSV(dues: DueItem[], customerMap: Map<string, Customer>): ExportResult {
    const headers = ['ID', 'Customer', 'Title', 'Amount', 'Paid Amount', 'Remaining', 'Status', 'Due Date', 'Created Date', 'Description'];
    const rows = dues.map(due => {
      const customer = customerMap.get(due.customerId);
      const remaining = due.amount - due.paidAmount;
      return [
        due.id,
        customer?.name || 'Unknown',
        due.title,
        due.amount.toFixed(2),
        due.paidAmount.toFixed(2),
        remaining.toFixed(2),
        due.status,
        format(new Date(due.dueDate), 'yyyy-MM-dd'),
        format(new Date(due.createdAt), 'yyyy-MM-dd HH:mm'),
        due.description || ''
      ];
    });

    const csvContent = [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    return {
      data: csvContent,
      filename: `dues_${format(new Date(), 'yyyy-MM-dd')}.csv`,
      format: 'csv',
      recordCount: dues.length
    };
  }

  private exportPaymentsToCSV(payments: PaymentTransaction[], customerMap: Map<string, Customer>, dueMap: Map<string, DueItem>): ExportResult {
    const headers = ['ID', 'Customer', 'Due Title', 'Amount', 'Method', 'Date', 'Notes'];
    const rows = payments.map(payment => {
      const customer = customerMap.get(payment.customerId);
      const due = dueMap.get(payment.dueId);
      return [
        payment.id,
        customer?.name || 'Unknown',
        due?.title || 'Unknown',
        payment.amount.toFixed(2),
        payment.paymentMethod,
        format(new Date(payment.paymentDate), 'yyyy-MM-dd HH:mm'),
        payment.notes || ''
      ];
    });

    const csvContent = [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    return {
      data: csvContent,
      filename: `payments_${format(new Date(), 'yyyy-MM-dd')}.csv`,
      format: 'csv',
      recordCount: payments.length
    };
  }

  private exportCustomersToCSV(customers: Customer[]): ExportResult {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Address', 'Total Due', 'Created Date'];
    const rows = customers.map(customer => [
      customer.id,
      customer.name,
      customer.email,
      customer.phone || '',
      customer.address || '',
      customer.totalDue.toFixed(2),
      format(new Date(customer.createdAt), 'yyyy-MM-dd HH:mm')
    ]);

    const csvContent = [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    return {
      data: csvContent,
      filename: `customers_${format(new Date(), 'yyyy-MM-dd')}.csv`,
      format: 'csv',
      recordCount: customers.length
    };
  }

  private exportDuesToJSON(dues: DueItem[], customerMap: Map<string, Customer>): ExportResult {
    const data = dues.map(due => ({
      ...due,
      customer: customerMap.get(due.customerId)
    }));

    return {
      data: JSON.stringify(data, null, 2),
      filename: `dues_${format(new Date(), 'yyyy-MM-dd')}.json`,
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
      filename: `payments_${format(new Date(), 'yyyy-MM-dd')}.json`,
      format: 'json',
      recordCount: payments.length
    };
  }

  private exportCustomersToJSON(customers: Customer[]): ExportResult {
    return {
      data: JSON.stringify(customers, null, 2),
      filename: `customers_${format(new Date(), 'yyyy-MM-dd')}.json`,
      format: 'json',
      recordCount: customers.length
    };
  }

  private exportDuesToPDF(dues: DueItem[], customerMap: Map<string, Customer>): ExportResult {
    // For PDF export, we'll create a simple HTML structure
    // In a real application, you might use a library like jsPDF or similar
    const htmlContent = this.generatePDFContent('Dues Report', dues, customerMap, 'due');
    
    return {
      data: htmlContent,
      filename: `dues_${format(new Date(), 'yyyy-MM-dd')}.html`,
      format: 'pdf',
      recordCount: dues.length
    };
  }

  private exportPaymentsToPDF(payments: PaymentTransaction[], customerMap: Map<string, Customer>, dueMap: Map<string, DueItem>): ExportResult {
    const htmlContent = this.generatePDFContent('Payments Report', payments, customerMap, 'payment', dueMap);
    
    return {
      data: htmlContent,
      filename: `payments_${format(new Date(), 'yyyy-MM-dd')}.html`,
      format: 'pdf',
      recordCount: payments.length
    };
  }

  private exportCustomersToPDF(customers: Customer[]): ExportResult {
    const htmlContent = this.generatePDFContent('Customers Report', customers);
    
    return {
      data: htmlContent,
      filename: `customers_${format(new Date(), 'yyyy-MM-dd')}.html`,
      format: 'pdf',
      recordCount: customers.length
    };
  }

  private exportComprehensiveCSV(dues: DueItem[], payments: PaymentTransaction[], customers: Customer[], options: ExportOptions): ExportResult {
    const filteredDues = this.filterDues(dues, options);
    const filteredPayments = this.filterPayments(payments, options);
    const filteredCustomers = this.filterCustomers(customers, options);

    let csvContent = 'COMPREHENSIVE FINANCIAL REPORT\n';
    csvContent += `Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}\n\n`;

    // Summary section
    csvContent += 'SUMMARY\n';
    csvContent += `Total Customers: ${filteredCustomers.length}\n`;
    csvContent += `Total Dues: ${filteredDues.length}\n`;
    csvContent += `Total Payments: ${filteredPayments.length}\n`;
    csvContent += `Total Due Amount: ${filteredDues.reduce((sum, due) => sum + due.amount, 0).toFixed(2)}\n`;
    csvContent += `Total Paid Amount: ${filteredPayments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}\n\n`;

    // Customers section
    csvContent += 'CUSTOMERS\n';
    csvContent += 'Name,Email,Phone,Total Due,Created Date\n';
    filteredCustomers.forEach(customer => {
      csvContent += `"${customer.name}","${customer.email}","${customer.phone || ''}","${customer.totalDue.toFixed(2)}","${format(new Date(customer.createdAt), 'yyyy-MM-dd')}"\n`;
    });
    csvContent += '\n';

    // Dues section
    csvContent += 'DUES\n';
    csvContent += 'Customer,Title,Amount,Paid Amount,Remaining,Status,Due Date\n';
    filteredDues.forEach(due => {
      const customer = customers.find(c => c.id === due.customerId);
      const remaining = due.amount - due.paidAmount;
      csvContent += `"${customer?.name || 'Unknown'}","${due.title}","${due.amount.toFixed(2)}","${due.paidAmount.toFixed(2)}","${remaining.toFixed(2)}","${due.status}","${format(new Date(due.dueDate), 'yyyy-MM-dd')}"\n`;
    });
    csvContent += '\n';

    // Payments section
    csvContent += 'PAYMENTS\n';
    csvContent += 'Customer,Due Title,Amount,Method,Date\n';
    filteredPayments.forEach(payment => {
      const customer = customers.find(c => c.id === payment.customerId);
      const due = dues.find(d => d.id === payment.dueId);
      csvContent += `"${customer?.name || 'Unknown'}","${due?.title || 'Unknown'}","${payment.amount.toFixed(2)}","${payment.paymentMethod}","${format(new Date(payment.paymentDate), 'yyyy-MM-dd')}"\n`;
    });

    return {
      data: csvContent,
      filename: `comprehensive_report_${format(new Date(), 'yyyy-MM-dd')}.csv`,
      format: 'csv',
      recordCount: filteredCustomers.length + filteredDues.length + filteredPayments.length
    };
  }

  private exportComprehensiveJSON(dues: DueItem[], payments: PaymentTransaction[], customers: Customer[], options: ExportOptions): ExportResult {
    const filteredDues = this.filterDues(dues, options);
    const filteredPayments = this.filterPayments(payments, options);
    const filteredCustomers = this.filterCustomers(customers, options);

    const data = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalCustomers: filteredCustomers.length,
        totalDues: filteredDues.length,
        totalPayments: filteredPayments.length,
        totalDueAmount: filteredDues.reduce((sum, due) => sum + due.amount, 0),
        totalPaidAmount: filteredPayments.reduce((sum, payment) => sum + payment.amount, 0)
      },
      customers: filteredCustomers,
      dues: filteredDues,
      payments: filteredPayments
    };

    return {
      data: JSON.stringify(data, null, 2),
      filename: `comprehensive_report_${format(new Date(), 'yyyy-MM-dd')}.json`,
      format: 'json',
      recordCount: filteredCustomers.length + filteredDues.length + filteredPayments.length
    };
  }

  private exportComprehensivePDF(dues: DueItem[], payments: PaymentTransaction[], customers: Customer[], options: ExportOptions): ExportResult {
    const filteredDues = this.filterDues(dues, options);
    const filteredPayments = this.filterPayments(payments, options);
    const filteredCustomers = this.filterCustomers(customers, options);

    const htmlContent = this.generateComprehensivePDFContent(filteredDues, filteredPayments, filteredCustomers);
    
    return {
      data: htmlContent,
      filename: `comprehensive_report_${format(new Date(), 'yyyy-MM-dd')}.html`,
      format: 'pdf',
      recordCount: filteredCustomers.length + filteredDues.length + filteredPayments.length
    };
  }

  private generatePDFContent(title: string, data: any[], customerMap: Map<string, Customer>, type: 'due' | 'payment', dueMap?: Map<string, DueItem>): string {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; background-color: #e6f3ff; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p>Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
        </div>
        
        <div class="summary">
          <h3>Summary</h3>
          <p>Total Records: ${data.length}</p>
          <p>Total Amount: $${data.reduce((sum: number, item: any) => sum + (item.amount || 0), 0).toFixed(2)}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              ${this.getTableHeaders(type)}
            </tr>
          </thead>
          <tbody>
            ${data.map(item => this.getTableRow(item, customerMap, dueMap)).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    return html;
  }

  private generateComprehensivePDFContent(dues: DueItem[], payments: PaymentTransaction[], customers: Customer[]): string {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comprehensive Financial Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 40px; }
          .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; background-color: #e6f3ff; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Comprehensive Financial Report</h1>
          <p>Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
        </div>
        
        <div class="summary">
          <h3>Executive Summary</h3>
          <p>Total Customers: ${customers.length}</p>
          <p>Total Dues: ${dues.length}</p>
          <p>Total Payments: ${payments.length}</p>
          <p>Total Due Amount: $${dues.reduce((sum, due) => sum + due.amount, 0).toFixed(2)}</p>
          <p>Total Paid Amount: $${payments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}</p>
        </div>
        
        <div class="section">
          <h2>Customers</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Total Due</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              ${customers.map(customer => `
                <tr>
                  <td>${customer.name}</td>
                  <td>${customer.email}</td>
                  <td>${customer.phone || 'N/A'}</td>
                  <td>$${customer.totalDue.toFixed(2)}</td>
                  <td>${format(new Date(customer.createdAt), 'MMM dd, yyyy')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <h2>Dues</h2>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Title</th>
                <th>Amount</th>
                <th>Paid Amount</th>
                <th>Remaining</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              ${dues.map(due => {
                const customer = customers.find(c => c.id === due.customerId);
                const remaining = due.amount - due.paidAmount;
                return `
                  <tr>
                    <td>${customer?.name || 'Unknown'}</td>
                    <td>${due.title}</td>
                    <td>$${due.amount.toFixed(2)}</td>
                    <td>$${due.paidAmount.toFixed(2)}</td>
                    <td>$${remaining.toFixed(2)}</td>
                    <td>${due.status}</td>
                    <td>${format(new Date(due.dueDate), 'MMM dd, yyyy')}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <h2>Payments</h2>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Due Title</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${payments.map(payment => {
                const customer = customers.find(c => c.id === payment.customerId);
                const due = dues.find(d => d.id === payment.dueId);
                return `
                  <tr>
                    <td>${customer?.name || 'Unknown'}</td>
                    <td>${due?.title || 'Unknown'}</td>
                    <td>$${payment.amount.toFixed(2)}</td>
                    <td>${payment.paymentMethod}</td>
                    <td>${format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;
    
    return html;
  }

  private getTableHeaders(type: 'due' | 'payment'): string {
    if (type === 'due') {
      return '<th>Customer</th><th>Title</th><th>Amount</th><th>Paid Amount</th><th>Remaining</th><th>Status</th><th>Due Date</th>';
    } else {
      return '<th>Customer</th><th>Due Title</th><th>Amount</th><th>Method</th><th>Date</th>';
    }
  }

  private getTableRow(item: any, customerMap: Map<string, Customer>, dueMap?: Map<string, DueItem>): string {
    if (item.dueId) { // Payment
      const customer = customerMap.get(item.customerId);
      const due = dueMap?.get(item.dueId);
      return `
        <tr>
          <td>${customer?.name || 'Unknown'}</td>
          <td>${due?.title || 'Unknown'}</td>
          <td>$${item.amount.toFixed(2)}</td>
          <td>${item.paymentMethod}</td>
          <td>${format(new Date(item.paymentDate), 'MMM dd, yyyy')}</td>
        </tr>
      `;
    } else { // Due
      const customer = customerMap.get(item.customerId);
      const remaining = item.amount - item.paidAmount;
      return `
        <tr>
          <td>${customer?.name || 'Unknown'}</td>
          <td>${item.title}</td>
          <td>$${item.amount.toFixed(2)}</td>
          <td>$${item.paidAmount.toFixed(2)}</td>
          <td>$${remaining.toFixed(2)}</td>
          <td>${item.status}</td>
          <td>${format(new Date(item.dueDate), 'MMM dd, yyyy')}</td>
        </tr>
      `;
    }
  }

  // Utility method to download exported data
  downloadExport(result: ExportResult): void {
    const blob = typeof result.data === 'string' 
      ? new Blob([result.data], { type: this.getContentType(result.format) })
      : result.data as Blob;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private getContentType(format: string): string {
    switch (format) {
      case 'csv':
        return 'text/csv;charset=utf-8;';
      case 'json':
        return 'application/json;charset=utf-8;';
      case 'pdf':
        return 'text/html;charset=utf-8;';
      default:
        return 'text/plain;charset=utf-8;';
    }
  }
}

// Export singleton instance
export const dataExporter = DataExporter.getInstance();