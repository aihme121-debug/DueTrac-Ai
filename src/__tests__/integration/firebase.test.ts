import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock Firebase modules
const mockAuth = {
  currentUser: null,
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
};

const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
};

const mockStorage = {
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
};

// Mock Firebase app
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  getApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => mockAuth),
  signInWithEmailAndPassword: mockAuth.signInWithEmailAndPassword,
  createUserWithEmailAndPassword: mockAuth.createUserWithEmailAndPassword,
  signOut: mockAuth.signOut,
  onAuthStateChanged: mockAuth.onAuthStateChanged,
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => mockFirestore),
  collection: mockFirestore.collection,
  doc: mockFirestore.doc,
  addDoc: mockFirestore.addDoc,
  getDoc: mockFirestore.getDoc,
  getDocs: mockFirestore.getDocs,
  updateDoc: mockFirestore.updateDoc,
  deleteDoc: mockFirestore.deleteDoc,
  query: mockFirestore.query,
  where: mockFirestore.where,
  orderBy: mockFirestore.orderBy,
  limit: mockFirestore.limit,
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => mockStorage),
  ref: mockStorage.ref,
  uploadBytes: mockStorage.uploadBytes,
  getDownloadURL: mockStorage.getDownloadURL,
  deleteObject: mockStorage.deleteObject,
}));

// Import the service after mocking
import { authService } from '../../services/authService';
import { paymentService } from '../../services/paymentService';
import { dueService } from '../../services/dueService';
import { customerService } from '../../services/customerService';

