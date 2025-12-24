import { ReactNode, FormEvent, useState, createContext, useContext, useCallback } from 'react';
import { ErrorMessage } from '../Common';
import { useErrorHandler } from '../../hooks/useErrorHandler';

// Form Context for sharing form state
interface FormContextValue {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  values: Record<string, unknown>;
  setFieldValue: (name: string, value: unknown) => void;
  setFieldTouched: (name: string) => void;
  setFieldError: (name: string, error: string) => void;
  isSubmitting: boolean;
}

const FormContext = createContext<FormContextValue | null>(null);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within an AdminForm');
  }
  return context;
};

// Validation types
export type ValidationRule<T> = (value: T, values: Record<string, unknown>) => string | undefined;

export interface FieldConfig {
  name: string;
  validate?: ValidationRule<unknown>[];
}

export interface AdminFormProps<T extends Record<string, unknown>> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void> | void;
  validate?: (values: T) => Record<string, string>;
  children: ReactNode;
  className?: string;
  enableRetry?: boolean;
  onError?: (error: Error) => void;
}

// Common validation rules
export const required = (message = 'This field is required'): ValidationRule<unknown> => 
  (value) => {
    if (value === undefined || value === null || value === '') {
      return message;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return message;
    }
    return undefined;
  };

export const email = (message = 'Invalid email address'): ValidationRule<unknown> =>
  (value) => {
    if (!value) return undefined;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof value === 'string' && !emailRegex.test(value)) {
      return message;
    }
    return undefined;
  };

export const minLength = (min: number, message?: string): ValidationRule<unknown> =>
  (value) => {
    if (!value) return undefined;
    if (typeof value === 'string' && value.length < min) {
      return message || `Must be at least ${min} characters`;
    }
    return undefined;
  };

export const maxLength = (max: number, message?: string): ValidationRule<unknown> =>
  (value) => {
    if (!value) return undefined;
    if (typeof value === 'string' && value.length > max) {
      return message || `Must be at most ${max} characters`;
    }
    return undefined;
  };

export const pattern = (regex: RegExp, message: string): ValidationRule<unknown> =>
  (value) => {
    if (!value) return undefined;
    if (typeof value === 'string' && !regex.test(value)) {
      return message;
    }
    return undefined;
  };

export const min = (minValue: number, message?: string): ValidationRule<unknown> =>
  (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'number' && value < minValue) {
      return message || `Must be at least ${minValue}`;
    }
    return undefined;
  };

export const max = (maxValue: number, message?: string): ValidationRule<unknown> =>
  (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'number' && value > maxValue) {
      return message || `Must be at most ${maxValue}`;
    }
    return undefined;
  };


function AdminForm<T extends Record<string, unknown>>({
  initialValues,
  onSubmit,
  validate,
  children,
  className = '',
  enableRetry = true,
  onError,
}: AdminFormProps<T>) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const errorHandler = useErrorHandler({
    enableRetry,
    onError: (errorDetails) => {
      if (onError) {
        onError(new Error(errorDetails.message));
      }
    }
  });

  const setFieldValue = useCallback((name: string, value: unknown) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const setFieldTouched = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const setFieldError = useCallback((name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Run validation
    let validationErrors: Record<string, string> = {};
    if (validate) {
      validationErrors = validate(values as T);
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Mark all fields with errors as touched
      const touchedFields: Record<string, boolean> = {};
      Object.keys(validationErrors).forEach(key => {
        touchedFields[key] = true;
      });
      setTouched(prev => ({ ...prev, ...touchedFields }));
      return;
    }

    setIsSubmitting(true);
    
    const result = await errorHandler.executeWithErrorHandling(
      async () => {
        const submitResult = onSubmit(values as T);
        if (submitResult instanceof Promise) {
          return await submitResult;
        }
        return submitResult;
      },
      { formValues: values }
    );
    
    setIsSubmitting(false);
    
    // If submission was successful, optionally reset form or handle success
    if (result !== null) {
      // Form submitted successfully
      errorHandler.clearErrors();
    }
  };

  const contextValue: FormContextValue = {
    errors,
    touched,
    values,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    isSubmitting,
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit} className={className}>
        {/* Display form-level errors */}
        {errorHandler.hasErrors && (
          <div className="mb-6">
            <ErrorMessage
              message={errorHandler.latestError?.message || 'An error occurred while submitting the form'}
              onRetry={enableRetry ? () => handleSubmit(new Event('submit') as any) : undefined}
              onDismiss={() => errorHandler.clearErrors()}
              type="error"
            />
          </div>
        )}
        
        {children}
      </form>
    </FormContext.Provider>
  );
}

// Form Field Component
interface FormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: { label: string; value: string }[];
  rows?: number;
  disabled?: boolean;
  className?: string;
}

export const FormField = ({
  name,
  label,
  type = 'text',
  placeholder,
  required,
  helpText,
  options,
  rows = 3,
  disabled,
  className = '',
}: FormFieldProps) => {
  const { values, errors, touched, setFieldValue, setFieldTouched, isSubmitting } = useFormContext();
  
  const value = values[name] ?? '';
  const error = touched[name] ? errors[name] : undefined;
  const isDisabled = disabled || isSubmitting;

  const baseInputClasses = `
    block w-full px-4 py-3 border rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-100 disabled:cursor-not-allowed
    transition-colors duration-200
    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
    touch-manipulation
  `;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = type === 'number' ? (e.target.value ? Number(e.target.value) : '') : e.target.value;
    setFieldValue(name, newValue);
  };

  const handleBlur = () => {
    setFieldTouched(name);
  };

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value as string}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          rows={rows}
          disabled={isDisabled}
          className={baseInputClasses}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value as string}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isDisabled}
          className={baseInputClasses}
        >
          <option value="">{placeholder || 'Select...'}</option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value as string | number}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={isDisabled}
          className={baseInputClasses}
        />
      )}

      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};


// Form Actions Component
interface FormActionsProps {
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  showCancel?: boolean;
  className?: string;
}

export const FormActions = ({
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel,
  showCancel = true,
  className = '',
}: FormActionsProps) => {
  const { isSubmitting } = useFormContext();

  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 ${className}`}>
      {showCancel && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-3 sm:py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 touch-manipulation"
        >
          {cancelLabel}
        </button>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-3 sm:py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 transition-colors duration-200 touch-manipulation"
      >
        {isSubmitting && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {isSubmitting ? 'Submitting...' : submitLabel}
      </button>
    </div>
  );
};

// Form Section Component for grouping fields
interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const FormSection = ({
  title,
  description,
  children,
  className = '',
}: FormSectionProps) => (
  <div className={`space-y-4 ${className}`}>
    {(title || description) && (
      <div className="border-b border-gray-200 pb-4">
        {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
    )}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
      {children}
    </div>
  </div>
);

export default AdminForm;
