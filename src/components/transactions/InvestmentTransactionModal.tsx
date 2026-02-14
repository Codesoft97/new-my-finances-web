'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { PiggyBank, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';

import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import CurrencyInput from '@/components/ui/CurrencyInput';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { useAuth } from '@/contexts/AuthContext';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useGoals } from '@/hooks/useGoals';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions';
import { isPremiumFamily } from '@/utils/billing';
import { toast } from 'sonner';
import { toastApiError } from '@/utils/notifications';
import { Transaction } from '@/types';

interface InvestmentTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
}

interface FormData {
  description: string;
  amount: string;
  goalId: string;
  bankAccountId: string;
  isEffective: boolean;
  date: string;
}

export default function InvestmentTransactionModal({ isOpen, onClose, transactionToEdit }: InvestmentTransactionModalProps) {
  const router = useRouter();
  const { family } = useAuth();
  const { bankAccounts } = useBankAccounts();
  const canUseGoalsFromFamily = isPremiumFamily(family);
  const goalsQuery = useGoals({ enabled: canUseGoalsFromFamily });

  const goalsErrorStatus = (goalsQuery.error as any)?.response?.status;
  const canUseGoals = canUseGoalsFromFamily && goalsErrorStatus !== 403;
  const goals = goalsQuery.data?.goals ?? [];

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      description: '',
      amount: '',
      goalId: '',
      bankAccountId: '',
      isEffective: false,
      date: getTodayDate()
    }
  });

  useEffect(() => {
    if (transactionToEdit) {
      reset({
        description: transactionToEdit.description,
        amount: transactionToEdit.amount.toString(),
        goalId: transactionToEdit.goalId?._id || '',
        bankAccountId: transactionToEdit.bankAccountId?._id || '',
        isEffective: transactionToEdit.isEffective,
        date: transactionToEdit.date.split('T')[0]
      });
    } else {
      reset({
        description: '',
        amount: '',
        goalId: '',
        bankAccountId: '',
        isEffective: false,
        date: getTodayDate()
      });
    }
  }, [transactionToEdit, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (!canUseGoals) {
        toast.warning('Objetivos estao disponiveis apenas no Plano Premium');
        return;
      }

      if (transactionToEdit) {
        await updateMutation.mutateAsync({
          id: transactionToEdit._id,
          data: {
            description: data.description,
            amount: parseFloat(data.amount),
            type: 'investment',
            goalId: data.goalId || undefined,
            bankAccountId: data.bankAccountId,
            date: data.date
          }
        });
      } else {
        await createMutation.mutateAsync({
          description: data.description,
          amount: parseFloat(data.amount),
          type: 'investment',
          goalId: data.goalId || undefined,
          bankAccountId: data.bankAccountId,
          date: data.date,
          ...(data.isEffective ? { isEffective: true } : {})
        });
      }
      handleClose();
    } catch (error: unknown) {
      toastApiError(error, 'Erro ao salvar aporte');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const loading = createMutation.isPending || updateMutation.isPending;
  const blockedByPlan = !canUseGoals;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={transactionToEdit ? 'Editar Aporte' : 'Novo Aporte'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Type indicator */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-md">
          <PiggyBank size={18} className="text-[var(--color-primary)]" />
          <span className="text-sm font-medium text-[var(--color-primary)]">Aporte / Investimento</span>
        </div>

        {!canUseGoals && (
          <div className="flex items-center justify-between gap-3 p-3 bg-[var(--color-action)]/10 rounded-md border border-[var(--color-action)]/30">
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

        <Input
          label="Descrição"
          placeholder="Ex: Aporte poupança, CDB..."
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
              id="investIsEffective"
              {...register('isEffective')}
              className="w-5 h-5 text-[var(--color-primary)] border-[var(--color-border)] rounded-sm focus:ring-[var(--color-primary)] cursor-pointer mt-1"
            />
            <label htmlFor="investIsEffective" className="cursor-pointer">
              <span className="font-medium text-[var(--color-text)]">Efetivar transação agora</span>
              <p className="text-sm text-[var(--color-text-muted)]">
                Ao efetivar, a transação impacta saldo da conta e objetivos.
              </p>
            </label>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            {canUseGoals ? (
              <Controller
                name="goalId"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <SearchableSelect
                    label="Objetivo"
                    placeholder="Selecione um objetivo"
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
              <div className="p-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
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

        <div className="flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" fullWidth disabled={loading || blockedByPlan}>
            {blockedByPlan ? 'Plano Premium necessário' : (loading ? 'Salvando...' : 'Salvar')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
