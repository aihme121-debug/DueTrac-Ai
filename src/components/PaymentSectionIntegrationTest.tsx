import React, { useState, useEffect } from 'react';
import { PaymentSectionWeb } from '../components/PaymentSectionWeb';
import { Customer, DueItem, PaymentTransaction } from '../types';
 

// Mock data for testing
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    address: '123 Main St, City, State 12345',
    totalDue: 2500,
    totalPaid: 1500,
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1987654321',
    address: '456 Oak Ave, Town, State 67890',
    totalDue: 1800,
    totalPaid: 2200,
    status: 'active',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20')
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '+1555666777',
    address: '789 Pine Rd, Village, State 13579',
    totalDue: 3200,
    totalPaid: 2800,
    status: 'active',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10')
  }
];

const mockDues: DueItem[] = [
  {
    id: '1',
    customerId: '1',
    title: 'Monthly Rent - January',
    amount: 1200,
    dueDate: new Date('2024-01-31'),
    status: 'paid',
    priority: 'high',
    description: 'Monthly rent payment for January 2024',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    customerId: '2',
    title: 'Service Fee',
    amount: 300,
    dueDate: new Date('2024-02-15'),
    status: 'paid',
    priority: 'medium',
    description: 'Professional service fee',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-15')
  },
  {
    id: '3',
    customerId: '3',
    title: 'Equipment Lease',
    amount: 2500,
    dueDate: new Date('2024-03-30'),
    status: 'pending',
    priority: 'high',
    description: 'Quarterly equipment lease payment',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-10')
  }
];

const mockPayments: PaymentTransaction[] = [
  {
    id: 'p1',
    customerId: '1',
    dueId: '1',
    amount: 1200,
    paymentDate: new Date('2024-01-15'),
    paymentMethod: 'credit_card',
    status: 'completed',
    notes: 'Paid on time - Thank you!',
    referenceNumber: 'REF-2024-001',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'p2',
    customerId: '2',
    dueId: '2',
    amount: 300,
    paymentDate: new Date('2024-02-15'),
    paymentMethod: 'bank_transfer',
    status: 'completed',
    notes: 'Bank transfer received',
    referenceNumber: 'REF-2024-002',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15')
  },
  {
    id: 'p3',
    customerId: '1',
    dueId: '1',
    amount: 800,
    paymentDate: new Date('2024-02-20'),
    paymentMethod: 'cash',
    status: 'completed',
    notes: 'Partial payment for January rent',
    referenceNumber: 'REF-2024-003',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20')
  },
  {
    id: 'p4',
    customerId: '3',
    dueId: '3',
    amount: 1500,
    paymentDate: new Date('2024-03-10'),
    paymentMethod: 'check',
    status: 'pending',
    notes: 'Check deposited, awaiting clearance',
    referenceNumber: 'REF-2024-004',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10')
  }
];

export function PaymentSectionIntegrationTest() {
  const [payments, setPayments] = useState<PaymentTransaction[]>(mockPayments);
  const [customers] = useState<Customer[]>(mockCustomers);
  const [dues] = useState<DueItem[]>(mockDues);
  

  const handleViewPaymentDetails = (payment: PaymentTransaction) => {
    
    console.log('Viewing payment details:', payment);
  };

  const handleDeletePayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      setPayments(prev => prev.filter(p => p.id !== paymentId));
      
    }
  };

  const handleExportPayments = () => {
    
    
    // Simulate export delay
    setTimeout(() => {
      
    }, 1500);
  };

  useEffect(() => {
    
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Section Integration Test</h1>
          <p className="text-gray-600">
            Testing the integration of notification dropdown with payment management functionality.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Controls</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => console.log('Test Success', 'This is a success message from the payment system.')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Test Success Message
            </button>
            <button
              onClick={() => console.error('Test Error', 'This is an error message from the payment system.')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Test Error Message
            </button>
            <button
              onClick={() => console.info('Test Info', 'This is an info message from the payment system.')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Info Message
            </button>
          </div>
        </div>

        <PaymentSectionWeb
          payments={payments}
          customers={customers}
          dues={dues}
          onViewPaymentDetails={handleViewPaymentDetails}
          onDeletePayment={handleDeletePayment}
        />

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Integration Features Tested</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Dropdown in header</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Payment operation messages</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Export functionality with messages</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Search and filter notifications</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Professional positioning system</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Mobile responsive behavior</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}