import { db, isConfigured } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { Customer, DueItem, PaymentStatus, PaymentTransaction } from '../types';

const CUSTOMERS_COL = 'customers';
const DUES_COL = 'dues';
const PAYMENTS_COL = 'payments';
 

// Disable seeding and local storage usage to enforce DB-only data
const seedDataIfNeeded = async () => {};

  
export const StorageService = {
  getCustomers: async (): Promise<Customer[]> => {
    if (!isConfigured || !db) {
      return [];
    }
    const snapshot = await getDocs(collection(db, CUSTOMERS_COL));
    return snapshot.docs.map(doc => doc.data() as Customer);
  },

  saveCustomer: async (customer: Customer): Promise<void> => {
    if (!isConfigured || !db) {
      throw new Error('Firebase not configured');
    }
    try {
      const docRef = doc(db, CUSTOMERS_COL, customer.id);
      await setDoc(docRef, customer, { merge: true });
    } catch (error) {
      console.error("Failed to save customer:", (error as any).message);
      throw error;
    }
  },

  getDues: async (): Promise<DueItem[]> => {
    if (!isConfigured || !db) {
      return [];
    }
    const snapshot = await getDocs(collection(db, DUES_COL));
    return snapshot.docs.map(doc => doc.data() as DueItem);
  },

  saveDue: async (due: DueItem): Promise<void> => {
    if (!isConfigured || !db) {
      throw new Error('Firebase not configured');
    }
    try {
      const cleanDue = JSON.parse(JSON.stringify(due, (key, value) => {
        return value === undefined ? null : value;
      }));
      
      const docRef = doc(db, DUES_COL, due.id);
      await setDoc(docRef, cleanDue, { merge: true });
    } catch (error) {
      console.error("Failed to save due:", (error as any).message);
      throw error;
    }
  },

  deleteDue: async (id: string): Promise<void> => {
    if (!isConfigured || !db) {
      throw new Error('Firebase not configured');
    }
    
    // First, get the due item to find the associated customer
    const dues = await StorageService.getDues();
    const dueToDelete = dues.find(due => due.id === id);
    
    if (!dueToDelete) {
      throw new Error('Due item not found');
    }
    
    // Delete the due item
    await deleteDoc(doc(db, DUES_COL, id));
    
    // Check if this customer has any other dues
    const customerId = dueToDelete.customerId;
    const customerDues = dues.filter(due => due.customerId === customerId && due.id !== id);
    
    // If this was the only due for this customer, delete the customer too
    if (customerDues.length === 0) {
      await deleteDoc(doc(db, CUSTOMERS_COL, customerId));
    }
  },

  getDuesWithCustomers: async (): Promise<(DueItem & { customer: Customer | undefined })[]> => {
    // We can reuse the getDues and getCustomers methods which handle the split logic
    const [dues, customers] = await Promise.all([
      StorageService.getDues(),
      StorageService.getCustomers()
    ]);

    const customerMap = new Map(customers.map(c => [c.id, c]));

    // Check for status updates based on date (e.g., auto-mark overdue)
    // We only update if necessary to avoid write loops
    const updates: Promise<void>[] = [];
    
    const updatedDues = dues.map(due => {
      const isOverdue = new Date(due.dueDate) < new Date() && due.paidAmount < due.amount;
      if (isOverdue && due.status !== PaymentStatus.PAID && due.status !== PaymentStatus.OVERDUE) {
        const updatedDue = { ...due, status: PaymentStatus.OVERDUE };
        updates.push(StorageService.saveDue(updatedDue));
        return updatedDue;
      }
      return due;
    });

    // Fire and forget updates
    if (updates.length > 0) {
      Promise.all(updates).catch(console.error);
    }

    return updatedDues.map(due => ({
      ...due,
      customer: customerMap.get(due.customerId)
    })).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  },

  // Payment-related methods
  getPayments: async (): Promise<PaymentTransaction[]> => {
    if (!isConfigured || !db) {
      return [];
    }
    const snapshot = await getDocs(collection(db, PAYMENTS_COL));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PaymentTransaction));
  },

  addPayment: async (paymentData: Omit<PaymentTransaction, 'id' | 'createdAt'>): Promise<string> => {
    if (!isConfigured || !db) {
      throw new Error('Firebase not configured');
    }

    try {
      // Create payment record
      const payment: Omit<PaymentTransaction, 'id'> = {
        ...paymentData,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, PAYMENTS_COL), payment);
      const paymentId = docRef.id;

      // Update the associated due item
      const due = await StorageService.getDues().then(dues => dues.find(d => d.id === paymentData.dueId));
      if (due) {
        const updatedPaidAmount = due.paidAmount + paymentData.amount;
        const updatedStatus = updatedPaidAmount >= due.amount ? PaymentStatus.PAID : 
                           updatedPaidAmount > 0 ? PaymentStatus.PARTIAL : PaymentStatus.PENDING;

        const updatedDue: DueItem = {
          ...due,
          paidAmount: updatedPaidAmount,
          status: updatedStatus,
          lastPaymentDate: paymentData.paymentDate,
          paymentHistory: [
            ...(due.paymentHistory || []),
            {
              id: paymentId,
              date: paymentData.paymentDate,
              amount: paymentData.amount,
              note: paymentData.notes || 'Payment recorded'
            }
          ]
        };

        await StorageService.saveDue(updatedDue);
      }

      return paymentId;
    } catch (error) {
      console.error('Failed to add payment:', (error as any).message);
      throw error;
    }
  },

  deletePayment: async (paymentId: string): Promise<void> => {
    if (!isConfigured || !db) {
      throw new Error('Firebase not configured');
    }

    try {
      
      // First, get the payment to find the associated due
      const payments = await StorageService.getPayments();
      const paymentToDelete = payments.find(p => p.id === paymentId);
      
      if (!paymentToDelete) {
        throw new Error('Payment not found');
      }

      // Delete the payment
      await deleteDoc(doc(db, PAYMENTS_COL, paymentId));
      // Payment deleted successfully

      // Update the associated due item
      const due = await StorageService.getDues().then(dues => dues.find(d => d.id === paymentToDelete.dueId));
      if (due) {
        const updatedPaidAmount = Math.max(0, due.paidAmount - paymentToDelete.amount);
        const updatedStatus = updatedPaidAmount >= due.amount ? PaymentStatus.PAID : 
                           updatedPaidAmount > 0 ? PaymentStatus.PARTIAL : PaymentStatus.PENDING;

        const updatedDue: DueItem = {
          ...due,
          paidAmount: updatedPaidAmount,
          status: updatedStatus,
          paymentHistory: (due.paymentHistory || []).filter(p => p.id !== paymentId)
        };

        await StorageService.saveDue(updatedDue);
      }
    } catch (error) {
      console.error('Failed to delete payment:', (error as any).message);
      throw error;
    }
  },

  // Notification read status methods



};