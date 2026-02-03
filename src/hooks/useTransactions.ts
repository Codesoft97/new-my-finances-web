import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/api';
import { Transaction, TransactionSummary } from '@/types';

// Query keys for cache management
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (month: number, year: number) => [...transactionKeys.lists(), { month, year }] as const,
  summaries: () => [...transactionKeys.all, 'summary'] as const,
  summary: (month: number, year: number) => [...transactionKeys.summaries(), { month, year }] as const,
};

interface TransactionsData {
  transactions: Transaction[];
}

interface SummaryData {
  summary: TransactionSummary;
}

// Query: Get transactions for a specific month/year
export function useTransactions(month: number, year: number) {
  return useQuery<TransactionsData>({
    queryKey: transactionKeys.list(month, year),
    queryFn: () => transactionService.list({ month, year }),
  });
}

// Query: Get summary for a specific month/year
export function useTransactionSummary(month: number, year: number) {
  return useQuery<SummaryData>({
    queryKey: transactionKeys.summary(month, year),
    queryFn: () => transactionService.getSummary({ month, year }),
  });
}

interface CreateTransactionData {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  date?: string;
  isFixed?: boolean;
}

// Mutation: Create transaction
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionData) => transactionService.create(data),
    onSuccess: () => {
      // Invalidate all transaction lists and summaries
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.summaries() });
    },
  });
}

interface UpdateTransactionData {
  id: string;
  data: {
    description?: string;
    amount?: number;
    type?: 'income' | 'expense';
    categoryId?: string;
    date?: string;
  };
}

// Mutation: Update transaction
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateTransactionData) => transactionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.summaries() });
    },
  });
}

interface DeleteTransactionData {
  id: string;
  deleteMode: 'single' | 'all';
}

// Mutation: Delete transaction
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, deleteMode }: DeleteTransactionData) =>
      transactionService.delete(id, deleteMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.summaries() });
    },
  });
}
