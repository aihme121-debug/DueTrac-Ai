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

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  REMINDER = 'reminder',
  PAYMENT_DUE = 'payment_due',
  PAYMENT_RECEIVED = 'payment_received',
  CUSTOMER_CREATED = 'customer_created',
  DUE_OVERDUE = 'due_overdue',
  SYSTEM = 'system'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  PUSH = 'push',
  EMAIL = 'email',
  SMS = 'sms'
}

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  type: 'primary' | 'secondary' | 'danger';
  url?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  actions?: NotificationAction[];
  data?: Record<string, any>;
  read: boolean;
  archived: boolean;
  scheduledFor?: string; // ISO Date String for scheduled notifications
  expiresAt?: string; // ISO Date String for notification expiration
  createdAt: string;
  updatedAt: string;
  readAt?: string;
  clickedAt?: string;
  clickedCount: number;
  tags?: string[];
  icon?: string;
  sound?: string;
  badge?: number;
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    inApp: boolean;
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  types: {
    [key in NotificationType]: {
      enabled: boolean;
      channels: NotificationChannel[];
      priority: NotificationPriority;
    };
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
  dailyDigest: {
    enabled: boolean;
    time: string; // HH:mm format
  };
  updatedAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
  lastNotificationAt?: string;
}