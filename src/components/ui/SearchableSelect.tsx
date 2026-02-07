'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  color?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Selecione uma opção',
  label,
  error,
  disabled = false
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
          {label}
        </label>
      )}

      <div
        className={`
          relative w-full rounded-xl border-2 bg-[var(--color-bg-card)] transition-all cursor-pointer
          ${error
            ? 'border-[var(--color-danger)] focus-within:ring-[var(--color-danger)]/20'
            : 'border-[var(--color-border)] focus-within:border-[var(--color-primary)] focus-within:ring-[var(--color-primary)]/20'
          }
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-[var(--color-border-hover)]'}
          focus-within:ring-4 focus-within:outline-none
        `}
        onClick={() => !disabled && setIsOpen(true)}
      >
        <div className="flex items-center px-4 py-3 min-h-[50px]">
          {selectedOption && !isOpen ? (
            <div className="flex items-center gap-2 flex-1">
              {selectedOption.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedOption.color }}
                />
              )}
              <span className="text-[var(--color-text)] font-medium">
                {selectedOption.label}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <Search size={18} className="text-[var(--color-text-muted)]" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={selectedOption ? selectedOption.label : placeholder}
                className="w-full bg-transparent border-none focus:ring-0 p-0 text-[var(--color-text)] placeholder-[var(--color-text-muted)]"
                disabled={disabled}
                autoFocus={isOpen}
              />
            </div>
          )}

          <div className="flex items-center gap-2 ml-2">
            {selectedOption && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                className="p-1 hover:bg-[var(--color-bg-elevated)] rounded-full text-[var(--color-text-muted)]"
              >
                <X size={16} />
              </button>
            )}
            <ChevronDown size={20} className="text-[var(--color-text-muted)]" />
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-[var(--color-danger)]">{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="p-4 text-center text-[var(--color-text-muted)]">
              Nenhuma opção encontrada
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors
                    ${value === option.id
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                      : 'hover:bg-[var(--color-bg-elevated)] text-[var(--color-text)]'
                    }
                  `}
                >
                  {option.color && (
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: option.color }}
                    />
                  )}
                  <span className="font-medium truncate">{option.label}</span>
                  {value === option.id && (
                    <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] ml-auto" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
