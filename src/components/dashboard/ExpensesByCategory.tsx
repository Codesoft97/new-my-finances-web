'use client';

import { Transaction, Category } from '@/types';

interface CategoryStats {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  total: number;
  percentage: number;
  percentageOfIncome: number;
}

interface ExpensesByCategoryProps {
  transactions: Transaction[];
  totalIncome: number;
}

export default function ExpensesByCategory({ transactions, totalIncome }: ExpensesByCategoryProps) {
  // Filter only expenses and group by category
  const categoryStats: CategoryStats[] = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: CategoryStats[], transaction) => {
      const existingCategory = acc.find(c => c.categoryId === transaction.categoryId._id);

      if (existingCategory) {
        existingCategory.total += transaction.amount;
      } else {
        acc.push({
          categoryId: transaction.categoryId._id,
          categoryName: transaction.categoryId.name,
          categoryColor: transaction.categoryId.color,
          total: transaction.amount,
          percentage: 0,
          percentageOfIncome: 0
        });
      }

      return acc;
    }, []);

  // Calculate total expenses and percentages
  const totalExpenses = categoryStats.reduce((sum, cat) => sum + cat.total, 0);

  categoryStats.forEach(cat => {
    cat.percentage = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0;
    cat.percentageOfIncome = totalIncome > 0 ? (cat.total / totalIncome) * 100 : 0;
  });

  // Sort by total descending
  categoryStats.sort((a, b) => b.total - a.total);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calculate angles for pie chart
  let cumulativeAngle = 0;
  const pieSegments = categoryStats.map(cat => {
    const startAngle = cumulativeAngle;
    const angle = (cat.percentage / 100) * 360;
    cumulativeAngle += angle;
    return {
      ...cat,
      startAngle,
      endAngle: startAngle + angle
    };
  });

  // Create SVG path for pie segment
  const createPieSegment = (startAngle: number, endAngle: number, color: string) => {
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  if (categoryStats.length === 0) {
    return (
      <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Gastos por Categoria</h3>
        <p className="text-[var(--color-text-muted)] text-center py-8">Nenhuma despesa encontrada</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Gastos por Categoria</h3>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Pie Chart */}
        <div className="flex-shrink-0">
          <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto">
            {pieSegments.map((segment, index) => (
              <path
                key={segment.categoryId}
                d={createPieSegment(segment.startAngle, segment.endAngle, segment.categoryColor)}
                fill={segment.categoryColor}
                stroke="white"
                strokeWidth="2"
                className="transition-all hover:opacity-80"
              />
            ))}
            {/* Center circle for donut effect */}
            <circle cx="100" cy="100" r="40" fill="var(--color-bg-card)" />
            <text x="100" y="95" textAnchor="middle" className="text-xs" fill="var(--color-text-muted)">Total</text>
            <text x="100" y="112" textAnchor="middle" className="text-sm font-bold" fill="var(--color-text)">
              {formatCurrency(totalExpenses).replace('R$', '').trim()}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {categoryStats.map(cat => (
            <div key={cat.categoryId} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.categoryColor }}
                />
                <span className="text-sm text-[var(--color-text-secondary)]">{cat.categoryName}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-[var(--color-text)]">{formatCurrency(cat.total)}</span>
                <span className="text-xs text-[var(--color-text-muted)] ml-2">({cat.percentage.toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div >
  );
}
