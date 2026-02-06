'use client';

import { Transaction } from '@/types';
import { AlertTriangle, TrendingDown, Lightbulb } from 'lucide-react';

interface CategoryExpense {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  total: number;
  percentageOfIncome: number;
}

interface TopExpensesProps {
  transactions: Transaction[];
  totalIncome: number;
}

export default function TopExpenses({ transactions, totalIncome }: TopExpensesProps) {
  // Group expenses by category
  const categoryExpenses: CategoryExpense[] = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: CategoryExpense[], transaction) => {
      if (!transaction.categoryId) return acc;

      const existingCategory = acc.find(c => c.categoryId === transaction.categoryId!._id);

      if (existingCategory) {
        existingCategory.total += transaction.amount;
      } else {
        acc.push({
          categoryId: transaction.categoryId!._id,
          categoryName: transaction.categoryId!.name,
          categoryColor: transaction.categoryId!.color,
          total: transaction.amount,
          percentageOfIncome: 0
        });
      }

      return acc;
    }, []);

  // Calculate percentage of income
  categoryExpenses.forEach(cat => {
    cat.percentageOfIncome = totalIncome > 0 ? (cat.total / totalIncome) * 100 : 0;
  });

  // Sort by total descending and take top 5
  const topCategories = categoryExpenses
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Categories consuming more than 30% of income are flagged for attention
  const highSpendingCategories = topCategories.filter(cat => cat.percentageOfIncome > 30);

  if (topCategories.length === 0) {
    return (
      <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Onde Economizar</h3>
        <p className="text-[var(--color-text-muted)] text-center py-8">Sem dados suficientes</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="text-amber-500" size={20} />
        <h3 className="text-lg font-semibold text-[var(--color-text)]">Onde Economizar</h3>
      </div>

      {/* Warning for high spending */}
      {highSpendingCategories.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-sm text-amber-800 font-medium">Atenção!</p>
              <p className="text-sm text-amber-700">
                {highSpendingCategories.length === 1
                  ? `A categoria "${highSpendingCategories[0].categoryName}" está consumindo ${highSpendingCategories[0].percentageOfIncome.toFixed(1)}% da sua receita.`
                  : `${highSpendingCategories.length} categorias estão consumindo mais de 30% da sua receita cada.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top expenses list */}
      <div className="space-y-3">
        {topCategories.map((cat, index) => (
          <div
            key={cat.categoryId}
            className={`flex items-center gap-3 p-3 rounded-lg ${cat.percentageOfIncome > 30 ? 'bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30' : 'bg-[var(--color-bg-elevated)]'}`}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-bold">
              {index + 1}
            </div>
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: cat.categoryColor }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[var(--color-text)] truncate">{cat.categoryName}</span>
                <span className="font-bold text-[var(--color-text)] ml-2">{formatCurrency(cat.total)}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex-1 h-2 bg-[var(--color-border)] rounded-full mr-3">
                  <div
                    className={`h-2 rounded-full transition-all ${cat.percentageOfIncome > 30 ? 'bg-red-500' : cat.percentageOfIncome > 20 ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(cat.percentageOfIncome, 100)}%` }}
                  />
                </div>
                <span className={`text-sm font-medium whitespace-nowrap ${cat.percentageOfIncome > 30 ? 'text-red-600' : cat.percentageOfIncome > 20 ? 'text-amber-600' : 'text-green-600'}`}>
                  {cat.percentageOfIncome.toFixed(1)}%
                </span>
              </div>
            </div>
            {cat.percentageOfIncome > 30 && (
              <TrendingDown className="text-red-500 flex-shrink-0" size={20} />
            )}
          </div>
        ))}
      </div>

      {/* Savings tip */}
      <div className="mt-4 p-3 bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 rounded-lg">
        <p className="text-sm text-[var(--color-text)]">
          💡 <strong>Dica:</strong> Categorias acima de 30% da receita merecem atenção especial. Considere revisar esses gastos.
        </p>
      </div>
    </div>
  );
}
