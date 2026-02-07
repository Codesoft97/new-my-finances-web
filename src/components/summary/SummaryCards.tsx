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
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Income Card */}
        <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 shadow-sm border border-[var(--color-border-light)] relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Entradas</p>
              <h3 className="text-2xl font-bold text-[var(--color-text)] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                {formatCurrency(income)}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-success)]/10 flex items-center justify-center text-[var(--color-success)] group-hover:scale-110 transition-transform duration-300">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 shadow-sm border border-[var(--color-border-light)] relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Saídas</p>
              <h3 className="text-2xl font-bold text-[var(--color-text)] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                {formatCurrency(expense)}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-danger)]/10 flex items-center justify-center text-[var(--color-danger)] group-hover:scale-110 transition-transform duration-300">
              <TrendingDown size={24} />
            </div>
          </div>
        </div>

        {/* Investments Card */}
        <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 shadow-sm border border-[var(--color-border-light)] relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">{investmentsLabel}</p>
              <h3 className="text-2xl font-bold text-[var(--color-text)] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                {formatCurrency(investments)}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] group-hover:scale-110 transition-transform duration-300">
              <PiggyBank size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className={`
        bg-gradient-to-br rounded-2xl p-6 shadow-lg relative overflow-hidden text-white group hover:shadow-xl transition-all
        ${totalBalance < 0
          ? 'from-[var(--color-danger)] to-[var(--color-danger-dark)] shadow-[var(--color-danger)]/20 hover:shadow-[var(--color-danger)]/30'
          : 'from-[var(--color-primary)] to-[var(--color-primary-dark)] shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/30'
        }
      `}>
        <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <DollarSign size={120} />
        </div>
        <div className="flex items-center justify-between relative z-10">
          <div className="min-w-0">
            <p className="text-sm font-medium mb-1 text-white/80">{balanceLabel}</p>
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight break-all leading-tight">
              {formatCurrency(totalBalance)}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 shadow-inner">
            <DollarSign size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
