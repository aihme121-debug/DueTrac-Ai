export enum PaymentStatus {
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL'
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
  address?: string;
}

export interface PaymentRecord {
  id: string;
  date: string; // ISO Date String
  amount: number;
  note?: string;
}

export interface PaymentTransaction {
  id: string;
  customerId: string;
  dueId: string;
  amount: number;
  paymentDate: string; // ISO Date String
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'other';
  notes?: string;
  createdAt: string;
}

export interface PromiseRecord {
  id: string;
  promisedDate: string; // The date they promised to pay
  createdAt: string; // When this promise was recorded
  status: 'PENDING' | 'BROKEN' | 'KEPT';
  note?: string;
}

export interface DueItem {
  id: string;
  customerId: string;
  amount: number;
  paidAmount: number;
  dueDate: string; // ISO Date String (Next Payment Date)
  title: string;
  status: PaymentStatus;
  createdAt: string;
  
  // New Fields
  shortNote?: string;
  lastPaymentDate?: string; // ISO Date String
  lastPaymentAgreedDate?: string; // ISO Date String (The date they promised but might have missed)
  paymentHistory?: PaymentRecord[];
  promiseHistory?: PromiseRecord[]; // Track history of all promises
  phoneNumber?: string; // Customer phone number for quick contact
  address?: string; // Customer address for location tracking
}

export interface DueWithCustomer extends DueItem {
  customer: Customer;
}

export interface DashboardStats {
  totalDue: number;
  totalCollected: number;
  overdueCount: number;
  upcomingCount: number;
}