import { useState, useCallback } from 'react';
import { errorHandler, ErrorOptions } from '../../src/utils/errorHandler';

export interface ErrorState {
  error: Error | null;
  isError: boolean;
  errorMessage: string;
  errorType: 'firebase' | 'network' | 'validation' | 'unknown' | null;
}

export interface UseErrorHandlingReturn {
  errorState: ErrorState;
  setError: (error: Error | string, type?: ErrorState['errorType']) => void;
  clearError: () => void;
  handleAsync: <T>(
    promise: Promise<T>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      onSuccess?: (result: T) => void;
      onError?: (error: any) => void;
      silent?: boolean;
    }
  ) => Promise<T | null>;
  showError: (message: string, options?: ErrorOptions) => void;
  showSuccess: (message: string, options?: ErrorOptions) => void;
  showWarning: (message: string, options?: ErrorOptions) => void;
  showInfo: (message: string, options?: ErrorOptions) => void;
}

export const useErrorHandling = (): UseErrorHandlingReturn => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    errorMessage: '',
    errorType: null
  });

  const setError = useCallback((error: Error | string, type: ErrorState['errorType'] = 'unknown') => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    setErrorState({
      error: errorObj,
      isError: true,
      errorMessage: errorObj.message,
      errorType: type
    });

    // Handle error based on error type
    if (type === 'firebase') {
      errorHandler.handleFirebaseError(errorObj);
    } else if (type === 'network') {
      errorHandler.handleNetworkError(errorObj);
    } else if (type === 'validation') {
      errorHandler.handleValidationError({ general: [errorObj.message] });
    } else {
      errorHandler.showError(errorObj.message);
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      errorMessage: '',
      errorType: null
    });
  }, []);

  const handleAsync = useCallback(async <T,>(
    promise: Promise<T>,
    options: {
      successMessage?: string;
      errorMessage?: string;
      onSuccess?: (result: T) => void;
      onError?: (error: any) => void;
      silent?: boolean;
    } = {}
  ): Promise<T | null> => {
    try {
      clearError();
      const result = await promise;
      
      if (!options.silent && options.successMessage) {
        errorHandler.showSuccess(options.successMessage);
      }
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (error) {
      if (!options.silent) {
        const message = options.errorMessage || 'An error occurred';
        
        if (error?.code) {
          setError(error as Error, 'firebase');
        } else if (error?.status || error?.message?.includes('fetch')) {
          setError(error as Error, 'network');
        } else if (error?.errors) {
          setError(error as Error, 'validation');
        } else {
          setError(error as Error, 'unknown');
        }
      }
      
      if (options.onError) {
        options.onError(error);
      }
      
      return null;
    }
  }, [clearError, setError]);

  const showError = useCallback((message: string, options?: ErrorOptions) => {
    errorHandler.showError(message, options);
  }, []);

  const showSuccess = useCallback((message: string, options?: ErrorOptions) => {
    errorHandler.showSuccess(message, options);
  }, []);

  const showWarning = useCallback((message: string, options?: ErrorOptions) => {
    errorHandler.showWarning(message, options);
  }, []);

  const showInfo = useCallback((message: string, options?: ErrorOptions) => {
    errorHandler.showInfo(message, options);
  }, []);

  return {
    errorState,
    setError,
    clearError,
    handleAsync,
    showError,
    showSuccess,
    showWarning,
    showInfo
  };
};

// Hook for form error handling
export const useFormErrorHandling = () => {
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [hasFormErrors, setHasFormErrors] = useState(false);

  const setFormError = useCallback((field: string, messages: string[]) => {
    setFormErrors(prev => ({
      ...prev,
      [field]: messages
    }));
    setHasFormErrors(true);
  }, []);

  const clearFormError = useCallback((field: string) => {
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    setHasFormErrors(Object.keys(formErrors).length > 1);
  }, [formErrors]);

  const clearAllFormErrors = useCallback(() => {
    setFormErrors({});
    setHasFormErrors(false);
  }, []);

  const handleValidationErrors = useCallback((errors: Record<string, string[]>) => {
    setFormErrors(errors);
    setHasFormErrors(true);
    errorHandler.handleValidationError(errors);
  }, []);

  return {
    formErrors,
    hasFormErrors,
    setFormError,
    clearFormError,
    clearAllFormErrors,
    handleValidationErrors
  };
};

// Hook for async operation error handling with loading states
export const useAsyncErrorHandling = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const executeAsync = useCallback(async <T,>(
    asyncFunction: () => Promise<T>,
    options: {
      successMessage?: string;
      errorMessage?: string;
      onSuccess?: (result: T) => void;
      onError?: (error: any) => void;
      silent?: boolean;
    } = {}
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      
      if (!options.silent && options.successMessage) {
        errorHandler.showSuccess(options.successMessage);
      }
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      setError(err as Error);
      
      if (!options.silent) {
        const message = options.errorMessage || 'An error occurred';
        
        if (err?.code) {
          errorHandler.handleFirebaseError(err);
        } else if (err?.status || err?.message?.includes('fetch')) {
          errorHandler.handleNetworkError(err);
        } else {
          errorHandler.showError(message);
        }
      }
      
      if (options.onError) {
        options.onError(err);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    executeAsync
  };
};