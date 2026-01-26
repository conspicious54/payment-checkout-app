import { useState, useCallback } from 'react';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export function useLoadingState() {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
  });

  const startLoading = useCallback(() => {
    setState({ isLoading: true, error: null });
  }, []);

  const stopLoading = useCallback(() => {
    setState({ isLoading: false, error: null });
  }, []);

  const setError = useCallback((error: string) => {
    setState({ isLoading: false, error });
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null });
  }, []);

  return {
    ...state,
    startLoading,
    stopLoading,
    setError,
    reset,
  };
}
