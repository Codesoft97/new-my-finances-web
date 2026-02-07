'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export type DateRangeFilterValue = {
  mode: 'month' | 'last3' | 'last6' | 'year';
  month: number;
  year: number;
};

interface DateRangeFilterProps {
  value: DateRangeFilterValue;
  onChange: (value: DateRangeFilterValue) => void;
  className?: string;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const shiftMonth = (month: number, year: number, offset: number) => {
  let nextMonth = month + offset;
  let nextYear = year;

  while (nextMonth <= 0) {
    nextMonth += 12;
    nextYear -= 1;
  }

  while (nextMonth > 12) {
    nextMonth -= 12;
    nextYear += 1;
  }

  return { month: nextMonth, year: nextYear };
};

export default function DateRangeFilter({ value, onChange, className = '' }: DateRangeFilterProps) {
  const { mode, month, year } = value;

  const modes = [
    { id: 'month', label: 'Mês' },
    { id: 'last3', label: 'Ultimos 3 meses' },
    { id: 'last6', label: 'Ultimos 6 meses' },
    { id: 'year', label: 'Ano' },
  ] as const;

  const handlePrevMonth = () => {
    const next = shiftMonth(month, year, -1);
    onChange({ ...value, ...next });
  };

  const handleNextMonth = () => {
    const next = shiftMonth(month, year, 1);
    onChange({ ...value, ...next });
  };

  const handlePrevYear = () => {
    onChange({ ...value, year: year - 1 });
  };

  const handleNextYear = () => {
    onChange({ ...value, year: year + 1 });
  };

  const getRangeLabel = (count: number) => {
    const start = shiftMonth(month, year, -(count - 1));
    return `${MONTHS[start.month - 1]} ${start.year} - ${MONTHS[month - 1]} ${year}`;
  };

  return (
    <div className={`bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md p-3 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {modes.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'last3' || item.id === 'last6') {
                  const now = new Date();
                  onChange({
                    mode: item.id,
                    month: now.getMonth() + 1,
                    year: now.getFullYear(),
                  });
                  return;
                }

                onChange({ ...value, mode: item.id });
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm border transition-colors cursor-pointer
                ${mode === item.id
                  ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text)] border-[var(--color-border-hover)]'
                  : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text)] hover:border-[var(--color-border-hover)]'
                }
              `}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3">
          {mode === 'month' && (
            <>
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-md hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-medium text-[var(--color-text)]">
                {MONTHS[month - 1]} {year}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-md hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {mode === 'year' && (
            <>
              <button
                onClick={handlePrevYear}
                className="p-2 rounded-md hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-medium text-[var(--color-text)]">Ano {year}</span>
              <button
                onClick={handleNextYear}
                className="p-2 rounded-md hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {(mode === 'last3' || mode === 'last6') && (
            <div className="text-right">
              <p className="text-sm font-medium text-[var(--color-text)]">
                {mode === 'last3' ? 'Ultimos 3 meses' : 'Ultimos 6 meses'}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {mode === 'last3' ? getRangeLabel(3) : getRangeLabel(6)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
