import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'danger';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}: BadgeProps) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    default: 'bg-brand-accent bg-opacity-20 text-brand-primary-text hover:bg-opacity-30 transition-colors duration-300',
    primary: 'bg-brand-primary-text text-brand-primary-bg hover:bg-opacity-90 transition-colors duration-300',
    secondary: 'bg-brand-secondary-bg text-brand-primary-text border border-brand-primary-text hover:bg-brand-primary-text hover:text-brand-primary-bg transition-colors duration-300',
    accent: 'bg-brand-accent text-white hover:bg-opacity-90 transition-colors duration-300',
    success: 'bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-300',
    warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors duration-300',
    error: 'bg-red-100 text-red-800 hover:bg-red-200 transition-colors duration-300',
    info: 'bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-300',
    danger: 'bg-red-100 text-red-800 hover:bg-red-200 transition-colors duration-300'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <span className={combinedClasses}>
      {children}
    </span>
  );
};

export default Badge;