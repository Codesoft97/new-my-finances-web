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
        <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
          {label}
        </label>
      )}

      <input
        ref={ref}
        className={`
          w-full px-3 py-2 rounded-md border
          bg-[var(--color-bg-card)] text-[var(--color-text)]
          placeholder:text-[var(--color-text-muted)]
          ${error
            ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger-light)]'
            : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary-light)]'
          }
          focus:outline-none focus:ring-2
          transition-colors duration-150
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="mt-2 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
