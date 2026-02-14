'use client';

import { AlertTriangle } from 'lucide-react';

interface SpendingLimitImpactNoticeProps {
  categoryName: string;
  limitAmount: number;
  spentAmount: number;
  nextExpenseAmount: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const calculatePercentage = (value: number, total: number) => {
  if (total <= 0) return 0;
  const percentage = (value / total) * 100;
  return Number.isFinite(percentage) ? Math.max(percentage, 0) : 0;
};

export default function SpendingLimitImpactNotice({
  categoryName,
  limitAmount,
  spentAmount,
  nextExpenseAmount,
}: SpendingLimitImpactNoticeProps) {
  if (limitAmount <= 0 || nextExpenseAmount <= 0) return null;

  const projectedSpent = spentAmount + nextExpenseAmount;
  const projectedPercentage = calculatePercentage(projectedSpent, limitAmount);
  const projectedProgressWidth = Math.min(projectedPercentage, 100);
  const remainingAfter = limitAmount - projectedSpent;
  const isOverLimit = projectedSpent > limitAmount;

  return (
    <div
      data-testid="spending-limit-impact-notice"
      className={`p-3 rounded-md border ${
        isOverLimit
          ? 'bg-[var(--color-danger)]/10 border-[var(--color-danger)]/30'
          : 'bg-[var(--color-warning)]/10 border-[var(--color-warning)]/30'
      }`}
    >
      <div className="flex items-start gap-2 mb-3">
        <AlertTriangle
          size={16}
          className={`mt-0.5 ${isOverLimit ? 'text-[var(--color-danger)]' : 'text-[var(--color-warning-dark)]'}`}
        />
        <div>
          <p className="text-sm font-medium text-[var(--color-text)]">
            Impacto no limite da categoria {categoryName}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Veja como esta nova despesa afeta o limite configurado.
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-[var(--color-text-secondary)]">
          <span>Apos lancamento</span>
          <span className={`font-medium ${isOverLimit ? 'text-[var(--color-danger)]' : 'text-[var(--color-text)]'}`}>
            {formatCurrency(projectedSpent)} ({projectedPercentage.toFixed(1)}%)
          </span>
        </div>
      </div>

      <div className="mt-3">
        <div className="w-full bg-[var(--color-bg-elevated)] rounded-sm h-2.5 overflow-hidden">
          <div
            className="h-2.5 rounded-sm transition-all duration-500"
            style={{
              width: `${projectedProgressWidth}%`,
              backgroundColor: isOverLimit ? 'var(--color-danger)' : 'var(--color-warning)',
            }}
          ></div>
        </div>
      </div>

      <div className="mt-2 text-xs">
        {isOverLimit ? (
          <p className="text-[var(--color-danger)]">
            Esse lancamento ultrapassa o limite em <strong>{formatCurrency(projectedSpent - limitAmount)}</strong>.
          </p>
        ) : (
          <p className="text-[var(--color-text-secondary)]">
            Restante apos lancamento: <strong>{formatCurrency(remainingAfter)}</strong>.
          </p>
        )}
      </div>
    </div>
  );
}
