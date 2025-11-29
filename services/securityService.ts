import { DocumentData } from 'firebase/firestore';

export interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
  level: number; // Higher number = more permissions
}

export interface Permission {
  resource: string; // e.g., 'users', 'data', 'settings'
  actions: Array<'create' | 'read' | 'update' | 'delete' | 'admin'>;
  conditions?: string[]; // Optional conditions for access
}

export interface SecurityRule {
  id: string;
  name: string;
  resource: string;
  conditions: {
    roles?: string[];
    userId?: boolean; // User can only access their own data
    custom?: string; // Custom condition function
  };
  actions: Array<'create' | 'read' | 'update' | 'delete'>;
  enabled: boolean;
  priority: number; // Higher priority rules override lower ones
}

export interface AccessLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
  success: boolean;
  error?: string;
}

export class SecurityService {
  private static instance: SecurityService;
  private roles: Map<string, UserRole> = new Map();
  private rules: Map<string, SecurityRule> = new Map();
  private accessLogs: AccessLog[] = [];
  private currentUser: { id: string; role: string } | null = null;
  private encryptionKey: string = '';

  private constructor() {
    this.initializeDefaultRoles();
    this.initializeDefaultRules();
  }

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  private initializeDefaultRoles(): void {
    const defaultRoles: UserRole[] = [
      {
        id: 'admin',
        name: 'Administrator',
        level: 100,
        permissions: [
          { resource: '*', actions: ['create', 'read', 'update', 'delete', 'admin'] }
        ]
      },
      {
        id: 'manager',
        name: 'Manager',
        level: 50,
        permissions: [
          { resource: 'users', actions: ['read', 'update'] },
          { resource: 'data', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'settings', actions: ['read', 'update'] }
        ]
      },
      {
        id: 'user',
        name: 'User',
        level: 10,
        permissions: [
          { resource: 'users', actions: ['read'], conditions: ['own_data'] },
          { resource: 'data', actions: ['create', 'read', 'update'], conditions: ['own_data'] }
        ]
      },
      {
        id: 'guest',
        name: 'Guest',
        level: 1,
        permissions: [
          { resource: 'data', actions: ['read'] }
        ]
      }
    ];

    defaultRoles.forEach(role => {
      this.roles.set(role.id, role);
    });
  }

