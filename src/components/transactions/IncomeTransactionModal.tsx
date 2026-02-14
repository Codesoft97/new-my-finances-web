'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TrendingUp } from 'lucide-react';

import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import CurrencyInput from '@/components/ui/CurrencyInput';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { useCategories } from '@/hooks/useCategories';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions';
import { toastApiError } from '@/utils/notifications';
import { Transaction } from '@/types';

interface IncomeTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
}

interface FormData {
  description: string;
  amount: string;
  categoryId: string;
  bankAccountId: string;
  isFixed: boolean;
  isEffective: boolean;
  date: string;
}

export default function IncomeTransactionModal({ isOpen, onClose, transactionToEdit }: IncomeTransactionModalProps) {
  const { data: categoriesData } = useCategories();
  const { bankAccounts } = useBankAccounts();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const categories = (categoriesData?.categories ?? []).filter(c => c.type === 'income');

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const { register, handleSubmit, reset, watch, control, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      description: '',
      amount: '',
      categoryId: '',
      bankAccountId: '',
      isFixed: false,
      isEffective: false,
      date: getTodayDate()
    }
  });

  const isFixedTransaction = watch('isFixed');

  useEffect(() => {
    if (transactionToEdit) {
      reset({
        description: transactionToEdit.description,
        amount: transactionToEdit.amount.toString(),
        categoryId: transactionToEdit.categoryId?._id || '',
        bankAccountId: transactionToEdit.bankAccountId?._id || '',
        isFixed: transactionToEdit.isFixed,
        isEffective: transactionToEdit.isEffective,
        date: transactionToEdit.date.split('T')[0]
      });
    } else {
      reset({
        description: '',
        amount: '',
        categoryId: '',
        bankAccountId: '',
        isFixed: false,
        isEffective: false,
        date: getTodayDate()
      });
    }
  }, [transactionToEdit, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (transactionToEdit) {
        await updateMutation.mutateAsync({
          id: transactionToEdit._id,
          data: {
            description: data.description,
            amount: parseFloat(data.amount),
            type: 'income',
            categoryId: data.categoryId,
            bankAccountId: data.bankAccountId,
            date: data.date
          }
        });
      } else {
        await createMutation.mutateAsync({
          description: data.description,
          amount: parseFloat(data.amount),
          type: 'income',
          categoryId: data.categoryId,
          bankAccountId: data.bankAccountId,
          isFixed: data.isFixed,
          date: data.date,
          ...(data.isEffective ? { isEffective: true } : {})
        });
      }
      handleClose();
    } catch (error: unknown) {
      toastApiError(error, 'Erro ao salvar receita');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={transactionToEdit ? 'Editar Receita' : 'Nova Receita'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Type indicator */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 rounded-md">
          <TrendingUp size={18} className="text-[var(--color-success)]" />
          <span className="text-sm font-medium text-[var(--color-success)]">Receita</span>
        </div>

        <Input
          label="Descrição"
          placeholder="Ex: Salário, freelance..."
          error={errors.description?.message}
          {...register('description', {
            required: 'Descrição é obrigatória',
            maxLength: { value: 200, message: 'Máximo 200 caracteres' }
          })}
        />

        <Controller
          name="amount"
          control={control}
          rules={{
            required: 'Valor é obrigatório',
            validate: (value) => parseFloat(value) > 0 || 'Valor deve ser maior que zero'
          }}
          render={({ field: { onChange, value } }) => (
            <CurrencyInput
              label="Valor"
              value={value}
              onChange={onChange}
              error={errors.amount?.message}
              placeholder="0,00"
            />
          )}
        />

        <div>
          <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">Data</label>
          <input
            type="date"
            {...register('date', { required: 'Data é obrigatória' })}
            className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-medium cursor-pointer"
          />
          {errors.date && <p className="mt-2 text-sm text-[var(--color-danger)]">{errors.date.message}</p>}
        </div>

        {/* Effectivate on creation */}
        {!transactionToEdit && (
          <div className="flex items-start gap-3 p-3 bg-[var(--color-bg-elevated)] rounded-md border border-[var(--color-border)]">
            <input
              type="checkbox"
              id="incomeIsEffective"
              {...register('isEffective')}
              className="w-5 h-5 text-[var(--color-primary)] border-[var(--color-border)] rounded-sm focus:ring-[var(--color-primary)] cursor-pointer mt-1"
            />
            <label htmlFor="incomeIsEffective" className="cursor-pointer">
              <span className="font-medium text-[var(--color-text)]">Efetivar transação agora</span>
              <p className="text-sm text-[var(--color-text-muted)]">
                Ao efetivar, a transação impacta saldo da conta.
              </p>
              {isFixedTransaction && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  Para receitas fixas, apenas a primeira será efetivada.
                </p>
              )}
            </label>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Categoria</label>
            <Controller
              name="categoryId"
              control={control}
              rules={{ required: 'Categoria é obrigatória' }}
              render={({ field }) => (
                <SearchableSelect
                  options={categories.map(c => ({ id: c._id, label: c.name, color: c.color }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Selecione..."
                  error={errors.categoryId?.message}
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Conta / Carteira</label>
            <Controller
              name="bankAccountId"
              control={control}
              rules={{ required: 'Conta é obrigatória' }}
              render={({ field }) => (
                <SearchableSelect
                  options={bankAccounts?.map(b => ({ id: b._id, label: b.name, color: b.color })) || []}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Selecione..."
                  error={errors.bankAccountId?.message}
                />
              )}
            />
          </div>
        </div>

        {/* Fixed checkbox */}
        {!transactionToEdit && (
          <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-elevated)] rounded-md border border-[var(--color-border)]">
            <input
              type="checkbox"
              id="incomeIsFixed"
              {...register('isFixed')}
              className="w-5 h-5 text-[var(--color-primary)] border-[var(--color-border)] rounded focus:ring-[var(--color-primary)] cursor-pointer"
            />
            <label htmlFor="incomeIsFixed" className="cursor-pointer">
              <span className="font-medium text-[var(--color-text)]">Receita Fixa</span>
              <p className="text-sm text-[var(--color-text-muted)]">
                Esta receita será repetida automaticamente todos os meses
              </p>
            </label>
          </div>
        )}

        {/* Fixed info in edit mode */}
        {transactionToEdit && transactionToEdit.isFixed && (
          <div className="p-3 bg-[var(--color-primary)]/10 rounded-md border border-[var(--color-primary)]/30">
            <p className="text-sm text-[var(--color-text)]">
              <strong>Nota:</strong> Esta é uma receita fixa. A alteração afetará apenas esta ocorrência.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
