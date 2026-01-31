'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { transactionService } from '@/services/api';
import { Transaction, TransactionSummary } from '@/types';
import ExpensesByCategory from '@/components/dashboard/ExpensesByCategory';
import FixedVsVariableExpenses from '@/components/dashboard/FixedVsVariableExpenses';
import TopExpenses from '@/components/dashboard/TopExpenses';

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<TransactionSummary>({ income: 0, expense: 0, balance: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const [summaryData, transactionsData] = await Promise.all([
        transactionService.getSummary({ month, year }),
        transactionService.list({ month, year })
      ]);

      setSummary(summaryData.summary);
      setTransactions(transactionsData.transactions);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Olá, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Confira seu resumo financeiro de {currentMonth}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-green-100 text-sm font-medium">Receitas</span>
              <TrendingUp size={24} />
            </div>
            <p className="text-3xl font-bold mb-1">{formatCurrency(summary.income)}</p>
            <p className="text-green-100 text-sm">Mês atual</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-red-100 text-sm font-medium">Despesas</span>
              <TrendingDown size={24} />
            </div>
            <p className="text-3xl font-bold mb-1">{formatCurrency(summary.expense)}</p>
            <p className="text-red-100 text-sm">Mês atual</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-blue-100 text-sm font-medium">Saldo</span>
              <DollarSign size={24} />
            </div>
            <p className="text-3xl font-bold mb-1">{formatCurrency(summary.balance)}</p>
            <p className="text-blue-100 text-sm">Mês atual</p>
          </div>
        </div>

        {/* Analytics Section */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expenses by Category */}
            <ExpensesByCategory
              transactions={transactions}
              totalIncome={summary.income}
            />

            {/* Fixed vs Variable */}
            <FixedVsVariableExpenses
              transactions={transactions}
              totalIncome={summary.income}
            />

            {/* Top Expenses - Full Width */}
            <div className="lg:col-span-2">
              <TopExpenses
                transactions={transactions}
                totalIncome={summary.income}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}