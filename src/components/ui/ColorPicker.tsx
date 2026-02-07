'use client';

import { Check } from 'lucide-react';

interface ColorPickerProps {
  label?: string;
  colors: string[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export default function ColorPicker({
  label,
  colors,
  value,
  onChange,
  size = 'md',
  className = ''
}: ColorPickerProps) {
  const sizeClasses = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-3" role="radiogroup">
        {colors.map((color) => {
          const isSelected = value === color;

          return (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`Cor ${color}`}
              onClick={() => onChange(color)}
              className={`${sizeClasses} rounded-sm flex items-center justify-center cursor-pointer transition-transform hover:scale-105 ${isSelected
                ? 'ring-2 ring-offset-2 ring-[var(--color-primary)] ring-offset-[var(--color-bg-card)] scale-105'
                : 'ring-1 ring-transparent'
                }`}
              style={{ backgroundColor: color }}
            >
              {isSelected && <Check size={14} className="text-white" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
