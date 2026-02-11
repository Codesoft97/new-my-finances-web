'use client';
import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';

import { useAuth } from '@/contexts/AuthContext';
import { transactionKeys } from '@/hooks/useTransactions';
import ExpensesByCategory from '@/components/dashboard/ExpensesByCategory';
import FixedVsVariableExpenses from '@/components/dashboard/FixedVsVariableExpenses';
import EssentialVsNonEssentialExpenses from '@/components/dashboard/EssentialVsNonEssentialExpenses';
import TopExpenses from '@/components/dashboard/TopExpenses';
import DateRangeFilter, { DateRangeFilterValue } from '@/components/ui/DateRangeFilter';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useCreditCards } from '@/hooks/useCreditCards';
import BankAccountCard from '@/components/bank-accounts/BankAccountCard';
import SummaryCards from '@/components/summary/SummaryCards';
import TotalBalanceBanner from '@/components/summary/TotalBalanceBanner';
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

  // For credit cards we only fetch for single-month mode
  const ccMonth = dateFilter.mode === 'month' ? dateFilter.month : undefined;
  const ccYear = dateFilter.mode === 'month' ? dateFilter.year : undefined;
  const { creditCards } = useCreditCards(ccMonth, ccYear);

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
    const calcEffective = (type: string) =>
      transactions.filter((t) => t.type === type && t.isEffective).reduce((acc, t) => acc + t.amount, 0);
    const calcTotal = (type: string) =>
      transactions.filter((t) => t.type === type).reduce((acc, t) => acc + t.amount, 0);
    const calcPending = (type: string) =>
      transactions.filter((t) => t.type === type && !t.isEffective).reduce((acc, t) => acc + t.amount, 0);

    const incomeEffective = calcEffective('income');
    const incomeTotal = calcTotal('income');
    const expenseEffective = calcEffective('expense');
    const expenseTotal = calcTotal('expense');
    const investEffective = calcEffective('investment');
    const investTotal = calcTotal('investment');

    return {
      income: { effective: incomeEffective, predicted: incomeTotal },
      expense: { effective: expenseEffective, predicted: expenseTotal },
      investments: { effective: investEffective, predicted: investTotal },
      pendingIncome: calcPending('income'),
      pendingExpense: calcPending('expense'),
      pendingInvest: calcPending('investment'),
    };
  }, [transactions]);

  // Credit card invoice sums
  const ccInvoiceTotal = creditCards?.reduce((acc, card) => acc + (card.invoice?.totalAmount ?? 0), 0) ?? 0;
  const ccInvoicePaidTotal = creditCards?.reduce((acc, card) => acc + (card.invoice?.isPaid ? card.invoice.totalAmount : 0), 0) ?? 0;
  const ccInvoiceUnpaidTotal = ccInvoiceTotal - ccInvoicePaidTotal;

  // Merge credit card invoices into expense summary
  const expenseWithCc = {
    effective: summary.expense.effective + ccInvoicePaidTotal,
    predicted: summary.expense.predicted + ccInvoiceTotal,
  };

  // Calculate total balance from bank accounts (for the banner)
  const bankTotal = bankAccounts?.reduce((acc, account) => acc + account.balance, 0) ?? 0;

  // Monthly balance for SummaryCards
  const balanceValues = {
    effective: summary.income.effective - expenseWithCc.effective - summary.investments.effective,
    predicted: summary.income.predicted - expenseWithCc.predicted - summary.investments.predicted,
  };

  const loading = transactionsLoading || accountsLoading;

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-medium text-[var(--color-text)] mb-1">
              Olá, {user?.name}!
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Confira seu resumo financeiro
            </p>
          </div>
          <TotalBalanceBanner totalBalance={bankTotal} />
        </div>

        <SummaryCards
          income={summary.income}
          expense={expenseWithCc}
          investments={summary.investments}
          balance={balanceValues}
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
              totalIncome={summary.income.effective}
            />

            {/* Fixed vs Variable */}
            <FixedVsVariableExpenses
              transactions={transactions}
              totalIncome={summary.income.effective}
            />

            <div className="lg:col-span-2">
              <EssentialVsNonEssentialExpenses
                transactions={transactions}
                totalIncome={summary.income.effective}
              />
            </div>

            {/* Top Expenses - Full Width */}
            <div className="lg:col-span-2">
              <TopExpenses
                transactions={transactions}
                totalIncome={summary.income.effective}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
