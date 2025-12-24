import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const ProgressBar = ({
  value,
  max = 100,
  size = 'md',
  showLabel = true,
  label,
  animated = true,
  className = ''
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const baseClasses = `w-full bg-brand-secondary-bg rounded-full overflow-hidden ${sizeClasses[size]}`;
  
  return (
    <div className={`space-y-2 ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-brand-primary-text">
            {label || 'Progress'}
          </span>
          <span className="text-sm text-brand-secondary-text">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div className={baseClasses}>
        <motion.div
          className="h-full bg-brand-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 0.8 : 0,
            ease: "easeOut"
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;