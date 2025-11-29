import { useState, useEffect, useCallback } from 'react';
import { securityService, UserRole, SecurityRule, AccessLog } from '../services/securityService';
import { DocumentData } from 'firebase/firestore';

export interface UseSecurityReturn {
  // User and role management
  currentUser: { id: string; role: string } | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  
  // Permission checking
  hasPermission: (resource: string, action: string, data?: DocumentData) => boolean;
  canRead: (resource: string, data?: DocumentData) => boolean;
  canWrite: (resource: string, data?: DocumentData) => boolean;
  canDelete: (resource: string, data?: DocumentData) => boolean;
  
  // Security operations
  login: (userId: string, role: string) => void;
  logout: () => void;
  
  // Data protection
  sanitizeData: (data: any) => any;
  validateData: (data: any, schema?: any) => { valid: boolean; errors: string[] };
  
  // Security monitoring
  accessLogs: AccessLog[];
  securityAudit: any;
  
  // Rate limiting
  checkRateLimit: (action: string, limit?: number, windowMs?: number) => boolean;
  
  // Loading states
  loading: boolean;
  error: string | null;
}

export const useSecurity = (): UseSecurityReturn => {
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(
    securityService.getCurrentUser()
  );
  const [userRole, setUserRole] = useState<UserRole | null>(
    currentUser ? securityService.getUserRole(currentUser.role) || null : null
  );
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [securityAudit, setSecurityAudit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update user state when security service changes
  useEffect(() => {
    const updateUserState = () => {
      const user = securityService.getCurrentUser();
      setCurrentUser(user);
      setUserRole(user ? securityService.getUserRole(user.role) || null : null);
    };

    // Listen for auth state changes (if implemented)
    updateUserState();
  }, []);

  // Load security data
  useEffect(() => {
    const loadSecurityData = () => {
      try {
        setAccessLogs(securityService.getAccessLogs(50));
        setSecurityAudit(securityService.getSecurityAudit());
      } catch (err) {
        console.error('Failed to load security data:', err);
        setError('Failed to load security data');
      }
    };

    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const login = useCallback((userId: string, role: string) => {
    try {
      setLoading(true);
      setError(null);
      
      securityService.setCurrentUser(userId, role);
      setCurrentUser({ id: userId, role });
      setUserRole(securityService.getUserRole(role) || null);
      
      console.log(`🔐 User logged in: ${userId} with role: ${role}`);
    } catch (err) {
      setError(`Login failed: ${err}`);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      
      securityService.setCurrentUser('', '');
      setCurrentUser(null);
      setUserRole(null);
      
      console.log('🔐 User logged out');
    } catch (err) {
      setError(`Logout failed: ${err}`);
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const hasPermission = useCallback((resource: string, action: string, data?: DocumentData): boolean => {
    try {
      return securityService.hasPermission(resource, action, data);
    } catch (err) {
      console.error(`Permission check failed for ${action} on ${resource}:`, err);
      return false;
    }
  }, []);

  const canRead = useCallback((resource: string, data?: DocumentData): boolean => {
    return hasPermission(resource, 'read', data);
  }, [hasPermission]);

  const canWrite = useCallback((resource: string, data?: DocumentData): boolean => {
    return hasPermission(resource, 'update', data) || hasPermission(resource, 'create', data);
  }, [hasPermission]);

  const canDelete = useCallback((resource: string, data?: DocumentData): boolean => {
    return hasPermission(resource, 'delete', data);
  }, [hasPermission]);

  const sanitizeData = useCallback((data: any): any => {
    try {
      return securityService.sanitizeInput(data);
    } catch (err) {
      console.error('Data sanitization failed:', err);
      setError('Data sanitization failed');
      return data;
    }
  }, []);

  const validateData = useCallback((data: any, schema?: any): { valid: boolean; errors: string[] } => {
    try {
      return securityService.validateData(data, schema);
    } catch (err) {
      console.error('Data validation failed:', err);
      setError('Data validation failed');
      return { valid: false, errors: ['Validation failed'] };
    }
  }, []);

  const checkRateLimit = useCallback((action: string, limit?: number, windowMs?: number): boolean => {
    if (!currentUser) return false;
    
    try {
      return securityService.checkRateLimit(currentUser.id, action, limit, windowMs);
    } catch (err) {
      console.error(`Rate limit check failed for ${action}:`, err);
      return false;
    }
  }, [currentUser]);

  const isAuthenticated = !!currentUser;

  return {
    currentUser,
    userRole,
    isAuthenticated,
    hasPermission,
    canRead,
    canWrite,
    canDelete,
    login,
    logout,
    sanitizeData,
    validateData,
    accessLogs,
    securityAudit,
    checkRateLimit,
    loading,
    error
  };
};

// Hook for protecting components based on permissions
export const usePermission = (resource: string, action: string, data?: DocumentData) => {
  const { hasPermission } = useSecurity();
  return hasPermission(resource, action, data);
};

// Hook for protecting routes
export const useRouteProtection = (resource: string, action: string) => {
  const { hasPermission, isAuthenticated, loading } = useSecurity();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!loading) {
      setHasAccess(isAuthenticated && hasPermission(resource, action));
    }
  }, [isAuthenticated, hasPermission, loading, resource, action]);

  return {
    hasAccess,
    isLoading: loading,
    isAuthenticated
  };
};

// Hook for form security
export const useFormSecurity = (schema?: any) => {
  const { sanitizeData, validateData } = useSecurity();
  const [errors, setErrors] = useState<string[]>([]);

  const secureSubmit = useCallback((data: any) => {
    // Sanitize input data
    const sanitizedData = sanitizeData(data);
    
    // Validate against schema
    const validation = validateData(sanitizedData, schema);
    setErrors(validation.errors);
    
    return {
      data: sanitizedData,
      valid: validation.valid,
      errors: validation.errors
    };
  }, [sanitizeData, validateData, schema]);

  return {
    secureSubmit,
    errors,
    clearErrors: () => setErrors([])
  };
};

export default useSecurity;