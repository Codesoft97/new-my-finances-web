
'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Plus, TrendingUp, TrendingDown, PieChart, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import CurrencyInput from '@/components/ui/CurrencyInput';
import SearchableSelect from '@/components/ui/SearchableSelect';

import { useAuth } from '@/contexts/AuthContext';
import { isPremiumFamily } from '@/utils/billing';
import { useCategories } from '@/hooks/useCategories';
import { useGoals } from '@/hooks/useGoals';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions';
import { Transaction } from '@/types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
}

interface TransactionFormData {
  description: string;
  amount: string;
  type: 'income' | 'expense' | 'investment';
  categoryId: string;
  goalId: string;
  bankAccountId: string;
  isFixed: boolean;
  isEffective: boolean;
  date: string;
}

export default function TransactionModal({ isOpen, onClose, transactionToEdit }: TransactionModalProps) {
  const router = useRouter();
  const { family } = useAuth();

  // Hooks with internal data
  const { data: categoriesData } = useCategories();
  const { bankAccounts } = useBankAccounts();
  const canUseGoalsFromFamily = isPremiumFamily(family);
  const goalsQuery = useGoals({ enabled: canUseGoalsFromFamily });

  const goalsErrorStatus = (goalsQuery.error as any)?.response?.status;
  const canUseGoals = canUseGoalsFromFamily && goalsErrorStatus !== 403;
  const goals = goalsQuery.data?.goals ?? [];
  const categories = categoriesData?.categories ?? [];

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  // Get today's date in YYYY-MM-DD format for the date input
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const { register, handleSubmit, reset, watch, setValue, control, formState: { errors } } = useForm<TransactionFormData>({
    defaultValues: {
      description: '',
      amount: '',
      type: 'expense',
      categoryId: '',
      goalId: '',
      bankAccountId: '',
      isFixed: false,
      isEffective: false,
      date: getTodayDate()
    }
  });

  const transactionType = watch('type');
  const isFixedTransaction = watch('isFixed');
  const isEditingInvestment = transactionToEdit?.type === 'investment';
  const showInvestmentOption = canUseGoals || isEditingInvestment;
  const blockedByPlan = transactionType === 'investment' && !canUseGoals;

  const filteredCategories = transactionType === 'investment'
    ? []
    : categories.filter(c => c.type === transactionType);

  // Initialize form when transactionToEdit changes
  useEffect(() => {
    if (transactionToEdit) {
      setValue('description', transactionToEdit.description);
      setValue('amount', transactionToEdit.amount.toString());
      setValue('type', transactionToEdit.type);
      setValue('categoryId', transactionToEdit.categoryId?._id || '');
      setValue('goalId', transactionToEdit.goalId?._id || '');
      setValue('bankAccountId', transactionToEdit.bankAccountId?._id || '');
      setValue('isFixed', transactionToEdit.isFixed);
      setValue('isEffective', transactionToEdit.isEffective);
      setValue('date', transactionToEdit.date.split('T')[0]);
    } else {
      reset({
        description: '',
        amount: '',
        type: 'expense',
        categoryId: '',
        goalId: '',
        bankAccountId: '',
        isFixed: false,
        isEffective: false,
        date: getTodayDate()
      });
    }
  }, [transactionToEdit, setValue, reset]);

  const onSubmit = async (data: TransactionFormData) => {
    try {
      if (data.type === 'investment' && !canUseGoals) {
        alert('Objetivos estão disponíveis apenas no Plano Premium');
        return;
      }

      if (transactionToEdit) {
        await updateMutation.mutateAsync({
          id: transactionToEdit._id,
          data: {
            description: data.description,
            amount: parseFloat(data.amount),
            type: data.type,
            categoryId: data.categoryId,
            goalId: (data.type === 'investment' && data.goalId) ? data.goalId : undefined,
            bankAccountId: data.bankAccountId,
            date: data.date
          }
        });
      } else {
        await createMutation.mutateAsync({
          description: data.description,
          amount: parseFloat(data.amount),
          type: data.type,
          categoryId: data.type === 'investment' ? undefined : data.categoryId,
          goalId: (data.type === 'investment' && data.goalId) ? data.goalId : undefined,
          bankAccountId: data.bankAccountId,
          isFixed: data.isFixed,
          date: data.date,
          ...(data.isEffective ? { isEffective: true } : {})
        });
      }
      handleClose();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar transação');
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
      title={transactionToEdit ? 'Editar Transação' : 'Nova Transação'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Descrição"
          placeholder="Ex: Compra no supermercado"
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
          <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
            Data
          </label>
          <input
            type="date"
            {...register('date', { required: 'Data é obrigatória' })}
            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-border)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-medium cursor-pointer"
          />
          {errors.date && (
            <p className="mt-2 text-sm text-[var(--color-danger)]">{errors.date.message}</p>
          )}
        </div>

        {/* Effectivate on creation */}
        {!transactionToEdit && (
          <div className="flex items-start gap-3 p-4 bg-[var(--color-bg-elevated)] rounded-lg border border-[var(--color-border)]">
          <input
            type="checkbox"
            id="isEffective"
            {...register('isEffective')}
            className="w-5 h-5 text-[var(--color-primary)] border-[var(--color-border)] rounded focus:ring-[var(--color-primary)] cursor-pointer mt-1"
          />
          <label htmlFor="isEffective" className="cursor-pointer">
            <span className="font-medium text-[var(--color-text)]">
              Efetivar transação agora
            </span>
            <p className="text-sm text-[var(--color-text-muted)]">
              Ao efetivar, a transação impacta saldo da conta e objetivos.
            </p>
            {isFixedTransaction && transactionType !== 'investment' && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Para transações fixas, apenas a primeira parcela será efetivada.
              </p>
            )}
          </label>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
          Tipo
        </label>
          <div className={`grid ${showInvestmentOption ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
            <label className={`
              flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all
              ${transactionType === 'income'
                ? 'border-[var(--color-success)] bg-[var(--color-success)]/10'
                : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
              }
            `}>
              <input type="radio" value="income" {...register('type')} className="sr-only" />
              <TrendingUp size={20} className={transactionType === 'income' ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'} />
              <span className={transactionType === 'income' ? 'text-[var(--color-success)] font-medium' : 'text-[var(--color-text-secondary)]'}>
                Receita
              </span>
            </label>

            <label className={`
              flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all
              ${transactionType === 'expense'
                ? 'border-[var(--color-danger)] bg-[var(--color-danger)]/10'
                : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
              }
            `}>
              <input type="radio" value="expense" {...register('type')} className="sr-only" />
              <TrendingDown size={20} className={transactionType === 'expense' ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'} />
              <span className={transactionType === 'expense' ? 'text-[var(--color-danger)] font-medium' : 'text-[var(--color-text-secondary)]'}>
                Despesa
              </span>
            </label>

            {showInvestmentOption && (
              <label className={`
                flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all
                ${transactionType === 'investment'
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                  : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                }
              `}>
                <input type="radio" value="investment" {...register('type')} className="sr-only" />
                <PieChart size={20} className={transactionType === 'investment' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'} />
                <span className={transactionType === 'investment' ? 'text-[var(--color-primary)] font-medium' : 'text-[var(--color-text-secondary)]'}>
                  Aporte
                </span>
              </label>
            )}
          </div>
        </div>

        {!canUseGoals && (
          <div className="flex items-center justify-between gap-3 p-4 bg-[var(--color-action)]/10 rounded-lg border border-[var(--color-action)]/30">
            <div className="flex items-center gap-2">
              <Crown size={18} className="text-[var(--color-action)]" />
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">Objetivos são Premium</p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Desbloqueie aportes vinculados a objetivos.
                </p>
              </div>
            </div>
            <Button size="sm" onClick={() => router.push('/premium')}>
              Ver planos
            </Button>
          </div>
        )}

        <div>
          {transactionType !== 'investment' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">
                  Categoria
                </label>
                <Controller
                  name="categoryId"
                  control={control}
                  rules={{ required: 'Categoria é obrigatória' }}
                  render={({ field }) => (
                    <SearchableSelect
                      options={filteredCategories.map(c => ({ id: c._id, label: c.name, color: c.color }))}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Selecione..."
                      error={errors.categoryId?.message}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">
                  Conta / Carteira
                </label>
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
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                {canUseGoals ? (
                  <Controller
                    name="goalId"
                    control={control}
                    rules={{ required: 'Objetivo é obrigatório' }}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                      <SearchableSelect
                        label="Objetivo"
                        placeholder="Selecione ou busque um objetivo"
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        options={goals.map(g => ({
                          id: g.id || g._id,
                          label: g.description,
                          color: g.color || '#3B82F6'
                        }))}
                      />
                    )}
                  />
                ) : (
                  <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                    <p className="text-sm font-semibold text-[var(--color-text)] mb-1">
                      Objetivos estão disponíveis apenas no Plano Premium
                    </p>
                    {transactionToEdit?.goalId?.description && (
                      <p className="text-xs text-[var(--color-text-secondary)] mb-3">
                        Objetivo atual: {transactionToEdit.goalId.description}
                      </p>
                    )}
                    <Button size="sm" onClick={() => router.push('/premium')}>
                      Ver planos Premium
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">
                  Conta / Carteira
                </label>
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
          )}
        </div>

        {/* Fixed Transaction Checkbox - Only show when creating AND not investment */}
        {!transactionToEdit && transactionType !== 'investment' && (
          <div className="flex items-center gap-3 p-4 bg-[var(--color-bg-elevated)] rounded-lg border border-[var(--color-border)]">
            <input
              type="checkbox"
              id="isFixed"
              {...register('isFixed')}
              className="w-5 h-5 text-[var(--color-primary)] border-[var(--color-border)] rounded focus:ring-[var(--color-primary)] cursor-pointer"
            />
            <label htmlFor="isFixed" className="cursor-pointer">
              <span className="font-medium text-[var(--color-text)]">
                {transactionType === 'income' ? 'Receita Fixa' : 'Despesa Fixa'}
              </span>
              <p className="text-sm text-[var(--color-text-muted)]">
                {transactionType === 'income'
                  ? 'Esta receita será repetida automaticamente todos os meses'
                  : 'Esta despesa será repetida automaticamente todos os meses'}
              </p>
            </label>
          </div>
        )}

        {/* Info for fixed transactions in edit mode */}
        {transactionToEdit && transactionToEdit.isFixed && (
          <div className="p-4 bg-[var(--color-primary)]/10 rounded-lg border border-[var(--color-primary)]/30">
            <p className="text-sm text-[var(--color-text)]">
              <strong>Nota:</strong> Esta é uma {transactionToEdit.type === 'income' ? 'receita' : 'despesa'} fixa. A alteração afetará apenas esta ocorrência.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button type="submit" fullWidth disabled={loading}>
            {blockedByPlan ? 'Plano Premium necessário' : (loading ? 'Salvando...' : 'Salvar')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
