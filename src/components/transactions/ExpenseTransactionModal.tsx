'use client';

import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TrendingDown } from 'lucide-react';

import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import CurrencyInput from '@/components/ui/CurrencyInput';
import SearchableSelect from '@/components/ui/SearchableSelect';
import SpendingLimitImpactNotice from '@/components/transactions/SpendingLimitImpactNotice';
import { useCategories } from '@/hooks/useCategories';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useSpendingLimits } from '@/hooks/useSpendingLimits';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { isPremiumFamily } from '@/utils/billing';
import { toastApiError } from '@/utils/notifications';
import { SpendingLimit, Transaction } from '@/types';

interface ExpenseTransactionModalProps {
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

interface NormalizedSpendingLimit {
  id: string;
  seriesId: string | null;
  amount: number;
  spentAmount: number;
  categoryId: string;
  periodYear?: number;
  periodMonth?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const toInputDate = (value: string) => {
  if (!value) return '';
  return value.split('T')[0];
};

const getCategoryIdFromSpendingLimit = (limit: SpendingLimit) => {
  if (typeof limit.categoryId === 'string') return limit.categoryId;
  if (limit.category?.id) return limit.category.id;
  if (limit.category?._id) return limit.category._id;
  if (typeof limit.categoryId === 'object' && limit.categoryId !== null) {
    if (limit.categoryId.id) return limit.categoryId.id;
    if (limit.categoryId._id) return limit.categoryId._id;
  }
  return '';
};

const normalizeSpendingLimit = (limit: SpendingLimit): NormalizedSpendingLimit | null => {
  const id = limit.id || limit._id;
  const categoryId = getCategoryIdFromSpendingLimit(limit);
  if (!id || !categoryId) return null;

  return {
    id,
    seriesId: typeof limit.seriesId === 'string' || limit.seriesId === null ? limit.seriesId : null,
    amount: limit.amount,
    spentAmount: typeof limit.spentAmount === 'number' ? limit.spentAmount : 0,
    categoryId,
    periodYear: typeof limit.periodYear === 'number' ? limit.periodYear : undefined,
    periodMonth: typeof limit.periodMonth === 'number' ? limit.periodMonth : undefined,
    startDate: toInputDate(limit.startDate),
    endDate: toInputDate(limit.endDate),
    isActive: Boolean(limit.isActive),
  };
};

const isDateInRange = (date: string, startDate: string, endDate: string) => {
  if (!date || !startDate || !endDate) return false;
  return date >= startDate && date <= endDate;
};

const getDateYearMonth = (date: string) => {
  const [yearString, monthString] = date.split('-');
  const year = Number(yearString);
  const month = Number(monthString);

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return null;
  }

