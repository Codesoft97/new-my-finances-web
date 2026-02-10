'use client';

import { Wallet } from 'lucide-react';

interface TotalBalanceBannerProps {
  totalBalance: number;
}

export default function TotalBalanceBanner({ totalBalance }: TotalBalanceBannerProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-md">
      <Wallet size={16} className="text-[var(--color-text-muted)]" />
      <div>
        <p className="text-[9px] font-medium text-[var(--color-text-muted)] tracking-wide uppercase leading-none mb-0.5">
          Saldo das Contas
        </p>
        <p className="text-sm font-medium text-[var(--color-text)] tracking-tight leading-none">
          {formatCurrency(totalBalance)}
        </p>
      </div>
    </div>
  );
}
