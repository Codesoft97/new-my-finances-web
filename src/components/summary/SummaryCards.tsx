'use client';

import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Clock } from 'lucide-react';

interface CardValues {
  effective: number;
  predicted: number;
}

interface SummaryCardsProps {
  income: CardValues;
  expense: CardValues;
  investments: CardValues;
  balance: CardValues;
  balanceLabel?: string;
  investmentsLabel?: string;
}

export default function SummaryCards({
  income,
  expense,
  investments,
  balance,
  balanceLabel = 'Saldo',
  investmentsLabel = 'Aportes'
}: SummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const PredictedRow = ({ value }: { value: number }) => (
    <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-[var(--color-warning)]">
          <Clock size={12} />
          Previsto
        </span>
        <span className="font-medium text-[var(--color-text-secondary)]">{formatCurrency(value)}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income Card */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 tracking-wide uppercase">Entradas</p>
              <h3 className="text-lg font-medium text-[var(--color-text)] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                {formatCurrency(income.effective)}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-md bg-[var(--color-success)]/10 flex items-center justify-center text-[var(--color-success)]">
              <TrendingUp size={18} />
            </div>
          </div>
          <PredictedRow value={income.predicted} />
        </div>

        {/* Expense Card */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 tracking-wide uppercase">Saídas</p>
              <h3 className="text-lg font-medium text-[var(--color-text)] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                {formatCurrency(expense.effective)}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-md bg-[var(--color-danger)]/10 flex items-center justify-center text-[var(--color-danger)]">
              <TrendingDown size={18} />
            </div>
          </div>
          <PredictedRow value={expense.predicted} />
        </div>

        {/* Investments Card */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 tracking-wide uppercase">{investmentsLabel}</p>
              <h3 className="text-lg font-medium text-[var(--color-text)] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                {formatCurrency(investments.effective)}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-md bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              <PiggyBank size={18} />
            </div>
          </div>
          <PredictedRow value={investments.predicted} />
        </div>

        {/* Balance Card */}
        <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-md p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium mb-1 text-[var(--color-text-secondary)] tracking-wide uppercase">{balanceLabel}</p>
              <h3 className="text-lg md:text-xl font-medium text-[var(--color-text)] tracking-tight break-all leading-tight">
                {formatCurrency(balance.effective)}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-md border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)]">
              <DollarSign size={18} />
            </div>
          </div>
          <PredictedRow value={balance.predicted} />
        </div>
      </div>
    </div>
  );
}
