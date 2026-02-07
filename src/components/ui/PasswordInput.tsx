'use client';

import { forwardRef, InputHTMLAttributes, useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { validatePassword } from '@/utils/passwordValidator';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  showStrengthMeter?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({
  label,
  error,
  showStrengthMeter = true,
  className = '',
  value,
  onChange,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState('');

  // Keep track of the password value for validation
  const passwordValue = typeof value === 'string' ? value : internalValue;
  const validation = validatePassword(passwordValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
    onChange?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];
  const strengthLabels = ['Muito Fraca', 'Fraca', 'Média', 'Forte', 'Muito Forte'];

  const showValidation = showStrengthMeter && passwordValue && (isFocused || error);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`
            w-full px-3 py-2 pr-10 rounded-md border
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

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Strength meter */}
      {showValidation && (
        <div className="mt-3 space-y-2">
          {/* Strength bar */}
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="h-1.5 flex-1 rounded-sm transition-all duration-300"
                style={{
                  backgroundColor: level <= validation.strength
                    ? strengthColors[validation.strength]
                    : 'var(--color-border)'
                }}
              />
            ))}
          </div>

          {/* Strength label */}
          <p
            className="text-xs font-medium"
            style={{ color: strengthColors[validation.strength] }}
          >
            Força: {strengthLabels[validation.strength]}
          </p>

          {/* Validation errors */}
          {validation.errors.length > 0 && (
            <ul className="text-xs text-[var(--color-danger)] space-y-0.5">
              {validation.errors.slice(0, 3).map((err, i) => (
                <li key={i} className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-sm bg-current" />
                  {err}
                </li>
              ))}
              {validation.errors.length > 3 && (
                <li className="text-[var(--color-text-muted)]">
                  +{validation.errors.length - 3} mais requisitos
                </li>
              )}
            </ul>
          )}
        </div>
      )}

      {/* Error message from form validation */}
      {error && !showValidation && (
        <p className="mt-2 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