describe('Firebase Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Authentication Service', () => {
    it('should sign in user with email and password', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' };
      mockAuth.signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

      const result = await authService.signIn('test@example.com', 'password123');

      expect(mockAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'test@example.com',
        'password123'
      );
      expect(result).toEqual(mockUser);
    });

    it('should handle sign in errors', async () => {
      const mockError = new Error('Invalid credentials');
      mockAuth.signInWithEmailAndPassword.mockRejectedValue(mockError);

      await expect(authService.signIn('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should create new user with email and password', async () => {
      const mockUser = { uid: '456', email: 'newuser@example.com' };
      mockAuth.createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });

      const result = await authService.signUp('newuser@example.com', 'newpassword123');

      expect(mockAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'newuser@example.com',
        'newpassword123'
      );
      expect(result).toEqual(mockUser);
    });

    it('should sign out user', async () => {
      mockAuth.signOut.mockResolvedValue(undefined);

      await authService.signOut();

      expect(mockAuth.signOut).toHaveBeenCalledWith(mockAuth);
    });

    it('should get current user', () => {
      const mockUser = { uid: '789', email: 'current@example.com' };
      mockAuth.currentUser = mockUser;

      const result = authService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('should handle auth state changes', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      mockAuth.onAuthStateChanged.mockReturnValue(mockUnsubscribe);

      const result = authService.onAuthStateChange(mockCallback);

      expect(mockAuth.onAuthStateChanged).toHaveBeenCalledWith(mockCallback);
      expect(result).toBe(mockUnsubscribe);
    });
  });

  describe('Payment Service', () => {
    const mockPayment = {
      id: 'pay123',
      customerId: 'cust123',
      amount: 100,
      paymentMethod: 'cash',
      date: new Date(),
      status: 'paid',
    };

    it('should create payment document', async () => {
      const mockDocRef = { id: 'pay123' };
      mockFirestore.addDoc.mockResolvedValue(mockDocRef);

      const result = await paymentService.createPayment(mockPayment);

      expect(mockFirestore.collection).toHaveBeenCalledWith('payments');
      expect(mockFirestore.addDoc).toHaveBeenCalled();
      expect(result).toEqual('pay123');
    });

    it('should get payment by ID', async () => {
      const mockDocSnap = {
        exists: () => true,
        data: () => mockPayment,
        id: 'pay123',
      };
      mockFirestore.getDoc.mockResolvedValue(mockDocSnap);

      const result = await paymentService.getPayment('pay123');

      expect(mockFirestore.doc).toHaveBeenCalledWith(expect.anything(), 'pay123');
      expect(mockFirestore.getDoc).toHaveBeenCalled();
      expect(result).toEqual({ ...mockPayment, id: 'pay123' });
    });

    it('should get all payments', async () => {
      const mockQuerySnap = {
        docs: [
          { id: 'pay123', data: () => mockPayment },
          { id: 'pay456', data: () => ({ ...mockPayment, id: 'pay456' }) },
        ],
      };
      mockFirestore.getDocs.mockResolvedValue(mockQuerySnap);

      const result = await paymentService.getPayments();

      expect(mockFirestore.collection).toHaveBeenCalledWith('payments');
      expect(mockFirestore.getDocs).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining({ id: 'pay123' }));
    });

    it('should update payment', async () => {
      const updates = { status: 'refunded' };
      mockFirestore.updateDoc.mockResolvedValue(undefined);

      await paymentService.updatePayment('pay123', updates);

      expect(mockFirestore.doc).toHaveBeenCalledWith(expect.anything(), 'pay123');
      expect(mockFirestore.updateDoc).toHaveBeenCalledWith(expect.anything(), updates);
    });

    it('should delete payment', async () => {
      mockFirestore.deleteDoc.mockResolvedValue(undefined);

      await paymentService.deletePayment('pay123');

      expect(mockFirestore.doc).toHaveBeenCalledWith(expect.anything(), 'pay123');
      expect(mockFirestore.deleteDoc).toHaveBeenCalled();
    });

    it('should get payments by customer', async () => {
      const mockQuerySnap = {
        docs: [
          { id: 'pay123', data: () => ({ ...mockPayment, customerId: 'cust123' }) },
        ],
      };
      mockFirestore.query.mockReturnValue('mockQuery');
      mockFirestore.getDocs.mockResolvedValue(mockQuerySnap);

      const result = await paymentService.getPaymentsByCustomer('cust123');

      expect(mockFirestore.query).toHaveBeenCalled();
      expect(mockFirestore.where).toHaveBeenCalledWith('customerId', '==', 'cust123');
      expect(result).toHaveLength(1);
    });
  });

  describe('Due Service', () => {
    const mockDue = {
      id: 'due123',
      customerId: 'cust123',
      amount: 200,
      dueDate: new Date(),
      status: 'pending',
      description: 'Monthly subscription',
    };

    it('should create due document', async () => {
      const mockDocRef = { id: 'due123' };
      mockFirestore.addDoc.mockResolvedValue(mockDocRef);

      const result = await dueService.createDue(mockDue);

      expect(mockFirestore.collection).toHaveBeenCalledWith('dues');
      expect(mockFirestore.addDoc).toHaveBeenCalled();
      expect(result).toEqual('due123');
    });

    it('should get due by ID', async () => {
      const mockDocSnap = {
        exists: () => true,
        data: () => mockDue,
        id: 'due123',
      };
      mockFirestore.getDoc.mockResolvedValue(mockDocSnap);

      const result = await dueService.getDue('due123');

      expect(mockFirestore.doc).toHaveBeenCalledWith(expect.anything(), 'due123');
      expect(mockFirestore.getDoc).toHaveBeenCalled();
      expect(result).toEqual({ ...mockDue, id: 'due123' });
    });

    it('should get dues by status', async () => {
      const mockQuerySnap = {
        docs: [
          { id: 'due123', data: () => ({ ...mockDue, status: 'pending' }) },
          { id: 'due456', data: () => ({ ...mockDue, id: 'due456', status: 'pending' }) },
        ],
      };
      mockFirestore.query.mockReturnValue('mockQuery');
      mockFirestore.getDocs.mockResolvedValue(mockQuerySnap);

      const result = await dueService.getDuesByStatus('pending');

      expect(mockFirestore.query).toHaveBeenCalled();
      expect(mockFirestore.where).toHaveBeenCalledWith('status', '==', 'pending');
      expect(result).toHaveLength(2);
    });

    it('should get overdue dues', async () => {
      const overdueDate = new Date();
      overdueDate.setDate(overdueDate.getDate() - 1);
      
      const mockQuerySnap = {
        docs: [
          { id: 'due123', data: () => ({ ...mockDue, dueDate: overdueDate, status: 'pending' }) },
        ],
      };
      mockFirestore.query.mockReturnValue('mockQuery');
      mockFirestore.getDocs.mockResolvedValue(mockQuerySnap);

      const result = await dueService.getOverdueDues();

      expect(mockFirestore.query).toHaveBeenCalled();
      expect(mockFirestore.where).toHaveBeenCalledWith('status', '==', 'pending');
      expect(result).toHaveLength(1);
    });

    it('should update due status', async () => {
      mockFirestore.updateDoc.mockResolvedValue(undefined);

      await dueService.updateDueStatus('due123', 'paid');

      expect(mockFirestore.doc).toHaveBeenCalledWith(expect.anything(), 'due123');
      expect(mockFirestore.updateDoc).toHaveBeenCalledWith(expect.anything(), {
        status: 'paid',
        paidAt: expect.any(Date),
      });
    });
  });

  describe('Customer Service', () => {
    const mockCustomer = {
      id: 'cust123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      address: '123 Main St',
      status: 'active',
      createdAt: new Date(),
    };

    it('should create customer document', async () => {
      const mockDocRef = { id: 'cust123' };
      mockFirestore.addDoc.mockResolvedValue(mockDocRef);

      const result = await customerService.createCustomer(mockCustomer);

      expect(mockFirestore.collection).toHaveBeenCalledWith('customers');
      expect(mockFirestore.addDoc).toHaveBeenCalled();
      expect(result).toEqual('cust123');
    });

    it('should get customer by ID', async () => {
      const mockDocSnap = {
        exists: () => true,
        data: () => mockCustomer,
        id: 'cust123',
      };
      mockFirestore.getDoc.mockResolvedValue(mockDocSnap);

      const result = await customerService.getCustomer('cust123');

      expect(mockFirestore.doc).toHaveBeenCalledWith(expect.anything(), 'cust123');
      expect(mockFirestore.getDoc).toHaveBeenCalled();
      expect(result).toEqual({ ...mockCustomer, id: 'cust123' });
    });

    it('should get all customers', async () => {
      const mockQuerySnap = {
        docs: [
          { id: 'cust123', data: () => mockCustomer },
          { id: 'cust456', data: () => ({ ...mockCustomer, id: 'cust456', name: 'Jane Doe' }) },
        ],
      };
      mockFirestore.getDocs.mockResolvedValue(mockQuerySnap);

      const result = await customerService.getCustomers();

      expect(mockFirestore.collection).toHaveBeenCalledWith('customers');
      expect(mockFirestore.getDocs).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining({ id: 'cust123' }));
    });

    it('should search customers by name', async () => {
      const mockQuerySnap = {
        docs: [
          { id: 'cust123', data: () => mockCustomer },
        ],
      };
      mockFirestore.query.mockReturnValue('mockQuery');
      mockFirestore.getDocs.mockResolvedValue(mockQuerySnap);

      const result = await customerService.searchCustomers('John');

      expect(mockFirestore.query).toHaveBeenCalled();
      expect(mockFirestore.where).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].name).toContain('John');
    });

    it('should update customer', async () => {
      const updates = { phone: '+0987654321' };
      mockFirestore.updateDoc.mockResolvedValue(undefined);

      await customerService.updateCustomer('cust123', updates);

      expect(mockFirestore.doc).toHaveBeenCalledWith(expect.anything(), 'cust123');
      expect(mockFirestore.updateDoc).toHaveBeenCalledWith(expect.anything(), updates);
    });

    it('should delete customer', async () => {
      mockFirestore.deleteDoc.mockResolvedValue(undefined);

      await customerService.deleteCustomer('cust123');

      expect(mockFirestore.doc).toHaveBeenCalledWith(expect.anything(), 'cust123');
      expect(mockFirestore.deleteDoc).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network error');
      mockFirestore.getDocs.mockRejectedValue(networkError);

      await expect(paymentService.getPayments()).rejects.toThrow('Network error');
    });

    it('should handle permission denied errors', async () => {
      const permissionError = new Error('Permission denied');
      permissionError.code = 'permission-denied';
      mockFirestore.getDoc.mockRejectedValue(permissionError);

      await expect(customerService.getCustomer('cust123')).rejects.toThrow('Permission denied');
    });

    it('should handle document not found errors', async () => {
      const notFoundError = new Error('Document not found');
      notFoundError.code = 'not-found';
      mockFirestore.getDoc.mockRejectedValue(notFoundError);

      await expect(paymentService.getPayment('nonexistent')).rejects.toThrow('Document not found');
    });

    it('should handle rate limiting errors', async () => {
      const rateLimitError = new Error('Too many requests');
      rateLimitError.code = 'resource-exhausted';
      mockFirestore.addDoc.mockRejectedValue(rateLimitError);

      await expect(dueService.createDue({} as any)).rejects.toThrow('Too many requests');
    });
  });

  describe('Data Validation', () => {
    it('should validate payment data before creation', async () => {
      const invalidPayment = {
        customerId: '',
        amount: -100,
        paymentMethod: 'invalid_method',
      };

      mockFirestore.addDoc.mockImplementation((doc) => {
        const data = doc.data;
        if (!data.customerId || data.amount <= 0) {
          throw new Error('Invalid payment data');
        }
        return Promise.resolve({ id: 'pay123' });
      });

      await expect(paymentService.createPayment(invalidPayment as any)).rejects.toThrow('Invalid payment data');
    });

    it('should validate customer data before creation', async () => {
      const invalidCustomer = {
        name: '',
        email: 'invalid-email',
        phone: '',
      };

      mockFirestore.addDoc.mockImplementation((doc) => {
        const data = doc.data;
        if (!data.name || !data.email.includes('@')) {
          throw new Error('Invalid customer data');
        }
        return Promise.resolve({ id: 'cust123' });
      });

      await expect(customerService.createCustomer(invalidCustomer as any)).rejects.toThrow('Invalid customer data');
    });

    it('should sanitize data before saving', async () => {
      const paymentWithScript = {
        customerId: 'cust123',
        amount: 100,
        paymentMethod: 'cash',
        notes: '<script>alert("XSS")</script>',
      };

      mockFirestore.addDoc.mockImplementation((doc) => {
        const data = doc.data;
        // Check that script tags are removed
        expect(data.notes).not.toContain('<script>');
        return Promise.resolve({ id: 'pay123' });
      });

      await paymentService.createPayment(paymentWithScript as any);
    });
  });
});