  private initializeDefaultRules(): void {
    const defaultRules: SecurityRule[] = [
      {
        id: 'user_own_data',
        name: 'Users can access their own data',
        resource: 'users',
        conditions: { userId: true },
        actions: ['read', 'update'],
        enabled: true,
        priority: 10
      },
      {
        id: 'admin_all_access',
        name: 'Admin has full access',
        resource: '*',
        conditions: { roles: ['admin'] },
        actions: ['create', 'read', 'update', 'delete'],
        enabled: true,
        priority: 100
      },
      {
        id: 'data_read_only',
        name: 'Read-only data access for guests',
        resource: 'data',
        conditions: { roles: ['guest'] },
        actions: ['read'],
        enabled: true,
        priority: 5
      }
    ];

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  // User authentication and role management
  setCurrentUser(userId: string, role: string): void {
    this.currentUser = { id: userId, role };
    console.log(`🔐 User authenticated: ${userId} with role: ${role}`);
  }

  getCurrentUser(): { id: string; role: string } | null {
    return this.currentUser;
  }

  getUserRole(roleId: string): UserRole | undefined {
    return this.roles.get(roleId);
  }

  addRole(role: UserRole): void {
    this.roles.set(role.id, role);
    console.log(`🔐 Added role: ${role.name}`);
  }

  // Permission checking
  hasPermission(resource: string, action: string, data?: DocumentData): boolean {
    if (!this.currentUser) {
      console.warn(`🚫 No user authenticated for ${action} on ${resource}`);
      return false;
    }

    const userRole = this.roles.get(this.currentUser.role);
    if (!userRole) {
      console.warn(`🚫 Unknown role: ${this.currentUser.role}`);
      return false;
    }

    // Check role permissions
    const hasRolePermission = userRole.permissions.some(permission => {
      const resourceMatch = permission.resource === '*' || permission.resource === resource;
      const actionMatch = permission.actions.includes(action as any) || permission.actions.includes('*' as any);
      
      if (!resourceMatch || !actionMatch) return false;

      // Check conditions
      if (permission.conditions) {
        return this.checkConditions(permission.conditions, data);
      }

      return true;
    });

    if (hasRolePermission) {
      console.log(`✅ Permission granted: ${this.currentUser.role} can ${action} ${resource}`);
      return true;
    }

    // Check security rules
    const applicableRules = Array.from(this.rules.values())
      .filter(rule => rule.enabled)
      .filter(rule => rule.resource === '*' || rule.resource === resource)
      .filter(rule => rule.actions.includes(action as any))
      .sort((a, b) => b.priority - a.priority);

    for (const rule of applicableRules) {
      if (this.checkRuleConditions(rule, data)) {
        console.log(`✅ Permission granted by rule: ${rule.name}`);
        return true;
      }
    }

    console.warn(`🚫 Permission denied: ${this.currentUser.role} cannot ${action} ${resource}`);
    return false;
  }

  private checkConditions(conditions: string[], data?: DocumentData): boolean {
    return conditions.every(condition => {
      switch (condition) {
        case 'own_data':
          return this.checkOwnData(data);
        default:
          return this.evaluateCustomCondition(condition, data);
      }
    });
  }

  private checkRuleConditions(rule: SecurityRule, data?: DocumentData): boolean {
    const { conditions } = rule;

    // Check role conditions
    if (conditions.roles && !conditions.roles.includes(this.currentUser!.role)) {
      return false;
    }

    // Check user ID condition
    if (conditions.userId && !this.checkOwnData(data)) {
      return false;
    }

    // Check custom condition
    if (conditions.custom && !this.evaluateCustomCondition(conditions.custom, data)) {
      return false;
    }

    return true;
  }

  private checkOwnData(data?: DocumentData): boolean {
    if (!this.currentUser || !data) return false;
    
    // Check if data belongs to current user
    const userIdField = data.userId || data.ownerId || data.createdBy || data.user_id;
    return userIdField === this.currentUser.id;
  }

  private evaluateCustomCondition(condition: string, data?: DocumentData): boolean {
    try {
      // Create a safe function to evaluate custom conditions
      const func = new Function('user', 'data', `return ${condition}`);
      return func(this.currentUser, data);
    } catch (error) {
      console.error(`❌ Error evaluating custom condition: ${condition}`, error);
      return false;
    }
  }

  // Data sanitization and validation
  sanitizeInput(data: any): any {
    if (typeof data === 'string') {
      // Basic XSS prevention
      return data
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = Array.isArray(data) ? [] : {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          // Skip dangerous keys
          if (key.startsWith('__') || key.startsWith('$')) continue;
          sanitized[key] = this.sanitizeInput(data[key]);
        }
      }
      return sanitized;
    }
    
    return data;
  }

  validateData(data: any, schema?: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!schema) {
      return { valid: true, errors };
    }

    // Basic validation - can be extended with JSON Schema
    for (const field in schema) {
      const fieldSchema = schema[field];
      const value = data[field];

      if (fieldSchema.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
      }

      if (value !== undefined && value !== null) {
        if (fieldSchema.type && typeof value !== fieldSchema.type) {
          errors.push(`${field} must be of type ${fieldSchema.type}`);
        }

        if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
          errors.push(`${field} must be at least ${fieldSchema.minLength} characters`);
        }

        if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
          errors.push(`${field} must be no more than ${fieldSchema.maxLength} characters`);
        }

