'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
  className?: string;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function MonthSelector({ selectedMonth, selectedYear, onMonthChange, className = '' }: MonthSelectorProps) {
  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      onMonthChange(12, selectedYear - 1);
    } else {
      onMonthChange(selectedMonth - 1, selectedYear);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      onMonthChange(1, selectedYear + 1);
    } else {
      onMonthChange(selectedMonth + 1, selectedYear);
    }
  };

  return (
      <div className="flex items-center justify-between md:justify-end gap-3">
      <button
        onClick={handlePreviousMonth}
        className="p-2 rounded-md hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
      >
        <ChevronLeft size={18} />
      </button>

      <span className="text-sm font-medium text-[var(--color-text)] capitalize">
        {MONTHS[selectedMonth - 1]} {selectedYear}
      </span>

      <button
        onClick={handleNextMonth}
        className="p-2 rounded-md hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
      >
        <ChevronRight size={18} />
      </button>
      </div>
  );
}
