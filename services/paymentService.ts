import { PaymentTransaction } from '../types';

// Mock payment service for now
export const paymentService = {
  getAllPayments: async (): Promise<PaymentTransaction[]> => {
    // Return mock data for now
    return [];
  }
};