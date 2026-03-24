import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  id,
  ...props
}) => {
  const inputId = id ?? label?.replace(/\s/g, '-').toLowerCase();

  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {props.required && (
            <span className="text-red-500 mr-1">*</span>
          )}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          className={`
            w-full px-3 py-2 rounded-lg border text-sm
            bg-white text-gray-900 placeholder-gray-400
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-gray-300 hover:border-gray-400'
            }
            ${leftIcon ? 'pr-10' : ''}
            ${rightIcon ? 'pl-10' : ''}
            ${className}
          `}
          {...props}
        />

        {rightIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span>⚠</span>
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
};

export default Input;
