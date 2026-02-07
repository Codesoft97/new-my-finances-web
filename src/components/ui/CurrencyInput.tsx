'use client';

import { forwardRef, useState, useEffect, InputHTMLAttributes } from 'react';

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
}

function formatCurrencyValue(cents: number): string {
  if (cents === 0) return '0,00';

  const reais = Math.floor(cents / 100);
  const centavos = cents % 100;

  const reaisFormatted = reais.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const centavosFormatted = centavos.toString().padStart(2, '0');

  return `${reaisFormatted},${centavosFormatted}`;
}

function parseCurrencyToNumber(formatted: string): number {
  // Remove all non-numeric characters
  const numericOnly = formatted.replace(/\D/g, '');
  const cents = parseInt(numericOnly, 10) || 0;
  return cents / 100;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ label, error, value, onChange, className = '', ...rest }, ref) => {
    const [displayValue, setDisplayValue] = useState('0,00');
    const [cents, setCents] = useState(0);

    // Initialize from value prop
    useEffect(() => {
      if (value !== undefined && value !== '') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          const initialCents = Math.round(numValue * 100);
          setCents(initialCents);
          setDisplayValue(formatCurrencyValue(initialCents));
        }
      } else if (value === '') {
        setCents(0);
        setDisplayValue('0,00');
      }
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow only numbers and control keys
      const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'];

      if (allowedKeys.includes(e.key)) {
        if (e.key === 'Backspace') {
          e.preventDefault();
          const newCents = Math.floor(cents / 10);
          setCents(newCents);
          setDisplayValue(formatCurrencyValue(newCents));
          onChange?.(String(newCents / 100));
        }
        return;
      }

      // Allow only digits
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
        return;
      }

      e.preventDefault();

      // Add digit to cents
      const digit = parseInt(e.key, 10);
      const newCents = cents * 10 + digit;

      // Limit to reasonable value (999,999,999.99)
      if (newCents > 99999999999) return;

      setCents(newCents);
      setDisplayValue(formatCurrencyValue(newCents));
      onChange?.(String(newCents / 100));
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Select all on focus
      e.target.select();
    };

    return (
      <div>
        {label && (
          <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] font-medium">
            R$
          </span>
          <input
            ref={ref}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={() => { }} // Controlled via onKeyDown
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            className={`
              w-full pl-10 pr-3 py-2 rounded-md border font-medium text-right text-base
              bg-[var(--color-bg-card)] text-[var(--color-text)]
              ${error
                ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger-light)]'
                : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary-light)]'
              }
              focus:outline-none focus:ring-2
              ${className}
            `}
            {...rest}
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-[var(--color-danger)]">{error}</p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
