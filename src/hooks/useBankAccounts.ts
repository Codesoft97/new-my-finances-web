
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bankAccountService } from '@/services/api';
import { BankAccount } from '@/types';

export function useBankAccounts() {
  const queryClient = useQueryClient();

  const {
    data: bankAccounts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      const data = await bankAccountService.list();
      return data as BankAccount[];
    },
  });

  const createBankAccount = useMutation({
    mutationFn: bankAccountService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
  });

  const updateBankAccount = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; color: string } }) =>
      bankAccountService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
  });

  const deleteBankAccount = useMutation({
    mutationFn: bankAccountService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
  });

  return {
    bankAccounts,
    isLoading,
    error,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
  };
}
