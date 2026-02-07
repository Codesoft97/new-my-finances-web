'use client';
import { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useTransactions, useTransactionSummary } from '@/hooks/useTransactions';
import ExpensesByCategory from '@/components/dashboard/ExpensesByCategory';
import FixedVsVariableExpenses from '@/components/dashboard/FixedVsVariableExpenses';
import TopExpenses from '@/components/dashboard/TopExpenses';
import MonthSelector from '@/components/ui/MonthSelector';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import BankAccountCard from '@/components/bank-accounts/BankAccountCard';
import SummaryCards from '@/components/summary/SummaryCards';

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
  const totalInvestments = transactions
    .filter((transaction) => transaction.type === 'investment' && transaction.isEffective)
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  // Calculate total balance from bank accounts
  const totalBalance = bankAccounts?.reduce((acc, account) => acc + account.balance, 0) ?? 0;

  const loading = transactionsLoading || summaryLoading || accountsLoading;

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

        <SummaryCards
          income={summary.income}
          expense={summary.expense}
          investments={totalInvestments}
          totalBalance={totalBalance}
          investmentsLabel="Guardado"
        />

        <MonthSelector
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={(month, year) => {
            setSelectedMonth(month);
            setSelectedYear(year);
          }}
          className="mb-6"
        />

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
