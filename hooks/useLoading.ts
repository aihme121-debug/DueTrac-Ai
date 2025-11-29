import { useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  startLoading: () => void;
  stopLoading: () => void;
  setError: (error: string) => void;
  clearError: () => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}

export const useLoading = (): LoadingState => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setErrorState(null);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const setError = useCallback((error: string) => {
    setErrorState(error);
    setIsLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const withLoading = useCallback(async <T,>(promise: Promise<T>): Promise<T> => {
    startLoading();
    try {
      const result = await promise;
      stopLoading();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    }
  }, [startLoading, stopLoading, setError]);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError,
    clearError,
    withLoading
  };
};

export default useLoading;