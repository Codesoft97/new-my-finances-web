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
          <span className="text-blue-600 font-medium">Fixas: {fixedPercentage.toFixed(1)}%</span>
          <span className="text-orange-600 font-medium">Variáveis: {variablePercentage.toFixed(1)}%</span>
        </div>
        <div className="h-4 bg-[var(--color-border)] rounded-full overflow-hidden flex">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            style={{ width: `${fixedPercentage}%` }}
          />
          <div
            className="bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500"
            style={{ width: `${variablePercentage}%` }}
          />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Fixed Expenses Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Repeat size={18} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Despesas Fixas</span>
          </div>
          <p className="text-xl font-bold text-blue-900">{formatCurrency(fixedTotal)}</p>
          <p className="text-sm text-blue-600 mt-1">
            {fixedOfIncome.toFixed(1)}% da receita
          </p>
        </div>

        {/* Variable Expenses Card */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag size={18} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Despesas Variáveis</span>
          </div>
          <p className="text-xl font-bold text-orange-900">{formatCurrency(variableTotal)}</p>
          <p className="text-sm text-orange-600 mt-1">
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
            <span className={`ml-2 text-sm font-medium ${totalOfIncome > 100 ? 'text-red-600' : totalOfIncome > 80 ? 'text-amber-600' : 'text-green-600'}`}>
              ({totalOfIncome.toFixed(1)}% da receita)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