        if (fieldSchema.pattern && !new RegExp(fieldSchema.pattern).test(value)) {
          errors.push(`${field} format is invalid`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  // Access logging
  logAccess(
    action: string,
    resource: string,
    resourceId?: string,
    success: boolean = true,
    error?: string
  ): void {
    if (!this.currentUser) return;

    const log: AccessLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.currentUser.id,
      action,
      resource,
      resourceId,
      timestamp: new Date(),
      success,
      error
    };

    this.accessLogs.push(log);
    
    // Keep only last 1000 logs to prevent memory issues
    if (this.accessLogs.length > 1000) {
      this.accessLogs = this.accessLogs.slice(-1000);
    }

    console.log(`📋 Access logged: ${this.currentUser.id} ${action} ${resource} - ${success ? 'SUCCESS' : 'FAILED'}`);
  }

  getAccessLogs(limit: number = 100): AccessLog[] {
    return this.accessLogs.slice(-limit);
  }

  // Rate limiting
  private rateLimitMap: Map<string, number[]> = new Map();

  checkRateLimit(userId: string, action: string, limit: number = 100, windowMs: number = 60000): boolean {
    const key = `${userId}:${action}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    let attempts = this.rateLimitMap.get(key) || [];
    attempts = attempts.filter(timestamp => timestamp > windowStart);
    
    if (attempts.length >= limit) {
      console.warn(`🚫 Rate limit exceeded for ${key}: ${attempts.length} attempts in ${windowMs}ms`);
      return false;
    }

    attempts.push(now);
    this.rateLimitMap.set(key, attempts);
    return true;
  }

  // Security rules management
  addSecurityRule(rule: SecurityRule): void {
    this.rules.set(rule.id, rule);
    console.log(`🔐 Added security rule: ${rule.name}`);
  }

  removeSecurityRule(ruleId: string): void {
    this.rules.delete(ruleId);
    console.log(`🔐 Removed security rule: ${ruleId}`);
  }

  getSecurityRules(): SecurityRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.enabled);
  }

  // Encryption utilities
  setEncryptionKey(key: string): void {
    this.encryptionKey = key;
  }

  encrypt(data: string): string {
    if (!this.encryptionKey) {
      console.warn('⚠️ No encryption key set, returning plain data');
      return data;
    }

    try {
      // Simple XOR encryption (for demo purposes - use proper encryption in production)
      let encrypted = '';
      for (let i = 0; i < data.length; i++) {
        encrypted += String.fromCharCode(data.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length));
      }
      return btoa(encrypted); // Base64 encode
    } catch (error) {
      console.error('❌ Encryption failed:', error);
      return data;
    }
  }

  decrypt(encryptedData: string): string {
    if (!this.encryptionKey) {
      console.warn('⚠️ No encryption key set, returning encrypted data');
      return encryptedData;
    }

    try {
      // Decode from Base64 and XOR decrypt
      const decoded = atob(encryptedData);
      let decrypted = '';
      for (let i = 0; i < decoded.length; i++) {
        decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length));
      }
      return decrypted;
    } catch (error) {
      console.error('❌ Decryption failed:', error);
      return encryptedData;
    }
  }

  // Security audit
  getSecurityAudit(): {
    totalRules: number;
    enabledRules: number;
    totalRoles: number;
    recentAccessLogs: AccessLog[];
    failedAttempts: number;
    securityScore: number;
  } {
    const enabledRules = Array.from(this.rules.values()).filter(rule => rule.enabled).length;
    const recentLogs = this.getAccessLogs(100);
    const failedAttempts = recentLogs.filter(log => !log.success).length;
    
    // Simple security score calculation
    const securityScore = Math.max(0, 100 - (failedAttempts * 2));

    return {
      totalRules: this.rules.size,
      enabledRules,
      totalRoles: this.roles.size,
      recentAccessLogs: recentLogs,
      failedAttempts,
      securityScore
    };
  }
}

export const securityService = SecurityService.getInstance();