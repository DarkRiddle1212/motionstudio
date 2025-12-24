import { useState, useCallback } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number) => void;
  onMaxAttemptsReached?: () => void;
}

interface RetryState {
  isRetrying: boolean;
  attempts: number;
  canRetry: boolean;
}

/**
 * useRetry Hook
 * 
 * Provides retry functionality for failed operations with configurable
 * retry strategies including linear and exponential backoff.
 */
export const useRetry = (options: RetryOptions = {}) => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 'exponential',
    onRetry,
    onMaxAttemptsReached
  } = options;

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attempts: 0,
    canRetry: true
  });

  const calculateDelay = useCallback((attempt: number): number => {
    if (backoff === 'exponential') {
      return delay * Math.pow(2, attempt - 1);
    }
    return delay * attempt;
  }, [delay, backoff]);

  const retry = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    if (!state.canRetry) {
      throw new Error('Maximum retry attempts reached');
    }

    const currentAttempt = state.attempts + 1;
    
    setState(prev => ({
      ...prev,
      isRetrying: true,
      attempts: currentAttempt
    }));

    try {
      // Call the retry callback if provided
      if (onRetry) {
        onRetry(currentAttempt);
      }

      // Add delay before retry (except for first attempt)
      if (currentAttempt > 1) {
        const retryDelay = calculateDelay(currentAttempt - 1);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }

      const result = await operation();
      
      // Reset state on success
      setState({
        isRetrying: false,
        attempts: 0,
        canRetry: true
      });

      return result;
    } catch (error) {
      const canRetryAgain = currentAttempt < maxAttempts;
      
      setState(prev => ({
        ...prev,
        isRetrying: false,
        attempts: currentAttempt,
        canRetry: canRetryAgain
      }));

      if (!canRetryAgain && onMaxAttemptsReached) {
        onMaxAttemptsReached();
      }

      throw error;
    }
  }, [state, maxAttempts, calculateDelay, onRetry, onMaxAttemptsReached]);

  const reset = useCallback(() => {
    setState({
      isRetrying: false,
      attempts: 0,
      canRetry: true
    });
  }, []);

  return {
    ...state,
    retry,
    reset,
    nextRetryDelay: state.canRetry && state.attempts > 0 
      ? calculateDelay(state.attempts) 
      : null
  };
};

/**
 * useAsyncRetry Hook
 * 
 * Combines async operation handling with retry functionality.
 * Provides loading states and error handling out of the box.
 */
export const useAsyncRetry = <T>(
  operation: () => Promise<T>,
  options: RetryOptions & { 
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) => {
  const { immediate = false, onSuccess, onError, ...retryOptions } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  
  const retryHook = useRetry(retryOptions);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await retryHook.retry(operation);
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [operation, retryHook, onSuccess, onError]);

  // Execute immediately if requested
  useState(() => {
    if (immediate) {
      execute().catch(() => {
        // Error is already handled in execute function
      });
    }
  });

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    retryHook.reset();
  }, [retryHook]);

  return {
    data,
    error,
    loading,
    execute,
    reset,
    isRetrying: retryHook.isRetrying,
    attempts: retryHook.attempts,
    canRetry: retryHook.canRetry,
    retry: retryHook.retry,
    nextRetryDelay: retryHook.nextRetryDelay
  };
};