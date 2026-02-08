'use client';

import { Transaction } from '@/types';
import { ShieldCheck, ShieldOff, Repeat, ShoppingBag, AlertTriangle, Lightbulb } from 'lucide-react';

interface EssentialVsNonEssentialExpensesProps {
  transactions: Transaction[];
  totalIncome: number;
}

export default function EssentialVsNonEssentialExpenses({
  transactions,
  totalIncome
}: EssentialVsNonEssentialExpensesProps) {
  const expenses = transactions.filter((transaction) => transaction.type === 'expense' && transaction.categoryId);

  const essentialExpenses = expenses.filter((transaction) => transaction.categoryId?.essential);
  const nonEssentialExpenses = expenses.filter((transaction) => !transaction.categoryId?.essential);

  const essentialFixedExpenses = essentialExpenses.filter((transaction) => transaction.isFixed);
  const essentialVariableExpenses = essentialExpenses.filter((transaction) => !transaction.isFixed);
  const nonEssentialFixedExpenses = nonEssentialExpenses.filter((transaction) => transaction.isFixed);
  const nonEssentialVariableExpenses = nonEssentialExpenses.filter((transaction) => !transaction.isFixed);

  const essentialFixed = essentialFixedExpenses
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const essentialVariable = essentialVariableExpenses
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const nonEssentialFixed = nonEssentialFixedExpenses
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const nonEssentialVariable = nonEssentialVariableExpenses
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const essentialTotal = essentialFixed + essentialVariable;
  const nonEssentialTotal = nonEssentialFixed + nonEssentialVariable;
  const totalExpenses = essentialTotal + nonEssentialTotal;

  const essentialPercent = totalExpenses > 0 ? (essentialTotal / totalExpenses) * 100 : 0;
  const nonEssentialPercent = totalExpenses > 0 ? (nonEssentialTotal / totalExpenses) * 100 : 0;
  const essentialOfIncome = totalIncome > 0 ? (essentialTotal / totalIncome) * 100 : 0;
  const nonEssentialOfIncome = totalIncome > 0 ? (nonEssentialTotal / totalIncome) * 100 : 0;

  const nonEssentialFixedShare = nonEssentialTotal > 0 ? (nonEssentialFixed / nonEssentialTotal) * 100 : 0;
  const essentialVariableShare = essentialTotal > 0 ? (essentialVariable / essentialTotal) * 100 : 0;

  const getCategoryNames = (items: Transaction[]) => {
    const names = items
      .map((transaction) => transaction.categoryId?.name)
      .filter((name): name is string => Boolean(name));
    return Array.from(new Set(names));
  };

  const essentialFixedCategories = getCategoryNames(essentialFixedExpenses);
  const essentialVariableCategories = getCategoryNames(essentialVariableExpenses);
  const nonEssentialFixedCategories = getCategoryNames(nonEssentialFixedExpenses);
  const nonEssentialVariableCategories = getCategoryNames(nonEssentialVariableExpenses);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (totalExpenses === 0) {
    return (
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md p-4">
        <h3 className="text-base font-medium text-[var(--color-text)] mb-3">Despesas Essenciais vs Não Essenciais</h3>
        <p className="text-[var(--color-text-muted)] text-center py-8">Nenhuma despesa encontrada</p>
      </div>
    );
  }

  const showNonEssentialWarning = nonEssentialTotal > essentialTotal;

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="text-[var(--color-success)]" size={20} />
        <h3 className="text-base font-medium text-[var(--color-text)]">Despesas Essenciais vs Não Essenciais</h3>
      </div>

      {/* Progress Bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-[var(--color-success)] font-medium">Essenciais: {essentialPercent.toFixed(1)}%</span>
          <span className="text-[var(--color-warning)] font-medium">Não essenciais: {nonEssentialPercent.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-[var(--color-border)] rounded-sm overflow-hidden flex">
          <div
            className="bg-gradient-to-r from-[var(--color-success)] to-[var(--color-success-dark)] transition-all duration-500"
            style={{ width: `${essentialPercent}%` }}
          />
          <div
            className="bg-gradient-to-r from-[var(--color-warning)] to-[var(--color-warning-dark)] transition-all duration-500"
            style={{ width: `${nonEssentialPercent}%` }}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-[var(--color-success)]/10 rounded-md p-3 border border-[var(--color-success)]/20">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={18} className="text-[var(--color-success)]" />
            <span className="text-xs font-medium text-[var(--color-success)]">Essenciais</span>
          </div>
          <p className="text-lg font-medium text-[var(--color-success-dark)]">{formatCurrency(essentialTotal)}</p>
          <p className="text-xs text-[var(--color-success)] mt-1">
            {essentialPercent.toFixed(1)}% das despesas - {essentialOfIncome.toFixed(1)}% da receita
          </p>
        </div>

        <div className="bg-[var(--color-warning)]/10 rounded-md p-3 border border-[var(--color-warning)]/20">
          <div className="flex items-center gap-2 mb-2">
            <ShieldOff size={18} className="text-[var(--color-warning)]" />
            <span className="text-xs font-medium text-[var(--color-warning)]">Não essenciais</span>
          </div>
          <p className="text-lg font-medium text-[var(--color-warning-dark)]">{formatCurrency(nonEssentialTotal)}</p>
          <p className="text-xs text-[var(--color-warning-dark)] mt-1">
            {nonEssentialPercent.toFixed(1)}% das despesas - {nonEssentialOfIncome.toFixed(1)}% da receita
          </p>
        </div>
      </div>

      {/* Cross with fixed vs variable */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-[var(--color-text)] mb-2">Cruzamento com Fixas e Variaveis</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-[var(--color-bg-elevated)] rounded-md p-3 border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-1">
              <Repeat size={16} className="text-[var(--color-primary)]" />
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">Essenciais Fixas</span>
            </div>
            <p className="text-base font-medium text-[var(--color-text)]">{formatCurrency(essentialFixed)}</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {essentialTotal > 0 ? (essentialFixed / essentialTotal * 100).toFixed(1) : '0.0'}% das essenciais
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Categorias: {essentialFixedCategories.length > 0 ? essentialFixedCategories.join(', ') : '-'}
            </p>
          </div>

          <div className="bg-[var(--color-bg-elevated)] rounded-md p-3 border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag size={16} className="text-[var(--color-action)]" />
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">Essenciais Variaveis</span>
            </div>
            <p className="text-base font-medium text-[var(--color-text)]">{formatCurrency(essentialVariable)}</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {essentialTotal > 0 ? (essentialVariable / essentialTotal * 100).toFixed(1) : '0.0'}% das essenciais
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Categorias: {essentialVariableCategories.length > 0 ? essentialVariableCategories.join(', ') : '-'}
            </p>
          </div>

          <div className="bg-[var(--color-bg-elevated)] rounded-md p-3 border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-1">
              <Repeat size={16} className="text-[var(--color-primary)]" />
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">Não Essenciais Fixas</span>
            </div>
            <p className="text-base font-medium text-[var(--color-text)]">{formatCurrency(nonEssentialFixed)}</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {nonEssentialTotal > 0 ? (nonEssentialFixed / nonEssentialTotal * 100).toFixed(1) : '0.0'}% das não essenciais
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Categorias: {nonEssentialFixedCategories.length > 0 ? nonEssentialFixedCategories.join(', ') : '-'}
            </p>
          </div>

          <div className="bg-[var(--color-bg-elevated)] rounded-md p-3 border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag size={16} className="text-[var(--color-action)]" />
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">Não Essenciais Variaveis</span>
            </div>
            <p className="text-base font-medium text-[var(--color-text)]">{formatCurrency(nonEssentialVariable)}</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {nonEssentialTotal > 0 ? (nonEssentialVariable / nonEssentialTotal * 100).toFixed(1) : '0.0'}% das não essenciais
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Categorias: {nonEssentialVariableCategories.length > 0 ? nonEssentialVariableCategories.join(', ') : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 space-y-2">
        {showNonEssentialWarning && (
          <div className="p-3 bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20 rounded-md">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-[var(--color-warning)] flex-shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-xs text-[var(--color-warning-dark)] font-medium">Atenção aos gastos não essenciais</p>
                <p className="text-xs text-[var(--color-warning-dark)]">
                  Seus gastos não essenciais estão maiores que os essenciais. Vale revisar assinaturas e despesas recorrentes.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-3 bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 rounded-md">
          <div className="flex items-start gap-2">
            <Lightbulb className="text-[var(--color-success)] flex-shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-xs text-[var(--color-text)] font-medium">Respostas rapidas</p>
              <p className="text-xs text-[var(--color-text)]">
                Não essenciais fixas: {formatCurrency(nonEssentialFixed)} ({nonEssentialFixedShare.toFixed(1)}% das não essenciais).
              </p>
              <p className="text-xs text-[var(--color-text)]">
                Essenciais variaveis: {formatCurrency(essentialVariable)} ({essentialVariableShare.toFixed(1)}% das essenciais).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
