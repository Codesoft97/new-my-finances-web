import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ 
  label, 
  error, 
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <input
        ref={ref}
        className={`
          w-full px-4 py-3 rounded-lg border-2  text-gray-700 
          ${error ? 'border-red-500' : 'border-gray-300'}
          focus:outline-none focus:ring-4 
          ${error ? 'focus:ring-red-200' : 'focus:ring-primary-200'}
          ${error ? 'focus:border-red-500' : 'focus:border-primary-500'}
          transition-all duration-200
          ${className}
        `}
        {...props}
      />
      
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;