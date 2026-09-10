import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  icon,
  iconRight,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-muted">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full h-10 px-3 bg-bg-secondary rounded-md border text-text-primary
            placeholder:text-text-dim text-sm
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            ${icon ? 'pl-10' : ''}
            ${iconRight ? 'pr-10' : ''}
            ${error ? 'border-error focus:ring-error' : 'border-border-default hover:border-border-hover'}
          `}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim">
            {iconRight}
          </div>
        )}
      </div>
      {error && (
        <span className="text-xs text-error">{error}</span>
      )}
      {helper && !error && (
        <span className="text-xs text-text-dim">{helper}</span>
      )}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helper,
  className = '',
  id,
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-text-muted">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`
          w-full px-3 py-2 bg-bg-secondary rounded-md border text-text-primary
          placeholder:text-text-dim text-sm resize-none
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
          ${error ? 'border-error focus:ring-error' : 'border-border-default hover:border-border-hover'}
        `}
        {...props}
      />
      {error && (
        <span className="text-xs text-error">{error}</span>
      )}
      {helper && !error && (
        <span className="text-xs text-text-dim">{helper}</span>
      )}
    </div>
  );
};
