import { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

interface BaseFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
  helpText?: string;
}

interface InputFieldProps extends BaseFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  type?: 'input';
}

interface TextareaFieldProps extends BaseFieldProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  type: 'textarea';
  rows?: number;
}

interface SelectFieldProps extends BaseFieldProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  type: 'select';
  children: ReactNode;
}

type FormFieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps;

export default function FormField(props: FormFieldProps) {
  const { label, error, required, className = '', helpText, type = 'input', ...fieldProps } = props;

  const baseClasses = `
    w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
  `;

  const renderField = () => {
    switch (type) {
      case 'textarea':
        const textareaProps = fieldProps as TextareaFieldProps;
        return (
          <textarea
            {...textareaProps}
            className={baseClasses}
            rows={textareaProps.rows || 3}
          />
        );
      
      case 'select':
        const selectProps = fieldProps as SelectFieldProps;
        return (
          <select
            {...selectProps}
            className={baseClasses}
          >
            {selectProps.children}
          </select>
        );
      
      default:
        const inputProps = fieldProps as InputFieldProps;
        return (
          <input
            {...inputProps}
            className={baseClasses}
          />
        );
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {renderField()}
      
      {error && (
        <div className="mt-1 flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
}