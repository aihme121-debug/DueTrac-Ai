import React, { useState, useCallback } from 'react';
import { cn } from '../../utils/cn';

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'datetime-local';
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  defaultValue?: any;
  className?: string;
}

export interface DynamicFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onChange?: (data: Record<string, any>) => void;
  submitText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onCancel?: () => void;
  className?: string;
  layout?: 'vertical' | 'horizontal' | 'inline';
  validateOnChange?: boolean;
  resetOnSubmit?: boolean;
  loading?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  onSubmit,
  onChange,
  submitText = 'Submit',
  cancelText = 'Cancel',
  showCancel = false,
  onCancel,
  className,
  layout = 'vertical',
  validateOnChange = false,
  resetOnSubmit = true,
  loading = false
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach(field => {
      initial[field.name] = field.defaultValue ?? '';
    });
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((field: FormField, value: any): string => {
    if (field.required && !value) {
      return `${field.label || field.name} is required`;
    }

    if (field.validation) {
      if (field.validation.minLength && value?.length < field.validation.minLength) {
        return `${field.label || field.name} must be at least ${field.validation.minLength} characters`;
      }
      if (field.validation.maxLength && value?.length > field.validation.maxLength) {
        return `${field.label || field.name} must be no more than ${field.validation.maxLength} characters`;
      }
      if (field.validation.pattern && !new RegExp(field.validation.pattern).test(value)) {
        return `${field.label || field.name} format is invalid`;
      }
      if (field.validation.min !== undefined && Number(value) < field.validation.min) {
        return `${field.label || field.name} must be at least ${field.validation.min}`;
      }
      if (field.validation.max !== undefined && Number(value) > field.validation.max) {
        return `${field.label || field.name} must be no more than ${field.validation.max}`;
      }
    }

    return '';
  }, []);

  const handleChange = useCallback((fieldName: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [fieldName]: value };
      if (onChange) {
        onChange(newData);
      }
      return newData;
    });

    if (validateOnChange) {
      const field = fields.find(f => f.name === fieldName);
      if (field) {
        const error = validateField(field, value);
        setErrors(prev => ({ ...prev, [fieldName]: error }));
      }
    }
  }, [fields, onChange, validateOnChange, validateField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(formData);
        if (resetOnSubmit) {
          setFormData(() => {
            const reset: Record<string, any> = {};
            fields.forEach(field => {
              reset[field.name] = field.defaultValue ?? '';
            });
            return reset;
          });
        }
      } catch (error) {
        console.error('Form submission error:', error);
        setErrors({ submit: 'Submission failed. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] ?? '';
    const error = errors[field.name];

    const baseInputClass = cn(
      'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
      error ? 'border-red-300' : 'border-gray-300',
      field.className
    );

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={value}
            placeholder={field.placeholder}
            disabled={field.disabled || loading}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={baseInputClass + ' min-h-[100px]'}
            required={field.required}
          />
        );

      case 'select':
        return (
          <select
            id={field.name}
            name={field.name}
            value={value}
            disabled={field.disabled || loading}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={baseInputClass}
            required={field.required}
          >
            <option value="">Select...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              id={field.name}
              name={field.name}
              checked={Boolean(value)}
              disabled={field.disabled || loading}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              className="mr-2"
              required={field.required}
            />
            {field.label}
          </label>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.name}-${option.value}`}
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  disabled={field.disabled || loading}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="mr-2"
                  required={field.required}
                />
                {option.label}
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type={field.type}
            id={field.name}
            name={field.name}
            value={value}
            placeholder={field.placeholder}
            disabled={field.disabled || loading}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={baseInputClass}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
            pattern={field.validation?.pattern}
          />
        );
    }
  };

  const layoutClasses = {
    vertical: 'space-y-4',
    horizontal: 'space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4',
    inline: 'flex flex-wrap gap-4'
  };

  return (
    <form onSubmit={handleSubmit} className={cn('w-full', className)}>
      <div className={layoutClasses[layout]}>
        {fields.map(field => (
          <div key={field.name} className={cn({
            'flex items-center space-x-2': layout === 'inline'
          })}>
            {field.type !== 'checkbox' && field.label && (
              <label 
                htmlFor={field.name} 
                className={cn('block text-sm font-medium text-gray-700', {
                  'sr-only': layout === 'inline'
                })}
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            {renderField(field)}
            {errors[field.name] && (
              <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>

      {errors.submit && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <div className={cn('mt-6 flex', {
        'justify-end': layout === 'vertical',
        'gap-3': showCancel
      })}>
        {showCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {cancelText}
          </button>
        )}
        <button
          type="submit"
          disabled={loading || isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {(loading || isSubmitting) ? 'Submitting...' : submitText}
        </button>
      </div>
    </form>
  );
};

export default DynamicForm;