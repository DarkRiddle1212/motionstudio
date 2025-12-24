import { TextareaHTMLAttributes, forwardRef, useId, useState, useEffect } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  resize?: boolean | 'vertical' | 'horizontal' | 'none';
  variant?: 'default' | 'floating' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  showCharCount?: boolean;
  success?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  fullWidth = false,
  resize = 'vertical',
  variant = 'default',
  size = 'md',
  showCharCount = false,
  success,
  className = '',
  id,
  value,
  defaultValue,
  placeholder,
  maxLength,
  onFocus,
  onBlur,
  onChange,
  ...props
}, ref) => {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value || !!defaultValue);
  const [charCount, setCharCount] = useState(
    typeof value === 'string' ? value.length : 
    typeof defaultValue === 'string' ? defaultValue.length : 0
  );
  const [isAnimatingError, setIsAnimatingError] = useState(false);

  // Track value changes for floating label and char count
  useEffect(() => {
    setHasValue(!!value || !!defaultValue);
    if (typeof value === 'string') {
      setCharCount(value.length);
    }
  }, [value, defaultValue]);

  // Trigger shake animation on error
  useEffect(() => {
    if (error) {
      setIsAnimatingError(true);
      const timer = setTimeout(() => setIsAnimatingError(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);
    setHasValue(!!e.target.value);
    onChange?.(e);
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-body-sm min-h-[80px]',
    md: 'px-4 py-3 text-body-md min-h-[120px]',
    lg: 'px-5 py-4 text-body-lg min-h-[160px]',
  };

  // Resize classes
  const getResizeClass = () => {
    if (resize === false || resize === 'none') return 'resize-none';
    if (resize === 'vertical' || resize === true) return 'resize-y';
    if (resize === 'horizontal') return 'resize-x';
    return 'resize';
  };

  // Base textarea classes
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

  const combinedTextareaClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${getStateClasses()}
    ${getResizeClass()}
    ${animationClasses}
    ${isFloating ? 'pt-6' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Character count color
  const getCharCountColor = () => {
    if (!maxLength) return 'text-brand-secondary-text';
    const percentage = charCount / maxLength;
    if (percentage >= 1) return 'text-red-500';
    if (percentage >= 0.9) return 'text-yellow-500';
    return 'text-brand-secondary-text';
  };

  // Render default variant
  if (variant === 'default' || variant === 'outlined') {
    return (
      <div className={`relative ${widthClass}`}>
        {label && (
          <label 
            htmlFor={textareaId} 
            className="block text-body-sm font-medium text-brand-primary-text mb-2 transition-colors duration-200"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            id={textareaId}
            ref={ref}
            className={combinedTextareaClasses}
            value={value}
            defaultValue={defaultValue}
            placeholder={placeholder}
            maxLength={maxLength}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            aria-invalid={!!error}
            aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
            {...props}
          />
          {/* Success checkmark */}
          {success && (
            <div className="absolute right-3 top-3 text-green-500 animate-scale-in">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
        {/* Footer with error/helper and char count */}
        <div className="flex justify-between items-start mt-2 gap-4">
          <div className="flex-1">
            {/* Error message with animation */}
            {error && (
              <p 
                id={`${textareaId}-error`}
                className="text-body-sm text-red-500 animate-slide-down flex items-center gap-1"
                role="alert"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            )}
            {/* Helper text */}
            {helperText && !error && (
              <p 
                id={`${textareaId}-helper`}
                className="text-body-sm text-brand-secondary-text"
              >
                {helperText}
              </p>
            )}
          </div>
          {/* Character count */}
          {showCharCount && (
            <p className={`text-caption ${getCharCountColor()} transition-colors duration-200 flex-shrink-0`}>
              {charCount}{maxLength ? `/${maxLength}` : ''}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Render floating label variant
  return (
    <div className={`relative ${widthClass}`}>
      <div className="relative">
        <textarea
          id={textareaId}
          ref={ref}
          className={combinedTextareaClasses}
          value={value}
          defaultValue={defaultValue}
          placeholder={isFocused ? placeholder : ' '}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />
        {/* Floating label */}
        {label && (
          <label
            htmlFor={textareaId}
            className={`
              absolute
              left-4
              transition-all
              duration-200
              ease-smooth
              pointer-events-none
              ${shouldFloat 
                ? 'top-2 text-caption text-brand-accent font-medium' 
                : 'top-4 text-body-md text-brand-muted-text'
              }
              ${error ? 'text-red-500' : ''}
              ${success ? 'text-green-500' : ''}
            `}
          >
            {label}
          </label>
        )}
        {/* Success checkmark */}
        {success && (
          <div className="absolute right-3 top-3 text-green-500 animate-scale-in">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      {/* Footer with error/helper and char count */}
      <div className="flex justify-between items-start mt-2 gap-4">
        <div className="flex-1">
          {/* Error message with animation */}
          {error && (
            <p 
              id={`${textareaId}-error`}
              className="text-body-sm text-red-500 animate-slide-down flex items-center gap-1"
              role="alert"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}
          {/* Helper text */}
          {helperText && !error && (
            <p 
              id={`${textareaId}-helper`}
              className="text-body-sm text-brand-secondary-text"
            >
              {helperText}
            </p>
          )}
        </div>
        {/* Character count */}
        {showCharCount && (
          <p className={`text-caption ${getCharCountColor()} transition-colors duration-200 flex-shrink-0`}>
            {charCount}{maxLength ? `/${maxLength}` : ''}
          </p>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
