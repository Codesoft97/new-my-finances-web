'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function MonthSelector({ selectedMonth, selectedYear, onMonthChange }: MonthSelectorProps) {
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
    <div className="flex items-center justify-between bg-[var(--color-bg-card)] rounded-xl p-4 shadow-md mb-6">
      <button
        onClick={handlePreviousMonth}
        className="p-2 rounded-lg hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-[var(--color-text)] capitalize">
          {MONTHS[selectedMonth - 1]} {selectedYear}
        </span>
      </div>

      <button
        onClick={handleNextMonth}
        className="p-2 rounded-lg hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
