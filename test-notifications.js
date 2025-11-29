// Test script to verify notification system
import { notificationService } from './services/notificationService.ts';
import { StorageService } from './services/storageService.ts';

async function testNotificationSystem() {
  console.log('🧪 Starting notification system test...');
  
  try {
    // Set current user
    notificationService.setCurrentUser('test-user');
    console.log('✅ User set in notification service');
    
    // Test 1: Create a test customer
    const testCustomer = {
      id: `test-customer-${Date.now()}`,
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '123-456-7890',
      address: '123 Test St',
      totalDue: 500,
      status: 'active'
    };
    
    console.log('📝 Creating test customer...');
    await StorageService.saveCustomer(testCustomer);
    console.log('✅ Test customer created');
    
    // Test 2: Create a test due
    const testDue = {
      id: `test-due-${Date.now()}`,
      customerId: testCustomer.id,
      amount: 500,
      paidAmount: 0,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      description: 'Test due for notification system',
      paymentHistory: [],
      createdAt: new Date().toISOString()
    };
    
    console.log('📝 Creating test due...');
    await StorageService.saveDue(testDue);
    console.log('✅ Test due created - notification should be triggered');
    
    // Test 3: Create a test payment
    const paymentData = {
      dueId: testDue.id,
      amount: 200,
      paymentDate: new Date().toISOString(),
      paymentMethod: 'cash',
      notes: 'Test payment for notification system'
    };
    
    console.log('💰 Creating test payment...');
    await StorageService.addPayment(paymentData);
    console.log('✅ Test payment created - notification should be triggered');
    
    console.log('🎉 Notification system test completed!');
    console.log('📋 Check the notification bell in the UI to see the notifications.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testNotificationSystem();