  return { year, month };
};

export default function ExpenseTransactionModal({ isOpen, onClose, transactionToEdit }: ExpenseTransactionModalProps) {
  const { family } = useAuth();
  const isPremium = isPremiumFamily(family);
  const { data: categoriesData } = useCategories();
  const { bankAccounts } = useBankAccounts();
  const { data: spendingLimitsData } = useSpendingLimits({
    enabled: isPremium && isOpen && !transactionToEdit,
  });
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const categories = (categoriesData?.categories ?? []).filter(c => c.type === 'expense');

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
  const selectedCategoryId = watch('categoryId');
  const selectedDate = watch('date');
  const amountValue = watch('amount');
  const expenseAmount = parseFloat(amountValue || '0');

  const relevantSpendingLimit = useMemo(() => {
    if (!selectedCategoryId) return null;

    const parsedDate = getDateYearMonth(selectedDate);
    const spendingLimits = (spendingLimitsData?.spendingLimits ?? [])
      .map(normalizeSpendingLimit)
      .filter((limit): limit is NormalizedSpendingLimit => limit !== null)
      .filter((limit) => limit.categoryId === selectedCategoryId);

    if (spendingLimits.length === 0) return null;

    const hasMonthlyData = spendingLimits.some(
      (limit) => typeof limit.periodYear === 'number' && typeof limit.periodMonth === 'number'
    );

    if (hasMonthlyData) {
      if (!parsedDate) return null;

      const monthlyMatch = spendingLimits.find(
        (limit) => limit.periodYear === parsedDate.year && limit.periodMonth === parsedDate.month
      );
      return monthlyMatch || null;
    }

    const legacyRangeMatch = spendingLimits.find((limit) =>
      isDateInRange(selectedDate, limit.startDate, limit.endDate)
    );
    if (legacyRangeMatch) return legacyRangeMatch;

    const activeLimit = spendingLimits.find((limit) => limit.isActive);
    if (activeLimit) return activeLimit;

    const sortedByPeriodDesc = [...spendingLimits].sort((a, b) => {
      const yearDiff = (b.periodYear ?? 0) - (a.periodYear ?? 0);
      if (yearDiff !== 0) return yearDiff;

      const monthDiff = (b.periodMonth ?? 0) - (a.periodMonth ?? 0);
      if (monthDiff !== 0) return monthDiff;

      return b.endDate.localeCompare(a.endDate);
    });

    return sortedByPeriodDesc[0];
  }, [selectedCategoryId, selectedDate, spendingLimitsData?.spendingLimits]);

  const showSpendingLimitImpact =
    !transactionToEdit &&
    isPremium &&
    Boolean(relevantSpendingLimit) &&
    Number.isFinite(expenseAmount) &&
    expenseAmount > 0;

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
            type: 'expense',
            categoryId: data.categoryId,
            bankAccountId: data.bankAccountId,
            date: data.date
          }
        });
      } else {
        await createMutation.mutateAsync({
          description: data.description,
          amount: parseFloat(data.amount),
          type: 'expense',
          categoryId: data.categoryId,
          bankAccountId: data.bankAccountId,
          isFixed: data.isFixed,
          date: data.date,
          ...(data.isEffective ? { isEffective: true } : {})
        });
      }
      handleClose();
    } catch (error: unknown) {
      toastApiError(error, 'Erro ao salvar despesa');
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
      title={transactionToEdit ? 'Editar Despesa' : 'Nova Despesa'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Type indicator */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 rounded-md">
          <TrendingDown size={18} className="text-[var(--color-danger)]" />
          <span className="text-sm font-medium text-[var(--color-danger)]">Despesa</span>
        </div>

        <Input
          label="Descrição"
          placeholder="Ex: Compra no supermercado..."
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
              id="expenseIsEffective"
              {...register('isEffective')}
              className="w-5 h-5 text-[var(--color-primary)] border-[var(--color-border)] rounded-sm focus:ring-[var(--color-primary)] cursor-pointer mt-1"
            />
            <label htmlFor="expenseIsEffective" className="cursor-pointer">
              <span className="font-medium text-[var(--color-text)]">Efetivar transação agora</span>
              <p className="text-sm text-[var(--color-text-muted)]">
                Ao efetivar, a transação impacta saldo da conta.
              </p>
              {isFixedTransaction && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  Para despesas fixas, apenas a primeira será efetivada.
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

        {showSpendingLimitImpact && relevantSpendingLimit && (
          <SpendingLimitImpactNotice
            categoryName={categories.find((category) => category._id === selectedCategoryId)?.name || 'Categoria'}
            limitAmount={relevantSpendingLimit.amount}
            spentAmount={relevantSpendingLimit.spentAmount}
            nextExpenseAmount={expenseAmount}
          />
        )}

        {/* Fixed checkbox */}
        {!transactionToEdit && (
          <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-elevated)] rounded-md border border-[var(--color-border)]">
            <input
              type="checkbox"
              id="expenseIsFixed"
              {...register('isFixed')}
              className="w-5 h-5 text-[var(--color-primary)] border-[var(--color-border)] rounded focus:ring-[var(--color-primary)] cursor-pointer"
            />
            <label htmlFor="expenseIsFixed" className="cursor-pointer">
              <span className="font-medium text-[var(--color-text)]">Despesa Fixa</span>
              <p className="text-sm text-[var(--color-text-muted)]">
                Esta despesa será repetida automaticamente todos os meses
              </p>
            </label>
          </div>
        )}

        {/* Fixed info in edit mode */}
        {transactionToEdit && transactionToEdit.isFixed && (
          <div className="p-3 bg-[var(--color-primary)]/10 rounded-md border border-[var(--color-primary)]/30">
            <p className="text-sm text-[var(--color-text)]">
              <strong>Nota:</strong> Esta é uma despesa fixa. A alteração afetará apenas esta ocorrência.
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
