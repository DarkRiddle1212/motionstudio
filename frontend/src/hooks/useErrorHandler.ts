import { useState, useCallback } from 'react';
import { useRetry } from './useRetry';
import { useOffline } from './useOffline';

interface ErrorDetails {
  message: string;
  code?: string;
  statusCode?: number;
  timestamp: Date;
  context?: Record<string, any>;
}

interface ErrorHandlerOptions {
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  enableOfflineDetection?: boolean;
  onError?: (error: ErrorDetails) => void;
  onRetry?: (attempt: number) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

/**
 * useErrorHandler Hook
 * 
 * Comprehensive error handling hook that provides:
 * - Error state management
 * - Retry mechanisms
 * - Offline detection
 * - User-friendly error messages
 * - Error reporting and logging
 */
export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const {
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    enableOfflineDetection = true,
    onError,
    onRetry,
    onOffline,
    onOnline
  } = options;

  const [errors, setErrors] = useState<ErrorDetails[]>([]);
  const [isHandlingError, setIsHandlingError] = useState(false);

  const retryHook = useRetry({
    maxAttempts: maxRetries,
    delay: retryDelay,
    onRetry,
    onMaxAttemptsReached: () => {
      console.warn('Maximum retry attempts reached');
    }
  });

  const offlineHook = useOffline({
    onOnline: () => {
      console.log('Connection restored');
      if (onOnline) onOnline();
    },
    onOffline: () => {
      console.log('Connection lost');
      if (onOffline) onOffline();
    }
  });

  const createErrorDetails = useCallback((error: unknown, context?: Record<string, any>): ErrorDetails => {
    let message = 'An unexpected error occurred';
    let code: string | undefined;
    let statusCode: number | undefined;

    if (error instanceof Error) {
      message = error.message;
      
      // Handle different error types
      if ('code' in error) {
        code = (error as any).code;
      }
      
      if ('status' in error) {
        statusCode = (error as any).status;
      }
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        message = enableOfflineDetection && !offlineHook.isOnline 
          ? 'You appear to be offline. Please check your connection.'
          : 'Network error. Please check your connection and try again.';
        code = 'NETWORK_ERROR';
      }
      
      // Handle timeout errors
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        message = 'Request timed out. Please try again.';
        code = 'TIMEOUT_ERROR';
      }
    } else if (typeof error === 'string') {
      message = error;
    }

    // Provide user-friendly messages based on status codes
    if (statusCode) {
      switch (statusCode) {
        case 400:
          message = 'Invalid request. Please check your input and try again.';
          break;
        case 401:
          message = 'You are not authorized. Please log in and try again.';
          break;
        case 403:
          message = 'You do not have permission to perform this action.';
          break;
        case 404:
          message = 'The requested resource was not found.';
          break;
        case 409:
          message = 'This action conflicts with existing data. Please refresh and try again.';
          break;
        case 422:
          message = 'Invalid data provided. Please check your input.';
          break;
        case 429:
          message = 'Too many requests. Please wait a moment and try again.';
          break;
        case 500:
          message = 'Server error. Please try again later.';
          break;
        case 502:
        case 503:
        case 504:
          message = 'Service temporarily unavailable. Please try again later.';
          break;
      }
    }

    return {
      message,
      code,
      statusCode,
      timestamp: new Date(),
      context
    };
  }, [enableOfflineDetection, offlineHook.isOnline]);

  const handleError = useCallback((error: unknown, context?: Record<string, any>) => {
    const errorDetails = createErrorDetails(error, context);
    
    setErrors(prev => [...prev, errorDetails]);
    
    if (onError) {
      onError(errorDetails);
    }

    // Log error for debugging
    console.error('Error handled:', errorDetails, error);
  }, [createErrorDetails, onError]);

  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T | null> => {
    setIsHandlingError(true);

    try {
      if (enableRetry) {
        return await retryHook.retry(operation);
      } else {
        return await operation();
      }
    } catch (error) {
      handleError(error, context);
      return null;
    } finally {
      setIsHandlingError(false);
    }
  }, [enableRetry, retryHook, handleError]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const clearError = useCallback((index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  }, []);

  const getLatestError = useCallback((): ErrorDetails | null => {
    return errors.length > 0 ? errors[errors.length - 1] : null;
  }, [errors]);

  const hasErrors = errors.length > 0;
  const hasNetworkErrors = errors.some(error => 
    error.code === 'NETWORK_ERROR' || 
    error.code === 'TIMEOUT_ERROR' ||
    (error.statusCode && error.statusCode >= 500)
  );

  return {
    // Error state
    errors,
    hasErrors,
    hasNetworkErrors,
    isHandlingError,
    latestError: getLatestError(),
    
    // Error handling methods
    handleError,
    executeWithErrorHandling,
    clearErrors,
    clearError,
    
    // Retry functionality
    ...retryHook,
    
    // Offline detection (if enabled)
    ...(enableOfflineDetection ? offlineHook : {}),
    
    // Utility methods
    createUserFriendlyMessage: (error: unknown) => createErrorDetails(error).message
  };
};