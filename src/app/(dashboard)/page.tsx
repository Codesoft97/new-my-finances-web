'use client';
import { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useTransactions, useTransactionSummary } from '@/hooks/useTransactions';
import ExpensesByCategory from '@/components/dashboard/ExpensesByCategory';
import FixedVsVariableExpenses from '@/components/dashboard/FixedVsVariableExpenses';
import TopExpenses from '@/components/dashboard/TopExpenses';
import MonthSelector from '@/components/ui/MonthSelector';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import BankAccountCard from '@/components/bank-accounts/BankAccountCard';

export default function DashboardPage() {
  const { user } = useAuth();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions(selectedMonth, selectedYear);
  const { data: summaryData, isLoading: summaryLoading } = useTransactionSummary(selectedMonth, selectedYear);
  const { bankAccounts, isLoading: accountsLoading } = useBankAccounts();

  const transactions = transactionsData?.transactions ?? [];
  const summary = summaryData?.summary ?? { income: 0, expense: 0, balance: 0 };

  // Calculate total balance from bank accounts
  const totalBalance = bankAccounts?.reduce((acc, account) => acc + account.balance, 0) ?? 0;

  const loading = transactionsLoading || summaryLoading || accountsLoading;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-text)] mb-2">
            Olá, {user?.name}!
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-6">
            Confira seu resumo financeiro
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Income Card */}
          <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 shadow-sm border border-[var(--color-border-light)] relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Entradas</p>
                <h3 className="text-2xl font-bold text-[var(--color-text)] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                  {formatCurrency(summary.income)}
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
                  {formatCurrency(summary.expense)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-danger)]/10 flex items-center justify-center text-[var(--color-danger)] group-hover:scale-110 transition-transform duration-300">
                <TrendingDown size={24} />
              </div>
            </div>
          </div>

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
                <p className={`text-sm font-medium mb-1 ${totalBalance < 0 ? 'text-red-50/80' : 'text-blue-50/80'}`}>Saldo Total (Contas)</p>
                <h3 className="text-3xl font-bold text-white tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                  {formatCurrency(totalBalance)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <DollarSign size={24} />
              </div>
            </div>
          </div>
        </div>

        <MonthSelector
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={(month, year) => {
            setSelectedMonth(month);
            setSelectedYear(year);
          }}
          className="mb-6"
        />

        {/* Bank Accounts */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">Minhas Contas</h2>
          {bankAccounts?.length === 0 ? (
            <div className="p-6 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] text-center text-[var(--color-text-secondary)]">
              Nenhuma conta cadastrada
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {bankAccounts?.map((account) => (
                <BankAccountCard key={account._id} account={account} />
              ))}
            </div>
          )}
        </div>

        {/* Analytics Section */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
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