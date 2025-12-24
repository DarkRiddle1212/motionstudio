import { motion } from 'framer-motion';
import Button from './Button';

interface ErrorMessageProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  onDismiss?: () => void;
  retryLabel?: string;
  dismissLabel?: string;
  showIcon?: boolean;
  className?: string;
}

/**
 * Error Message Component
 * 
 * Displays user-friendly error messages with actionable guidance.
 * Supports different error types and provides retry/dismiss actions.
 */
const ErrorMessage = ({
  title,
  message,
  type = 'error',
  onRetry,
  onDismiss,
  retryLabel = 'Try Again',
  dismissLabel = 'Dismiss',
  showIcon = true,
  className = ''
}: ErrorMessageProps) => {
  const typeConfig = {
    error: {
      bgColor: 'bg-brand-error bg-opacity-10',
      borderColor: 'border-brand-error border-opacity-30',
      iconColor: 'text-brand-error',
      textColor: 'text-brand-error',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      )
    },
    warning: {
      bgColor: 'bg-brand-warning bg-opacity-10',
      borderColor: 'border-brand-warning border-opacity-30',
      iconColor: 'text-brand-warning',
      textColor: 'text-brand-warning',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      )
    },
    info: {
      bgColor: 'bg-brand-accent bg-opacity-10',
      borderColor: 'border-brand-accent border-opacity-30',
      iconColor: 'text-brand-accent',
      textColor: 'text-brand-accent',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      )
    }
  };

  const config = typeConfig[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        ${config.bgColor} ${config.borderColor}
        border rounded-lg p-4 ${className}
      `}
    >
      <div className="flex items-start space-x-3">
        {showIcon && (
          <div className={`flex-shrink-0 ${config.iconColor}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {config.icon}
            </svg>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`text-sm font-medium ${config.textColor} mb-1`}>
              {title}
            </h4>
          )}
          
          <p className="text-sm text-brand-primary-text">
            {message}
          </p>
          
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {onRetry && (
                <Button
                  onClick={onRetry}
                  variant="secondary"
                  size="sm"
                >
                  {retryLabel}
                </Button>
              )}
              
              {onDismiss && (
                <Button
                  onClick={onDismiss}
                  variant="ghost"
                  size="sm"
                >
                  {dismissLabel}
                </Button>
              )}
            </div>
          )}
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 ${config.iconColor} hover:opacity-75 transition-opacity`}
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ErrorMessage;