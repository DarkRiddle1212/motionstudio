import { SelectHTMLAttributes, forwardRef, useId, useState, useEffect } from 'react';
import { ChevronDownIcon, AlertIcon } from './Icon';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'floating' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  options?: SelectOption[];
  placeholder?: string;
  success?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  fullWidth = false,
  variant = 'default',
  size = 'md',
  options = [],
  placeholder,
  success,
  className = '',
  id,
  value,
  defaultValue,
  onFocus,
  onBlur,
  onChange,
  children,
  ...props
}, ref) => {
  const generatedId = useId();
  const selectId = id || generatedId;
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

  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHasValue(!!e.target.value);
    onChange?.(e);
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-body-sm pr-10',
    md: 'px-4 py-3 text-body-md pr-12',
    lg: 'px-5 py-4 text-body-lg pr-14',
  };

  // Base select classes
  const baseClasses = `
    w-full
    font-sans
    bg-surface-card
    text-brand-primary-text
    border
    rounded-lg
    transition-all
    duration-300
    ease-smooth
    focus:outline-none
    disabled:opacity-50
    disabled:cursor-not-allowed
    appearance-none
    cursor-pointer
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

  const combinedSelectClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${getStateClasses()}
    ${animationClasses}
    ${isFloating ? 'pt-6 pb-2' : ''}
    ${!hasValue && placeholder ? 'text-brand-muted-text' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Chevron icon position based on size
  const chevronPosition = {
    sm: 'right-3',
    md: 'right-4',
    lg: 'right-5',
  };

  // Render default variant
  if (variant === 'default' || variant === 'outlined') {
    return (
      <div className={`relative ${widthClass}`}>
        {label && (
          <label 
            htmlFor={selectId} 
            className="block text-body-sm font-medium text-brand-primary-text mb-2 transition-colors duration-200"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={combinedSelectClasses}
            value={value}
            defaultValue={defaultValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.length > 0 
              ? options.map((option) => (
                  <option 
                    key={option.value} 
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))
              : children
            }
          </select>
          {/* Custom chevron icon */}
          <div className={`absolute ${chevronPosition[size]} top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${isFocused ? 'rotate-180' : ''} flex items-center justify-center`}>
            <ChevronDownIcon 
              size="sm" 
              className={error ? 'text-red-500' : success ? 'text-green-500' : 'text-brand-secondary-text'} 
            />
          </div>
        </div>
        {/* Error message with animation */}
        {error && (
          <p 
            id={`${selectId}-error`}
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
            id={`${selectId}-helper`}
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
        <select
          id={selectId}
          ref={ref}
          className={combinedSelectClasses}
          value={value}
          defaultValue={defaultValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.length > 0 
            ? options.map((option) => (
                <option 
                  key={option.value} 
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))
            : children
          }
        </select>
        {/* Floating label */}
        {label && (
          <label
            htmlFor={selectId}
            className={`
              absolute
              left-4
              transition-all
              duration-200
              ease-smooth
              pointer-events-none
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
        {/* Custom chevron icon */}
        <div className={`absolute ${chevronPosition[size]} top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${isFocused ? 'rotate-180' : ''} flex items-center justify-center`}>
          <ChevronDownIcon 
            size="sm" 
            className={error ? 'text-red-500' : success ? 'text-green-500' : 'text-brand-secondary-text'} 
          />
        </div>
      </div>
      {/* Error message with animation */}
      {error && (
        <p 
          id={`${selectId}-error`}
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
          id={`${selectId}-helper`}
          className="mt-2 text-body-sm text-brand-secondary-text"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
