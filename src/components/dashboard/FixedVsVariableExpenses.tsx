'use client';

import { Transaction } from '@/types';
import { Repeat, ShoppingBag } from 'lucide-react';

interface FixedVsVariableExpensesProps {
  transactions: Transaction[];
  totalIncome: number;
}

export default function FixedVsVariableExpenses({ transactions, totalIncome }: FixedVsVariableExpensesProps) {
  // Calculate fixed and variable expenses
  const expenses = transactions.filter(t => t.type === 'expense');

  const fixedTotal = expenses
    .filter(t => t.isFixed)
    .reduce((sum, t) => sum + t.amount, 0);

  const variableTotal = expenses
    .filter(t => !t.isFixed)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = fixedTotal + variableTotal;

  const fixedPercentage = totalExpenses > 0 ? (fixedTotal / totalExpenses) * 100 : 0;
  const variablePercentage = totalExpenses > 0 ? (variableTotal / totalExpenses) * 100 : 0;

  const fixedOfIncome = totalIncome > 0 ? (fixedTotal / totalIncome) * 100 : 0;
  const variableOfIncome = totalIncome > 0 ? (variableTotal / totalIncome) * 100 : 0;
  const totalOfIncome = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Despesas Fixas vs Variáveis</h3>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-[var(--color-primary)] font-medium">Fixas: {fixedPercentage.toFixed(1)}%</span>
          <span className="text-[var(--color-action)] font-medium">Variáveis: {variablePercentage.toFixed(1)}%</span>
        </div>
        <div className="h-4 bg-[var(--color-border)] rounded-full overflow-hidden flex">
          <div
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] transition-all duration-500"
            style={{ width: `${fixedPercentage}%` }}
          />
          <div
            className="bg-gradient-to-r from-[var(--color-action)] to-[var(--color-action-dark)] transition-all duration-500"
            style={{ width: `${variablePercentage}%` }}
          />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Fixed Expenses Card */}
        <div className="bg-[var(--color-primary)]/10 rounded-xl p-4 border border-[var(--color-primary)]/20">
          <div className="flex items-center gap-2 mb-2">
            <Repeat size={18} className="text-[var(--color-primary)]" />
            <span className="text-sm font-medium text-[var(--color-primary)]">Despesas Fixas</span>
          </div>
          <p className="text-xl font-bold text-[var(--color-primary-dark)]">{formatCurrency(fixedTotal)}</p>
          <p className="text-sm text-[var(--color-primary)] mt-1">
            {fixedOfIncome.toFixed(1)}% da receita
          </p>
        </div>

        {/* Variable Expenses Card */}
        <div className="bg-[var(--color-action)]/10 rounded-xl p-4 border border-[var(--color-action)]/20">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag size={18} className="text-[var(--color-action)]" />
            <span className="text-sm font-medium text-[var(--color-action)]">Despesas Variáveis</span>
          </div>
          <p className="text-xl font-bold text-[var(--color-action-dark)]">{formatCurrency(variableTotal)}</p>
          <p className="text-sm text-[var(--color-action)] mt-1">
            {variableOfIncome.toFixed(1)}% da receita
          </p>
        </div>
      </div>

      {/* Total consumption */}
      <div className="mt-4 p-4 bg-[var(--color-bg-elevated)] rounded-xl border border-[var(--color-border)]">
        <div className="flex justify-between items-center">
          <span className="text-[var(--color-text-secondary)]">Total de despesas</span>
          <div className="text-right">
            <span className="font-bold text-[var(--color-text)]">{formatCurrency(totalExpenses)}</span>
            <span className={`ml-2 text-sm font-medium ${totalOfIncome > 100 ? 'text-[var(--color-danger)]' : totalOfIncome > 80 ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'}`}>
              ({totalOfIncome.toFixed(1)}% da receita)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
