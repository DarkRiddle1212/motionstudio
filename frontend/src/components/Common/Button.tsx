import { motion } from 'framer-motion';
import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
import { hoverVariants } from '../../utils/animationVariants';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onDragStart' | 'onDrag' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/**
 * Premium Button Component
 * 
 * Features:
 * - Multi-layer shadow system for depth
 * - Smooth hover scale and shadow transitions
 * - Premium focus ring styling for accessibility
 * - Ghost and icon button variants
 * - 44px minimum touch targets on mobile (Requirements: 7.2)
 * 
 * Requirements: 4.1, 4.5, 7.2
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}, ref) => {
  // Base classes with premium styling
  const baseClasses = `
    font-sans font-medium rounded-lg
    transition-all duration-300 ease-premium
    focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary-bg
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
    inline-flex items-center justify-center gap-2
    select-none
  `.trim().replace(/\s+/g, ' ');
  
  // Variant classes with multi-layer shadows and premium hover states
  const variantClasses: Record<ButtonVariant, string> = {
    primary: `
      bg-gradient-to-r from-brand-accent to-brand-accent-dark text-white
      shadow-premium border border-brand-accent/20
      hover:shadow-glow-lg hover:scale-[1.02] hover:from-brand-accent-light hover:to-brand-accent
      active:scale-[0.98] active:shadow-button
    `.trim().replace(/\s+/g, ' '),
    secondary: `
      bg-transparent text-brand-accent border-2 border-brand-accent/40
      hover:bg-brand-accent/10 hover:border-brand-accent hover:shadow-glow hover:scale-[1.02]
      active:scale-[0.98] active:bg-brand-accent/5
    `.trim().replace(/\s+/g, ' '),
    tertiary: `
      bg-brand-surface-card text-brand-primary-text border border-white/10
      hover:bg-brand-surface-elevated hover:border-white/20 hover:scale-[1.02]
      active:scale-[0.98] active:bg-brand-surface-card
    `.trim().replace(/\s+/g, ' '),
    ghost: `
      bg-transparent text-brand-secondary-text
      hover:bg-white/5 hover:text-brand-primary-text hover:scale-[1.02]
      active:scale-[0.98] active:bg-white/3
    `.trim().replace(/\s+/g, ' ')
  };

  // Size classes with 44px minimum touch targets on mobile (Requirements: 7.2)
  // Mobile touch targets: sm=44px, md=48px, lg=52px, xl=56px
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-4 py-2.5 text-sm min-h-[44px] min-w-[44px]',
    md: 'px-6 py-3 text-base min-h-[48px] min-w-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[52px] min-w-[52px]',
    xl: 'px-10 py-5 text-xl min-h-[56px] min-w-[56px]'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );

  return (
    <motion.button
      ref={ref}
      variants={hoverVariants}
      initial="rest"
      whileHover={disabled || isLoading ? undefined : "hover"}
      whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
      className={combinedClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
