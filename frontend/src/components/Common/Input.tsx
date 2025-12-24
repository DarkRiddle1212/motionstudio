import { InputHTMLAttributes, forwardRef, useId, useState, useEffect } from 'react';
import { CheckIcon, AlertIcon } from './Icon';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'floating' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  success?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  fullWidth = false,
  variant = 'default',
  inputSize = 'md',
  leftIcon,
  rightIcon,
  success,
  className = '',
  id,
  value,
  defaultValue,
  placeholder,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value || !!defaultValue);
  const [isAnimatingError, setIsAnimatingError] = useState(false);

  // Track value changes for floating label
  useEffect(() => {
    setHasValue(!!value || !!defaultValue);
  }, [value, defaultValue]);

  // Trigger shake animation on error
  useEffect(() => {
    if (error) {
      setIsAnimatingError(true);
      const timer = setTimeout(() => setIsAnimatingError(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    onBlur?.(e);
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-body-sm',
    md: 'px-4 py-3 text-body-md',
    lg: 'px-5 py-4 text-body-lg',
  };

  const iconPaddingLeft = {
    sm: 'pl-10',
    md: 'pl-12',
    lg: 'pl-14',
  };

  const iconPaddingRight = {
    sm: 'pr-10',
    md: 'pr-12',
    lg: 'pr-14',
  };

  // Base input classes
  const baseClasses = `
    w-full
    font-sans
    bg-surface-card
    text-brand-primary-text
    placeholder-brand-muted-text
    border
    rounded-lg
    transition-all
    duration-300
    ease-smooth
    focus:outline-none
    disabled:opacity-50
    disabled:cursor-not-allowed
  `;

  // State-based border and shadow classes
  const getStateClasses = () => {
    if (error) {
      return 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]';
    }
    if (success) {
      return 'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.15)]';
    }
    return `
      border-white/10
      hover:border-brand-accent/30
      focus:border-brand-accent
      focus:ring-2
      focus:ring-brand-accent/20
      focus:shadow-[0_0_0_3px_rgba(200,154,166,0.15)]
    `;
  };

  // Animation classes
  const animationClasses = isAnimatingError ? 'animate-[shake_0.5s_ease-in-out]' : '';

  const widthClass = fullWidth ? 'w-full' : '';

  // Floating label specific styles
  const isFloating = variant === 'floating';
  const shouldFloat = isFloating && (isFocused || hasValue);

  const combinedInputClasses = `
    ${baseClasses}
    ${sizeClasses[inputSize]}
    ${getStateClasses()}
    ${animationClasses}
    ${leftIcon ? iconPaddingLeft[inputSize] : ''}
    ${rightIcon ? iconPaddingRight[inputSize] : ''}
    ${isFloating ? 'pt-6 pb-2' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Render default variant
  if (variant === 'default' || variant === 'outlined') {
    return (
      <div className={`relative ${widthClass}`}>
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-body-sm font-medium text-brand-primary-text mb-2 transition-colors duration-200"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-secondary-text pointer-events-none transition-colors duration-200 flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={combinedInputClasses}
            value={value}
            defaultValue={defaultValue}
            placeholder={placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-secondary-text pointer-events-none transition-colors duration-200 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
          {/* Success checkmark */}
          {success && !rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 animate-scale-in flex items-center justify-center">
              <CheckIcon size="sm" />
            </div>
          )}
        </div>
        {/* Error message with animation */}
        {error && (
          <p 
            id={`${inputId}-error`}
            className="mt-2 text-body-sm text-red-500 animate-slide-down flex items-center gap-2"
            role="alert"
          >
            <AlertIcon size="xs" className="flex-shrink-0" />
            {error}
          </p>
        )}
        {/* Helper text */}
        {helperText && !error && (
          <p 
            id={`${inputId}-helper`}
            className="mt-2 text-body-sm text-brand-secondary-text"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }

  // Render floating label variant
  return (
    <div className={`relative ${widthClass}`}>
      <div className="relative">
        {leftIcon && (
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-brand-secondary-text pointer-events-none transition-colors duration-200 flex items-center justify-center ${isFocused ? 'text-brand-accent' : ''}`}>
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          className={combinedInputClasses}
          value={value}
          defaultValue={defaultValue}
          placeholder={isFocused ? placeholder : ' '}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {/* Floating label */}
        {label && (
          <label
            htmlFor={inputId}
            className={`
              absolute
              left-4
              transition-all
              duration-200
              ease-smooth
              pointer-events-none
              ${leftIcon ? 'left-12' : 'left-4'}
              ${shouldFloat 
                ? 'top-2 text-caption text-brand-accent font-medium' 
                : 'top-1/2 -translate-y-1/2 text-body-md text-brand-muted-text'
              }
              ${error ? 'text-red-500' : ''}
              ${success ? 'text-green-500' : ''}
            `}
          >
            {label}
          </label>
        )}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-secondary-text pointer-events-none transition-colors duration-200 flex items-center justify-center">
            {rightIcon}
          </div>
        )}
        {/* Success checkmark */}
        {success && !rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 animate-scale-in flex items-center justify-center">
            <CheckIcon size="sm" />
          </div>
        )}
      </div>
      {/* Error message with animation */}
      {error && (
        <p 
          id={`${inputId}-error`}
          className="mt-2 text-body-sm text-red-500 animate-slide-down flex items-center gap-2"
          role="alert"
        >
          <AlertIcon size="xs" className="flex-shrink-0" />
          {error}
        </p>
      )}
      {/* Helper text */}
      {helperText && !error && (
        <p 
          id={`${inputId}-helper`}
          className="mt-2 text-body-sm text-brand-secondary-text"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
