import { Customer } from '../types';

// Mock customer service for now
export const customerService = {
  getAllCustomers: async (): Promise<Customer[]> => {
    // Return mock data for now
    return [];
  }
};