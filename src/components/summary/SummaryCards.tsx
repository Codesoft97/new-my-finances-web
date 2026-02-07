'use client';

import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react';

interface SummaryCardsProps {
  income: number;
  expense: number;
  investments: number;
  totalBalance: number;
  balanceLabel?: string;
  investmentsLabel?: string;
}

export default function SummaryCards({
  income,
  expense,
  investments,
  totalBalance,
  balanceLabel = 'Saldo Total (Contas)',
  investmentsLabel = 'Aportes'
}: SummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income Card */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 tracking-wide uppercase">Entradas</p>
              <h3 className="text-lg font-medium text-[var(--color-text)] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                {formatCurrency(income)}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-md bg-[var(--color-success)]/10 flex items-center justify-center text-[var(--color-success)]">
              <TrendingUp size={18} />
            </div>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 tracking-wide uppercase">Saídas</p>
              <h3 className="text-lg font-medium text-[var(--color-text)] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                {formatCurrency(expense)}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-md bg-[var(--color-danger)]/10 flex items-center justify-center text-[var(--color-danger)]">
              <TrendingDown size={18} />
            </div>
          </div>
        </div>

        {/* Investments Card */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 tracking-wide uppercase">{investmentsLabel}</p>
              <h3 className="text-lg font-medium text-[var(--color-text)] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                {formatCurrency(investments)}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-md bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              <PiggyBank size={18} />
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-md p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium mb-1 text-[var(--color-text-secondary)] tracking-wide uppercase">{balanceLabel}</p>
              <h3 className="text-lg md:text-xl font-medium text-[var(--color-text)] tracking-tight break-all leading-tight">
                {formatCurrency(totalBalance)}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-md border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)]">
              <DollarSign size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
