import { useState, useCallback } from 'react';

export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  loadingProgress?: number;
}

export const useLoading = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    loadingMessage: undefined,
    loadingProgress: undefined,
  });

  const startLoading = useCallback((message?: string) => {
    setLoadingState({
      isLoading: true,
      loadingMessage: message,
      loadingProgress: undefined,
    });
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
      loadingMessage: undefined,
      loadingProgress: undefined,
    });
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setLoadingState(prev => ({
      ...prev,
      loadingProgress: Math.min(100, Math.max(0, progress)),
    }));
  }, []);

  const updateMessage = useCallback((message: string) => {
    setLoadingState(prev => ({
      ...prev,
      loadingMessage: message,
    }));
  }, []);

  return {
    ...loadingState,
    startLoading,
    stopLoading,
    updateProgress,
    updateMessage,
  };
};

export default useLoading;