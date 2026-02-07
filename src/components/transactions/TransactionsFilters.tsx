'use client';

import MonthSelector from '@/components/ui/MonthSelector';
import { Category } from '@/types';

interface TransactionsFiltersProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedCategoryId: string;
  onCategoryChange: (value: string) => void;
  categories: Category[];
  className?: string;
}

const selectChevronStyle = {
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
  backgroundPosition: 'right 1rem center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '1.5em 1.5em',
  paddingRight: '2.5rem'
};

export default function TransactionsFilters({
  selectedMonth,
  selectedYear,
  onMonthChange,
  selectedType,
  onTypeChange,
  selectedCategoryId,
  onCategoryChange,
  categories,
  className = ''
}: TransactionsFiltersProps) {
  return (
    <div className={`bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md p-3 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

        <div className="md:w-2/5 flex flex-col md:flex-row md:items-center md:justify-end gap-2">
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 appearance-none cursor-pointer"
            style={selectChevronStyle}
          >
            <option value="">Todos os tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
            <option value="investment">Aportes</option>
          </select>

          <select
            value={selectedCategoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            disabled={selectedType === 'investment'}
            className="w-full px-2 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={selectChevronStyle}
          >
            <option value="">Todas as categorias</option>
            {categories
              .filter(c => !selectedType || selectedType === 'investment' || c.type === selectedType)
              .map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>
        <div className="md:w-1/3">
          <MonthSelector
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={onMonthChange}
            className="bg-transparent border-0 rounded-none p-0"
          />
        </div>
      </div>
    </div>
  );
}
