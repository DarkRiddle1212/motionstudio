import { motion, AnimatePresence } from 'framer-motion';
import { useOffline } from '../../hooks/useOffline';

interface OfflineIndicatorProps {
  className?: string;
  showWhenOnline?: boolean;
}

/**
 * Offline Indicator Component
 * 
 * Shows the current network status and provides feedback when
 * the user goes offline or comes back online.
 */
const OfflineIndicator = ({ 
  className = '',
  showWhenOnline = false 
}: OfflineIndicatorProps) => {
  const { isOnline, isOffline, getOfflineDuration } = useOffline();

  const formatOfflineDuration = (duration: number | null): string => {
    if (!duration) return '';
    
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const shouldShow = isOffline || showWhenOnline;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`
            fixed top-0 left-0 right-0 z-50 
            ${isOffline 
              ? 'bg-brand-error text-white' 
              : 'bg-brand-success text-white'
            }
            ${className}
          `}
        >
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-center space-x-2 text-sm font-medium">
              <div className={`w-2 h-2 rounded-full ${
                isOffline ? 'bg-white' : 'bg-white'
              }`} />
              
              {isOffline ? (
                <span>
                  You're offline
                  {getOfflineDuration() && (
                    <span className="ml-1 opacity-75">
                      • {formatOfflineDuration(getOfflineDuration())}
                    </span>
                  )}
                </span>
              ) : (
                <span>You're back online</span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;