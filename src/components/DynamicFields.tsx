import React from 'react';
import { FieldConfig, DynamicFormData } from '../../api/types';

interface DynamicFieldsProps {
  fields: FieldConfig[];
  values: DynamicFormData;
  onChange: (values: DynamicFormData) => void;
  errors?: Record<string, string>;
}

export default function DynamicFields({ fields, values, onChange, errors = {} }: DynamicFieldsProps) {
  const handleFieldChange = (fieldName: string, value: any) => {
    onChange({
      ...values,
      [fieldName]: value
    });
  };

  const renderField = (field: FieldConfig) => {
    const fieldValue = values[field.name] || '';
    const fieldError = errors[field.name];
    const baseClasses = `w-full px-3 py-2 border rounded-md text-sm ${
      fieldError ? 'border-red-300' : 'border-gray-300'
    }`;

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={baseClasses}
            required={field.required}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={baseClasses}
            required={field.required}
          />
        );

      case 'phone':
        return (
          <input
            type="tel"
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={baseClasses}
            required={field.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || '')}
            placeholder={field.placeholder}
            className={baseClasses}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );

      case 'select':
        return (
          <select
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className={baseClasses}
            required={field.required}
          >
            <option value="">Selecione...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(fieldValue) ? fieldValue : [];
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter(v => v !== option);
                    handleFieldChange(field.name, newValues);
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'textarea':
        return (
          <textarea
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={baseClasses}
            required={field.required}
          />
        );



      case 'date':
          return (
            <input
              type="date"
              value={fieldValue}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={baseClasses}
              required={field.required}
            />
          );





      default:
        return (
          <input
            type="text"
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={baseClasses}
            required={field.required}
          />
        );
    }
  };

  if (!fields || fields.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.name}>
          {(
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
  );
}