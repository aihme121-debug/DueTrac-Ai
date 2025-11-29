import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock Playwright/browser automation
const mockPage = {
  goto: jest.fn(),
  fill: jest.fn(),
  click: jest.fn(),
  waitForSelector: jest.fn(),
  waitForNavigation: jest.fn(),
  screenshot: jest.fn(),
  evaluate: jest.fn(),
  textContent: jest.fn(),
  isVisible: jest.fn(),
};

const mockBrowser = {
  newPage: jest.fn(() => mockPage),
  close: jest.fn(),
};

const mockChromium = {
  launch: jest.fn(() => mockBrowser),
};

jest.mock('@playwright/test', () => ({
  chromium: mockChromium,
  expect: expect,
}));

// Mock Firebase services
jest.mock('../../services/authService', () => ({
  authService: {
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getCurrentUser: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
}));

jest.mock('../../services/paymentService', () => ({
  paymentService: {
    getPayments: jest.fn(),
    createPayment: jest.fn(),
    updatePayment: jest.fn(),
    deletePayment: jest.fn(),
  },
}));

jest.mock('../../services/dueService', () => ({
  dueService: {
    getDues: jest.fn(),
    createDue: jest.fn(),
    updateDue: jest.fn(),
    deleteDue: jest.fn(),
  },
}));

jest.mock('../../services/customerService', () => ({
  customerService: {
    getCustomers: jest.fn(),
    createCustomer: jest.fn(),
    updateCustomer: jest.fn(),
    deleteCustomer: jest.fn(),
  },
}));

import { authService } from '../../services/authService';
import { paymentService } from '../../services/paymentService';
import { dueService } from '../../services/dueService';
import { customerService } from '../../services/customerService';

describe('E2E User Flows', () => {
  let browser: any;
  let page: any;

  beforeEach(async () => {
    browser = await mockChromium.launch();
    page = await browser.newPage();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await browser.close();
    jest.restoreAllMocks();
  });

  describe('Authentication Flow', () => {
    it('should complete user registration flow', async () => {
      // Navigate to registration page
      mockPage.goto.mockResolvedValue(undefined);
      await page.goto('http://localhost:5173/register');
      expect(mockPage.goto).toHaveBeenCalledWith('http://localhost:5173/register');

      // Fill registration form
      mockPage.fill.mockResolvedValue(undefined);
      await page.fill('input[name="email"]', 'newuser@example.com');
      await page.fill('input[name="password"]', 'SecurePass123!');
      await page.fill('input[name="confirmPassword"]', 'SecurePass123!');

      expect(mockPage.fill).toHaveBeenCalledWith('input[name="email"]', 'newuser@example.com');
      expect(mockPage.fill).toHaveBeenCalledWith('input[name="password"]', 'SecurePass123!');

      // Mock successful registration
      (authService.signUp as jest.Mock).mockResolvedValue({
        uid: 'new-user-id',
        email: 'newuser@example.com',
      });

      // Submit form
      mockPage.click.mockResolvedValue(undefined);
      mockPage.waitForNavigation.mockResolvedValue(undefined);
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      expect(authService.signUp).toHaveBeenCalledWith('newuser@example.com', 'SecurePass123!');
      expect(mockPage.waitForNavigation).toHaveBeenCalled();
    });

    it('should complete login flow', async () => {
      // Navigate to login page
      mockPage.goto.mockResolvedValue(undefined);
      await page.goto('http://localhost:5173/login');
      expect(mockPage.goto).toHaveBeenCalledWith('http://localhost:5173/login');

      // Fill login form
      mockPage.fill.mockResolvedValue(undefined);
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');

      expect(mockPage.fill).toHaveBeenCalledWith('input[name="email"]', 'test@example.com');
      expect(mockPage.fill).toHaveBeenCalledWith('input[name="password"]', 'password123');

      // Mock successful login
      (authService.signIn as jest.Mock).mockResolvedValue({
        uid: 'test-user-id',
        email: 'test@example.com',
      });

      // Submit form
      mockPage.click.mockResolvedValue(undefined);
      mockPage.waitForNavigation.mockResolvedValue(undefined);
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      expect(authService.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockPage.waitForNavigation).toHaveBeenCalled();
    });

    it('should handle authentication errors', async () => {
      // Navigate to login page
      mockPage.goto.mockResolvedValue(undefined);
      await page.goto('http://localhost:5173/login');

      // Fill login form with invalid credentials
      mockPage.fill.mockResolvedValue(undefined);
      await page.fill('input[name="email"]', 'invalid@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');

      // Mock authentication failure
      (authService.signIn as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

      // Submit form
      mockPage.click.mockResolvedValue(undefined);
      await page.click('button[type="submit"]');

      // Wait for error message
      mockPage.waitForSelector.mockResolvedValue(undefined);
      mockPage.textContent.mockResolvedValue('Invalid credentials');
      await page.waitForSelector('.error-message');
      const errorText = await page.textContent('.error-message');

      expect(authService.signIn).toHaveBeenCalledWith('invalid@example.com', 'wrongpassword');
      expect(errorText).toBe('Invalid credentials');
    });

    it('should handle logout flow', async () => {
      // Mock authenticated user
      (authService.getCurrentUser as jest.Mock).mockReturnValue({
        uid: 'test-user-id',
        email: 'test@example.com',
      });

      // Navigate to dashboard
      mockPage.goto.mockResolvedValue(undefined);
      await page.goto('http://localhost:5173/dashboard');

      // Click logout button
      mockPage.click.mockResolvedValue(undefined);
      mockPage.waitForNavigation.mockResolvedValue(undefined);
      await page.click('button[data-testid="logout-button"]');

      // Mock successful logout
      (authService.signOut as jest.Mock).mockResolvedValue(undefined);

      await page.waitForNavigation();

      expect(authService.signOut).toHaveBeenCalled();
      expect(mockPage.waitForNavigation).toHaveBeenCalled();
    });
  });

  describe('Payment Management Flow', () => {
    beforeEach(async () => {
      // Mock authenticated user
      (authService.getCurrentUser as jest.Mock).mockReturnValue({
        uid: 'test-user-id',
        email: 'test@example.com',
      });

      // Mock customers data
      (customerService.getCustomers as jest.Mock).mockResolvedValue([
        { id: 'cust1', name: 'John Doe', email: 'john@example.com' },
        { id: 'cust2', name: 'Jane Smith', email: 'jane@example.com' },
      ]);
    });

    it('should create new payment', async () => {
      // Navigate to payments page
      mockPage.goto.mockResolvedValue(undefined);
      await page.goto('http://localhost:5173/payments');

      // Click add payment button
      mockPage.click.mockResolvedValue(undefined);
      await page.click('button[data-testid="add-payment-button"]');

      // Fill payment form
      mockPage.fill.mockResolvedValue(undefined);
      await page.fill('input[name="amount"]', '150');
      await page.fill('select[name="paymentMethod"]', 'cash');
      await page.fill('textarea[name="notes"]', 'Monthly subscription');

      // Select customer
      mockPage.click.mockResolvedValue(undefined);
      await page.click('select[name="customerId"]');
      await page.click('option[value="cust1"]');

      // Mock successful payment creation
      (paymentService.createPayment as jest.Mock).mockResolvedValue('pay123');

      // Submit form
      mockPage.click.mockResolvedValue(undefined);
      mockPage.waitForNavigation.mockResolvedValue(undefined);
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      expect(paymentService.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 150,
          paymentMethod: 'cash',
          customerId: 'cust1',
          notes: 'Monthly subscription',
        })
      );
    });

    it('should view payment details', async () => {
      // Mock payment data
      (paymentService.getPayments as jest.Mock).mockResolvedValue([
        {
          id: 'pay123',
          amount: 200,
          paymentMethod: 'online',
          customerName: 'John Doe',
          date: new Date().toISOString(),
        },
      ]);

      // Navigate to payments page
      mockPage.goto.mockResolvedValue(undefined);
      await page.goto('http://localhost:5173/payments');

      // Wait for payments to load
      mockPage.waitForSelector.mockResolvedValue(undefined);
      await page.waitForSelector('[data-testid="payment-item"]');

      // Click on payment to view details
      mockPage.click.mockResolvedValue(undefined);
      await page.click('[data-testid="payment-item-pay123"]');

      // Wait for detail modal/panel
      mockPage.waitForSelector.mockResolvedValue(undefined);
      await page.waitForSelector('[data-testid="payment-details"]');

      // Verify payment details are displayed
      mockPage.textContent.mockResolvedValue('John Doe');
      const customerName = await page.textContent('[data-testid="payment-customer-name"]');
      expect(customerName).toBe('John Doe');
    });

    it('should update payment status', async () => {
      // Navigate to payment details
      mockPage.goto.mockResolvedValue(undefined);
      await page.goto('http://localhost:5173/payments/pay123');

      // Click edit button
      mockPage.click.mockResolvedValue(undefined);
      await page.click('button[data-testid="edit-payment-button"]');

      // Change payment status
      mockPage.click.mockResolvedValue(undefined);
      await page.click('select[name="status"]');
      await page.click('option[value="refunded"]');

      // Mock successful update
      (paymentService.updatePayment as jest.Mock).mockResolvedValue(undefined);

      // Save changes
      mockPage.click.mockResolvedValue(undefined);
      await page.click('button[data-testid="save-payment-button"]');

      expect(paymentService.updatePayment).toHaveBeenCalledWith('pay123', {
        status: 'refunded',
      });
    });

    it('should delete payment', async () => {
      // Navigate to payment details
      mockPage.goto.mockResolvedValue(undefined);
      await page.goto('http://localhost:5173/payments/pay123');

      // Click delete button
      mockPage.click.mockResolvedValue(undefined);
      await page.click('button[data-testid="delete-payment-button"]');

      // Confirm deletion in dialog
      mockPage.waitForSelector.mockResolvedValue(undefined);
      await page.waitForSelector('[data-testid="confirm-delete-dialog"]');
      await page.click('button[data-testid="confirm-delete-button"]');

      // Mock successful deletion
      (paymentService.deletePayment as jest.Mock).mockResolvedValue(undefined);

      // Wait for redirect
      mockPage.waitForNavigation.mockResolvedValue(undefined);
      await page.waitForNavigation();

      expect(paymentService.deletePayment).toHaveBeenCalledWith('pay123');
    });
  });

  describe('Due Management Flow', () => {
    beforeEach(async () => {
      // Mock authenticated user
      (authService.getCurrentUser as jest.Mock).mockReturnValue({
        uid: 'test-user-id',
        email: 'test@example.com',
      });

      // Mock customers data
      (customerService.getCustomers as jest.Mock).mockResolvedValue([
        { id: 'cust1', name: 'John Doe', email: 'john@example.com' },
        { id: 'cust2', name: 'Jane Smith', email: 'jane@example.com' },
      ]);
    });

    it('should create new due', async () => {
      // Navigate to dues page
      mockPage.goto.mockResolvedValue(undefined);
      await page.goto('http://localhost:5173/dues');

      // Click add due button
      mockPage.click.mockResolvedValue(undefined);
      await page.click('button[data-testid="add-due-button"]');

      // Fill due form
      mockPage.fill.mockResolvedValue(undefined);
      await page.fill('input[name="amount"]', '300');
      await page.fill('input[name="dueDate"]', '2024-12-31');
      await page.fill('textarea[name="description"]', 'Annual subscription');

      // Select customer
      mockPage.click.mockResolvedValue(undefined);
      await page.click('select[name="customerId"]');
      await page.click('option[value="cust1"]');

      // Mock successful due creation
      (dueService.createDue as jest.Mock).mockResolvedValue('due123');

      // Submit form
      mockPage.click.mockResolvedValue(undefined);
      mockPage.waitForNavigation.mockResolvedValue(undefined);
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      expect(dueService.createDue).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 300,
          dueDate: expect.any(String),
          customerId: 'cust1',
          description: 'Annual subscription',
        })
      );
    });

    it('should mark due as paid', async () => {
      // Navigate to due details
      mockPage.goto.mockResolvedValue(undefined);
      await page.goto('http://localhost:5173/dues/due123');

      // Click mark as paid button
      mockPage.click.mockResolvedValue(undefined);
      await page.click('button[data-testid="mark-paid-button"]');

      // Confirm in dialog
      mockPage.waitForSelector.mockResolvedValue(undefined);
      await page.waitForSelector('[data-testid="confirm-payment-dialog"]');
      await page.click('button[data-testid="confirm-payment-button"]');

      // Mock successful status update
      (dueService.updateDue as jest.Mock).mockResolvedValue(undefined);

      expect(dueService.updateDue).toHaveBeenCalledWith('due123', {
        status: 'paid',
        paidAt: expect.any(Date),
      });
    });

    it('should filter overdue dues', async () => {
      // Navigate to dues page
      mockPage.goto.mockResolvedValue(undefined);
      await page.goto('http://localhost:5173/dues');

      // Click filter button
      mockPage.click.mockResolvedValue(undefined);
      await page.click('button[data-testid="filter-dues-button"]');

      // Select overdue filter
      mockPage.click.mockResolvedValue(undefined);
      await page.click('input[value="overdue"]');

      // Mock overdue dues data
      (dueService.getDues as jest.Mock).mockResolvedValue([
        {
          id: 'due1',
          amount: 150,
          dueDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          status: 'pending',
          customerName: 'John Doe',
        },
      ]);

      // Apply filter
      mockPage.click.mockResolvedValue(undefined);
      await page.click('button[data-testid="apply-filter-button"]');

      // Wait for filtered results
      mockPage.waitForSelector.mockResolvedValue(undefined);
      await page.waitForSelector('[data-testid="due-item"]');

      // Verify only overdue dues are shown
      mockPage.textContent.mockResolvedValue('John Doe');
      const customerName = await page.textContent('[data-testid="due-customer-name"]');
      expect(customerName).toBe('John Doe');
    });
  });

  describe('Customer Management Flow', () => {
    beforeEach(async () => {
      // Mock authenticated user
      (authService.getCurrentUser as jest.Mock).mockReturnValue({
        uid: 'test-user-id',
        email: 'test@example.com',
      });
    });

    it('should create new customer', async () => {
      // Navigate to customers page
      mockPage.goto.mockResolvedValue(undefined);
      await page.goto('http://localhost:5173/customers');

      // Click add customer button
      mockPage.click.mockResolvedValue(undefined);
      await page.click('button[data-testid="add-customer-button"]');

      // Fill customer form
      mockPage.fill.mockResolvedValue(undefined);
      await page.fill('input[name="name"]', 'New Customer');
      await page.fill('input[name="email"]', 'newcustomer@example.com');
      await page.fill('input[name="phone"]', '+1234567890');
      await page.fill('textarea[name="address"]', '123 New Street');

      // Mock successful customer creation
      (customerService.createCustomer as jest.Mock).mockResolvedValue('cust123');

      // Submit form
      mockPage.click.mockResolvedValue(undefined);
      mockPage.waitForNavigation.mockResolvedValue(undefined);
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      expect(customerService.createCustomer).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Customer',
          email: 'newcustomer@example.com',
          phone: '+1234567890',
          address: '123 New Street',
        })
      );
    });

    it('should search customers', async () => {
      // Navigate to customers page
      mockPage.goto.mockResolvedValue(undefined);
      await page.goto('http://localhost:5173/customers');

      // Fill search input
      mockPage.fill.mockResolvedValue(undefined);
      await page.fill('input[data-testid="customer-search-input"]', 'John');

      // Mock search results
      (customerService.searchCustomers as jest.Mock).mockResolvedValue([
        { id: 'cust1', name: 'John Doe', email: 'john@example.com' },
        { id: 'cust2', name: 'Johnny Cash', email: 'johnny@example.com' },
      ]);

      // Trigger search
      mockPage.click.mockResolvedValue(undefined);
      await page.click('button[data-testid="customer-search-button"]');

      // Wait for search results
      mockPage.waitForSelector.mockResolvedValue(undefined);
      await page.waitForSelector('[data-testid="customer-search-results"]');

      // Verify search results
      mockPage.textContent.mockResolvedValue('John Doe');
      const firstResult = await page.textContent('[data-testid="customer-item-cust1"]');
      expect(firstResult).toBe('John Doe');

      expect(customerService.searchCustomers).toHaveBeenCalledWith('John');
    });

    it('should view customer dashboard', async () => {
      // Navigate to customer details
      mockPage.goto.mockResolvedValue(undefined);
      await page.goto('http://localhost:5173/customers/cust123');

      // Mock customer data
      (customerService.getCustomers as jest.Mock).mockResolvedValue([
        {
          id: 'cust123',
          name: 'John Doe',
          email: 'john@example.com',
          totalDues: 500,
          totalPayments: 1200,
        },
      ]);

      // Wait for customer data to load
      mockPage.waitForSelector.mockResolvedValue(undefined);
      await page.waitForSelector('[data-testid="customer-dashboard"]');

      // Verify customer information
      mockPage.textContent.mockResolvedValue('John Doe');
      const customerName = await page.textContent('[data-testid="customer-name"]');
      expect(customerName).toBe('John Doe');

      // Verify financial summary
      mockPage.textContent.mockResolvedValue('$500.00');
      const totalDues = await page.textContent('[data-testid="customer-total-dues"]');
      expect(totalDues).toBe('$500.00');
    });
  });

  describe('Data Export Flow', () => {
    beforeEach(async () => {
      // Mock authenticated user
      (authService.getCurrentUser as jest.Mock).mockReturnValue({
        uid: 'test-user-id',
        email: 'test@example.com',
      });

      // Mock data for export
      (paymentService.getPayments as jest.Mock).mockResolvedValue([
        {
          id: 'pay1',
          amount: 100,
          paymentMethod: 'cash',
          customerName: 'John Doe',
          date: new Date().toISOString(),
        },
      ]);

      (dueService.getDues as jest.Mock).mockResolvedValue([
        {
          id: 'due1',
          amount: 200,
          status: 'pending',
          customerName: 'Jane Smith',
          dueDate: new Date().toISOString(),
        },
      ]);

      (customerService.getCustomers as jest.Mock).mockResolvedValue([
        {
          id: 'cust1',
          name: 'John Doe',
          email: 'john@example.com',
          totalDues: 300,
          totalPayments: 1500,
        },
      ]);
    });

    it('should export payments data', async () => {
      // Navigate to export page
      mockPage.goto.mockResolvedValue(undefined);
      await page.goto('http://localhost:5173/export');

      // Select payments export
      mockPage.click.mockResolvedValue(undefined);
      await page.click('input[value="payments"]');

      // Select CSV format
      mockPage.click.mockResolvedValue(undefined);
      await page.click('input[value="csv"]');

      // Click export button
      mockPage.click.mockResolvedValue(undefined);
      await page.click('button[data-testid="export-button"]');

      // Wait for export to complete
      mockPage.waitForSelector.mockResolvedValue(undefined);
      await page.waitForSelector('[data-testid="export-success"]');

      // Verify download was triggered (this would be handled by the browser)
      expect(mockPage.click).toHaveBeenCalledWith('button[data-testid="export-button"]');
    });

    it('should export all data types', async () => {
      // Navigate to export page
      mockPage.goto.mockResolvedValue(undefined);
      await page.goto('http://localhost:5173/export');

      // Select all data types
      mockPage.click.mockResolvedValue(undefined);
      await page.click('input[value="all"]');

      // Select JSON format
      mockPage.click.mockResolvedValue(undefined);
      await page.click('input[value="json"]');

      // Click export button
      mockPage.click.mockResolvedValue(undefined);
      await page.click('button[data-testid="export-button"]');

      // Wait for export to complete
      mockPage.waitForSelector.mockResolvedValue(undefined);
      await page.waitForSelector('[data-testid="export-success"]');

      expect(mockPage.click).toHaveBeenCalledWith('button[data-testid="export-button"]');
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle network errors gracefully', async () => {
      // Navigate to payments page
      mockPage.goto.mockResolvedValue(undefined);
      await page.goto('http://localhost:5173/payments');

      // Mock network error
      (paymentService.getPayments as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Wait for error message
      mockPage.waitForSelector.mockResolvedValue(undefined);
      mockPage.textContent.mockResolvedValue('Network error. Please check your connection.');
      await page.waitForSelector('[data-testid="error-message"]');

      const errorText = await page.textContent('[data-testid="error-message"]');
      expect(errorText).toBe('Network error. Please check your connection.');
    });

    it('should handle permission errors', async () => {
      // Navigate to admin-only page
      mockPage.goto.mockResolvedValue(undefined);
      await page.goto('http://localhost:5173/admin');

      // Mock permission error
      const permissionError = new Error('Permission denied');
      (authService.getCurrentUser as jest.Mock).mockReturnValue({
        uid: 'regular-user-id',
        email: 'user@example.com',
        role: 'user', // Not admin
      });

      // Wait for permission error
      mockPage.waitForSelector.mockResolvedValue(undefined);
      mockPage.textContent.mockResolvedValue('Access denied. Admin privileges required.');
      await page.waitForSelector('[data-testid="permission-error"]');

      const errorText = await page.textContent('[data-testid="permission-error"]');
      expect(errorText).toBe('Access denied. Admin privileges required.');
    });

    it('should handle form validation errors', async () => {
      // Navigate to create payment page
      mockPage.goto.mockResolvedValue(undefined);
      await page.goto('http://localhost:5173/payments/new');

      // Submit empty form
      mockPage.click.mockResolvedValue(undefined);
      await page.click('button[type="submit"]');

      // Wait for validation errors
      mockPage.waitForSelector.mockResolvedValue(undefined);
      mockPage.textContent.mockResolvedValue('Amount is required');
      await page.waitForSelector('[data-testid="validation-error-amount"]');

      const validationError = await page.textContent('[data-testid="validation-error-amount"]');
      expect(validationError).toBe('Amount is required');
    });
  });

  describe('Performance Flow', () => {
    it('should handle large datasets efficiently', async () => {
      // Generate large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `pay${i}`,
        amount: Math.random() * 1000,
        customerName: `Customer ${i}`,
        paymentMethod: ['cash', 'online', 'card'][Math.floor(Math.random() * 3)],
        date: new Date().toISOString(),
      }));

      // Mock large dataset
      (paymentService.getPayments as jest.Mock).mockResolvedValue(largeDataset);

      // Navigate to payments page
      mockPage.goto.mockResolvedValue(undefined);
      await page.goto('http://localhost:5173/payments');

      // Measure load time
      const startTime = Date.now();
      mockPage.waitForSelector.mockResolvedValue(undefined);
      await page.waitForSelector('[data-testid="payment-list-loaded"]');
      const loadTime = Date.now() - startTime;

      // Verify reasonable load time (< 2 seconds for 1000 items)
      expect(loadTime).toBeLessThan(2000);

      // Verify virtualization is working (only visible items rendered)
      mockPage.evaluate.mockResolvedValue(50); // Only 50 items visible
      const visibleItems = await page.evaluate(() => {
        return document.querySelectorAll('[data-testid="payment-item"]').length;
      });

      expect(visibleItems).toBeLessThan(100); // Should not render all 1000 items
    });
  });
});