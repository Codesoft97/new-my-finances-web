import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { creditCardService } from '@/services/api';
import { CreditCard } from '@/types';

export function useCreditCards(month?: number, year?: number) {
  const queryClient = useQueryClient();

  const {
    data: creditCards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['credit-cards', month, year],
    queryFn: async () => {
      const data = await creditCardService.list({ month, year });
      return data as CreditCard[];
    },
  });

  const createCreditCard = useMutation({
    mutationFn: creditCardService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] });
    },
  });

  const updateCreditCard = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof creditCardService.update>[1] }) =>
      creditCardService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] });
    },
  });

  const deleteCreditCard = useMutation({
    mutationFn: creditCardService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] });
    },
  });

  const createCardTransaction = useMutation({
    mutationFn: ({ cardId, data }: { cardId: string; data: Parameters<typeof creditCardService.createTransaction>[1] }) =>
      creditCardService.createTransaction(cardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] });
    },
  });

  const deleteCardTransaction = useMutation({
    mutationFn: ({ cardId, transactionId, deleteMode }: { cardId: string; transactionId: string; deleteMode?: 'all' }) =>
      creditCardService.deleteTransaction(cardId, transactionId, deleteMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] });
    },
  });

  const payInvoice = useMutation({
    mutationFn: ({ cardId, month, year }: { cardId: string; month: number; year: number }) =>
      creditCardService.payInvoice(cardId, month, year),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
  });

  return {
    creditCards,
    isLoading,
    error,
    createCreditCard,
    updateCreditCard,
    deleteCreditCard,
    createCardTransaction,
    deleteCardTransaction,
    payInvoice,
  };
}
