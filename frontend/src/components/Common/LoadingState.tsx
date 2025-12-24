import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  className?: string;
}

/**
 * Loading State Component
 * 
 * A comprehensive loading state component that can be used for
 * full-screen loading, inline loading, or as a placeholder.
 */
const LoadingState = ({ 
  message = 'Loading...', 
  size = 'md',
  fullScreen = false,
  className = '' 
}: LoadingStateProps) => {
  const sizeConfig = {
    sm: {
      spinner: 'md' as const,
      text: 'text-sm',
      spacing: 'space-y-2',
      padding: 'p-4'
    },
    md: {
      spinner: 'lg' as const,
      text: 'text-base',
      spacing: 'space-y-3',
      padding: 'p-6'
    },
    lg: {
      spinner: 'xl' as const,
      text: 'text-lg',
      spacing: 'space-y-4',
      padding: 'p-8'
    }
  };

  const config = sizeConfig[size];

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col items-center justify-center ${config.spacing} ${config.padding} ${className}`}
    >
      <LoadingSpinner size={config.spinner} />
      <p className={`${config.text} text-brand-secondary-text font-medium`}>
        {message}
      </p>
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-brand-primary-bg bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-brand-secondary-bg rounded-lg shadow-lg border border-brand-accent border-opacity-20">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default LoadingState;