import { DueItem } from '../types';

// Mock due service for now
export const dueService = {
  getAllDues: async (): Promise<DueItem[]> => {
    // Return mock data for now
    return [];
  }
};