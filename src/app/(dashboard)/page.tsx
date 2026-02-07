'use client';
import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';

import { useAuth } from '@/contexts/AuthContext';
import { transactionKeys } from '@/hooks/useTransactions';
import ExpensesByCategory from '@/components/dashboard/ExpensesByCategory';
import FixedVsVariableExpenses from '@/components/dashboard/FixedVsVariableExpenses';
import TopExpenses from '@/components/dashboard/TopExpenses';
import DateRangeFilter, { DateRangeFilterValue } from '@/components/ui/DateRangeFilter';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import BankAccountCard from '@/components/bank-accounts/BankAccountCard';
import SummaryCards from '@/components/summary/SummaryCards';
import { transactionService } from '@/services/api';

const shiftMonth = (month: number, year: number, offset: number) => {
  let nextMonth = month + offset;
  let nextYear = year;

  while (nextMonth <= 0) {
    nextMonth += 12;
    nextYear -= 1;
  }

  while (nextMonth > 12) {
    nextMonth -= 12;
    nextYear += 1;
  }

  return { month: nextMonth, year: nextYear };
};

export default function DashboardPage() {
  const { user } = useAuth();

  const currentDate = new Date();
  const [dateFilter, setDateFilter] = useState<DateRangeFilterValue>({
    mode: 'month',
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  });

  const { bankAccounts, isLoading: accountsLoading } = useBankAccounts();

  const monthsToFetch = useMemo(() => {
    const { mode, month, year } = dateFilter;

    if (mode === 'month') {
      return [{ month, year }];
    }

    if (mode === 'year') {
      return Array.from({ length: 12 }, (_, index) => ({
        month: index + 1,
        year,
      }));
    }

    const count = mode === 'last3' ? 3 : 6;
    return Array.from({ length: count }, (_, index) => shiftMonth(month, year, index - (count - 1)));
  }, [dateFilter]);

  const transactionQueries = useQueries({
    queries: monthsToFetch.map(({ month, year }) => ({
      queryKey: [...transactionKeys.list(month, year), { type: undefined, categoryId: undefined }],
      queryFn: () => transactionService.list({ month, year }),
    })),
  });

  const transactions = transactionQueries.flatMap((query) => query.data?.transactions ?? []);
  const transactionsLoading = transactionQueries.some((query) => query.isLoading);

  const summary = useMemo(() => {
    const effective = transactions.filter((transaction) => transaction.isEffective);
    const income = effective
      .filter((transaction) => transaction.type === 'income')
      .reduce((acc, transaction) => acc + transaction.amount, 0);
    const expense = effective
      .filter((transaction) => transaction.type === 'expense')
      .reduce((acc, transaction) => acc + transaction.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const totalInvestments = transactions
    .filter((transaction) => transaction.type === 'investment' && transaction.isEffective)
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  // Calculate total balance from bank accounts
  const totalBalance = bankAccounts?.reduce((acc, account) => acc + account.balance, 0) ?? 0;

  const loading = transactionsLoading || accountsLoading;

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-[var(--color-text)] mb-1">
            Olá, {user?.name}!
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-5">
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

        {/* Bank Accounts */}
        <div className="mb-6">
          <h2 className="text-base font-medium text-[var(--color-text)] mb-2">Minhas Contas</h2>
          {bankAccounts?.length === 0 ? (
            <div className="p-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] text-center text-[var(--color-text-secondary)]">
              Nenhuma conta cadastrada
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {bankAccounts?.map((account) => (
                <BankAccountCard key={account._id} account={account} />
              ))}
            </div>
          )}
        </div>

        <DateRangeFilter
          value={dateFilter}
          onChange={setDateFilter}
          className="mb-4"
        />

        {/* Analytics Section */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
