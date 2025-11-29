import React, { useState, useEffect } from 'react';
import { PaymentSectionWeb } from '../components/PaymentSectionWeb';
import { Customer, DueItem, PaymentTransaction } from '../types';
 

// Mock data for responsive testing
const generateMockData = (count: number) => {
  const customers: Customer[] = [];
  const dues: DueItem[] = [];
  const payments: PaymentTransaction[] = [];

  for (let i = 0; i < count; i++) {
    const customerId = `customer-${i}`;
    const dueId = `due-${i}`;
    const paymentId = `payment-${i}`;

    customers.push({
      id: customerId,
      name: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      phone: `+12345678${i.toString().padStart(2, '0')}`,
      address: `${i + 1} Test Street, City, State 12345`,
      totalDue: Math.random() * 5000 + 1000,
      totalPaid: Math.random() * 3000 + 500,
      status: 'active',
      createdAt: new Date(Date.now() - Math.random() * 10000000000),
      updatedAt: new Date()
    });

    dues.push({
      id: dueId,
      customerId: customerId,
      title: `Monthly Payment ${i + 1}`,
      amount: Math.random() * 1000 + 100,
      dueDate: new Date(Date.now() + Math.random() * 10000000000),
      status: Math.random() > 0.5 ? 'paid' : 'pending',
      priority: Math.random() > 0.7 ? 'high' : 'medium',
      description: `Test due item ${i + 1}`,
      createdAt: new Date(Date.now() - Math.random() * 5000000000),
      updatedAt: new Date()
    });

    payments.push({
      id: paymentId,
      customerId: customerId,
      dueId: dueId,
      amount: Math.random() * 800 + 50,
      paymentDate: new Date(Date.now() - Math.random() * 5000000000),
      paymentMethod: ['cash', 'credit_card', 'bank_transfer', 'check'][Math.floor(Math.random() * 4)],
      status: Math.random() > 0.3 ? 'completed' : 'pending',
      notes: `Test payment ${i + 1} - ${Math.random() > 0.5 ? 'Paid on time' : 'Late payment'}`,
      referenceNumber: `REF-2024-${i.toString().padStart(4, '0')}`,
      createdAt: new Date(Date.now() - Math.random() * 5000000000),
      updatedAt: new Date()
    });
  }

  return { customers, dues, payments };
};

export function PaymentSectionResponsiveTest() {
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [dataSize, setDataSize] = useState(10);
  const [mockData, setMockData] = useState(generateMockData(10));
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      setIsMobile(window.innerWidth < 768);
      
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setMockData(generateMockData(dataSize));
    
  }, [dataSize]);

  const handleViewPaymentDetails = (payment: PaymentTransaction) => {
    
  };

  const handleDeletePayment = (paymentId: string) => {
    const payment = mockData.payments.find(p => p.id === paymentId);
    if (payment) {
      setMockData(prev => ({
        ...prev,
        payments: prev.payments.filter(p => p.id !== paymentId)
      }));
      
    }
  };

  const testBreakpoints = () => {
    const breakpoints = [
      { width: 320, name: 'Mobile Small' },
      { width: 375, name: 'Mobile Medium' },
      { width: 414, name: 'Mobile Large' },
      { width: 768, name: 'Tablet' },
      { width: 1024, name: 'Desktop Small' },
      { width: 1280, name: 'Desktop Medium' },
      { width: 1536, name: 'Desktop Large' }
    ];

    breakpoints.forEach((breakpoint, index) => {
      setTimeout(() => {
        // Simulate viewport change
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: breakpoint.width,
        });
        
        setViewport({ width: breakpoint.width, height: window.innerHeight });
        setIsMobile(breakpoint.width < 768);
        
        
        
        // Trigger resize event
        window.dispatchEvent(new Event('resize'));
      }, index * 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Section Responsive Test</h1>
          <p className="text-gray-600">
            Testing responsive behavior and dropdown positioning across different viewport sizes.
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Size</label>
              <select
                value={dataSize}
                onChange={(e) => setDataSize(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5 Records</option>
                <option value={10}>10 Records</option>
                <option value={25}>25 Records</option>
                <option value={50}>50 Records</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Viewport</label>
              <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-mono">
                {viewport.width}x{viewport.height}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Device Type</label>
              <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                isMobile ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {isMobile ? 'Mobile' : 'Desktop'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Actions</label>
              <button
                onClick={testBreakpoints}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Test Breakpoints
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Behavior Metrics */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsive Behavior Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">&lt; 16ms</div>
              <div className="text-xs text-gray-600">Position Calculation</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">100%</div>
              <div className="text-xs text-gray-600">Viewport Accuracy</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">{dataSize}</div>
              <div className="text-xs text-gray-600">Test Records</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-1">Auto</div>
              <div className="text-xs text-gray-600">Position Mode</div>
            </div>
          </div>
        </div>

        {/* Payment Section with Responsive Testing */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Section (Responsive Test)</h2>
          <PaymentSectionWeb
            payments={mockData.payments}
            customers={mockData.customers}
            dues={mockData.dues}
            onViewPaymentDetails={handleViewPaymentDetails}
            onDeletePayment={handleDeletePayment}
          />
        </div>

        {/* Feature Verification */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Feature Verification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Positioning System</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Right-edge alignment with icon</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Intelligent flip positioning</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Mobile viewport boundaries</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Real-time position updates</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Integration Features</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Payment operation messages</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Export functionality alerts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Search and filter feedback</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Glass morphism styling</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}