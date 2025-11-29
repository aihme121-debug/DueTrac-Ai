import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DynamicFirebaseService } from '../services/dynamicFirebaseService';
import { SecurityService } from '../services/securityService';

// Mock Firebase
vi.mock('../services/firebase', () => ({
  db: {
    collection: vi.fn(),
    doc: vi.fn(),
  },
  isConfigured: true,
}));

describe('Dynamic Architecture Tests', () => {
  let dynamicService: DynamicFirebaseService;
  let securityService: SecurityService;

  beforeEach(() => {
    dynamicService = DynamicFirebaseService.getInstance();
    securityService = SecurityService.getInstance();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('DynamicFirebaseService', () => {
    it('should be a singleton', () => {
      const instance1 = DynamicFirebaseService.getInstance();
      const instance2 = DynamicFirebaseService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should handle cache operations', async () => {
      const testData = { id: 'test-1', name: 'Test Item' };
      const cacheKey = 'test-collection';
      
      // Mock cache entry
      const cacheEntry = {
        data: [testData],
        timestamp: Date.now(),
        expiresAt: Date.now() + 300000, // 5 minutes
      };

      // Test cache set/get
      (dynamicService as any).cache.set(cacheKey, cacheEntry);
      const cached = (dynamicService as any).cache.get(cacheKey);
      
      expect(cached).toBeDefined();
      expect(cached.data).toEqual([testData]);
    });

    it('should handle cache expiration', async () => {
      const testData = { id: 'test-1', name: 'Test Item' };
      const cacheKey = 'test-collection';
      
      // Mock expired cache entry
      const expiredEntry = {
        data: [testData],
        timestamp: Date.now() - 600000, // 10 minutes ago
        expiresAt: Date.now() - 300000, // Expired 5 minutes ago
      };

      (dynamicService as any).cache.set(cacheKey, expiredEntry);
      const isExpired = (dynamicService as any).isCacheExpired(cacheKey);
      
      expect(isExpired).toBe(true);
    });

    it('should sanitize data correctly', () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>',
        description: 'Normal text',
        html: '<div onclick="alert(\'hack\')">Click me</div>',
      };

      const sanitized = (dynamicService as any).sanitizeData(maliciousData);
      
      expect(sanitized.name).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(sanitized.description).toBe('Normal text');
      expect(sanitized.html).toBe('&lt;div onclick=&quot;alert(hack)&quot;&gt;Click me&lt;/div&gt;');
    });

    it('should validate pagination options', () => {
      const validOptions = {
        page: 1,
        pageSize: 10,
        orderBy: 'name',
        orderDirection: 'asc' as const,
      };

      const invalidOptions = {
        page: -1,
        pageSize: 1000,
        orderBy: '',
        orderDirection: 'invalid' as any,
      };

      const validResult = (dynamicService as any).validatePaginationOptions(validOptions);
      const invalidResult = (dynamicService as any).validatePaginationOptions(invalidOptions);

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Page must be a positive number');
    });

    it('should handle performance metrics', () => {
      const collectionName = 'test-collection';
      const startTime = Date.now();
      
      // Simulate some operation
      setTimeout(() => {
        (dynamicService as any).recordMetric(collectionName, 'query', Date.now() - startTime);
      }, 100);

      const metrics = (dynamicService as any).getPerformanceMetrics(collectionName);
      expect(metrics).toBeDefined();
      expect(Array.isArray(metrics)).toBe(true);
    });
  });

  describe('SecurityService', () => {
    it('should validate user permissions', () => {
      const mockUser = {
        id: 'user-1',
        role: 'admin',
        email: 'admin@example.com',
      };

      securityService.setCurrentUser(mockUser);
      
      const hasReadPermission = securityService.hasPermission('dues', 'read');
      const hasWritePermission = securityService.hasPermission('dues', 'write');
      
      expect(hasReadPermission).toBe(true);
      expect(hasWritePermission).toBe(true);
    });

    it('should sanitize input data', () => {
      const input = {
        name: '<script>alert("xss")</script>',
        amount: 100,
        description: 'Normal description',
      };

      const sanitized = securityService.sanitizeData(input);
      
      expect(sanitized.name).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(sanitized.amount).toBe(100);
      expect(sanitized.description).toBe('Normal description');
    });

    it('should validate data against schemas', () => {
      const schema = {
        name: { type: 'string', required: true, minLength: 3 },
        amount: { type: 'number', required: true, min: 0 },
        email: { type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      };

      const validData = {
        name: 'John Doe',
        amount: 100,
        email: 'john@example.com',
      };

      const invalidData = {
        name: 'Jo',
        amount: -50,
        email: 'invalid-email',
      };

      const validResult = securityService.validateData(validData, schema);
      const invalidResult = securityService.validateData(invalidData, schema);

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toHaveLength(3);
    });

    it('should handle rate limiting', async () => {
      const userId = 'test-user';
      const action = 'create_due';
      const limit = 5;
      const windowMs = 60000; // 1 minute

      // Simulate multiple requests
      for (let i = 0; i < limit; i++) {
        const result = await securityService.checkRateLimit(userId, action, limit, windowMs);
        expect(result.allowed).toBe(true);
      }

      // This should be rate limited
      const limitedResult = await securityService.checkRateLimit(userId, action, limit, windowMs);
      expect(limitedResult.allowed).toBe(false);
    });

    it('should encrypt and decrypt sensitive data', () => {
      const sensitiveData = 'password123';
      
      const encrypted = securityService.encryptSensitiveData(sensitiveData);
      const decrypted = securityService.decryptSensitiveData(encrypted);
      
      expect(encrypted).not.toBe(sensitiveData);
      expect(decrypted).toBe(sensitiveData);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete data flow with security', async () => {
      const mockUser = {
        id: 'user-1',
        role: 'user',
        email: 'user@example.com',
      };

      securityService.setCurrentUser(mockUser);

      const testData = {
        name: 'Test Due',
        amount: 100,
        description: '<script>alert("xss")</script>',
      };

      // Sanitize data
      const sanitizedData = securityService.sanitizeData(testData);
      
      // Check permissions
      const hasPermission = securityService.hasPermission('dues', 'create', sanitizedData);
      
      expect(sanitizedData.description).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(hasPermission).toBe(true);
    });

    it('should handle caching with security constraints', async () => {
      const collectionName = 'secure-data';
      const userId = 'user-1';
      
      const mockData = [
        { id: '1', name: 'Item 1', userId },
        { id: '2', name: 'Item 2', userId: 'other-user' },
      ];

      // Mock cache with security filtering
      const cacheEntry = {
        data: mockData.filter(item => item.userId === userId),
        timestamp: Date.now(),
        expiresAt: Date.now() + 300000,
      };

      (dynamicService as any).cache.set(`${collectionName}_${userId}`, cacheEntry);
      
      const cachedData = (dynamicService as any).getCachedData(`${collectionName}_${userId}`, userId);
      expect(cachedData).toHaveLength(1);
      expect(cachedData[0].id).toBe('1');
    });
  });

  describe('Performance Tests', () => {
    it('should handle large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        name: `Item ${i}`,
        value: Math.random() * 1000,
      }));

      const startTime = performance.now();
      
      // Simulate processing large dataset
      const processed = largeDataset.map(item => ({
        ...item,
        sanitizedName: securityService.sanitizeData({ name: item.name }).name,
      }));
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      expect(processed).toHaveLength(1000);
      expect(processingTime).toBeLessThan(100); // Should process in under 100ms
    });

    it('should handle concurrent requests', async () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          new Promise((resolve) => {
            setTimeout(() => {
              const data = { id: `item-${i}`, name: `Item ${i}` };
              const sanitized = securityService.sanitizeData(data);
              resolve(sanitized);
            }, Math.random() * 50);
          })
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      expect(results.every(result => result && result.id)).toBe(true);
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle invalid data gracefully', () => {
      const invalidData = {
        name: null,
        amount: 'invalid',
        dueDate: 'not-a-date',
      };

      const schema = {
        name: { type: 'string', required: true },
        amount: { type: 'number', required: true },
        dueDate: { type: 'string', required: true },
      };

      const result = securityService.validateData(invalidData, schema);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
    });

    it('should handle missing user permissions', () => {
      securityService.setCurrentUser(null);
      
      const hasPermission = securityService.hasPermission('dues', 'write');
      expect(hasPermission).toBe(false);
    });

    it('should handle cache errors gracefully', () => {
      const invalidCacheKey = null as any;
      
      expect(() => {
        (dynamicService as any).getCachedData(invalidCacheKey);
      }).not.toThrow();
    });
  });
});