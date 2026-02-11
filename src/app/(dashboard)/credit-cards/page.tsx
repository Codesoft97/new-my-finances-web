'use client';

import { useState } from 'react';
import { Plus, CreditCard as CreditCardIcon } from 'lucide-react';
import { useCreditCards } from '@/hooks/useCreditCards';
import CreditCardModal from '@/components/credit-cards/CreditCardModal';
import CreditCardCard from '@/components/credit-cards/CreditCardCard';
import Button from '@/components/ui/Button';

export default function CreditCardsPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const { creditCards, isLoading } = useCreditCards(selectedMonth, selectedYear);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-[var(--color-text)]">Cartões de Crédito</h1>
            <p className="text-[var(--color-text-secondary)]">Gerencie seus cartões e faturas</p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Novo Cartão</span>
          </Button>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-elevated)] rounded-md transition-colors cursor-pointer"
          >
            ‹
          </button>
          <span className="text-sm font-medium text-[var(--color-text)] min-w-[140px] text-center">
            {MONTHS[selectedMonth - 1]} {selectedYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-elevated)] rounded-md transition-colors cursor-pointer"
          >
            ›
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-md bg-[var(--color-bg-elevated)] animate-pulse" />
            ))}
          </div>
        ) : creditCards?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-[var(--color-border)] rounded-md bg-[var(--color-bg-card)] text-center">
            <div className="w-14 h-14 rounded-md bg-[var(--color-bg-elevated)] flex items-center justify-center mb-4">
              <CreditCardIcon size={32} className="text-[var(--color-text-muted)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">Nenhum cartão cadastrado</h3>
            <p className="text-[var(--color-text-secondary)] max-w-sm mb-6">
              Cadastre seus cartões de crédito para controlar suas faturas e despesas parceladas.
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus size={20} />
              Cadastrar Primeiro Cartão
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {creditCards?.map((card) => (
              <CreditCardCard key={card._id} card={card} />
            ))}
          </div>
        )}

        <CreditCardModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      </div>
    </div>
  );
}
