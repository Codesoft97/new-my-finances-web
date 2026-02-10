'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import CurrencyInput from '@/components/ui/CurrencyInput';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { useCategories } from '@/hooks/useCategories';
import { useCreditCards } from '@/hooks/useCreditCards';
import { CreditCard } from '@/types';

interface CreditCardTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CreditCard;
}

interface CardTransactionFormData {
  description: string;
  amount: string;
  categoryId: string;
  type: 'single' | 'installment' | 'fixed';
  installments: string;
  date: string;
}

const TYPE_OPTIONS = [
  { value: 'single', label: 'À Vista', description: 'Valor integral em uma fatura' },
  { value: 'installment', label: 'Parcelado', description: 'Dividido em N meses' },
  { value: 'fixed', label: 'Fixo', description: 'Repetido por 12 meses' },
];

export default function CreditCardTransactionModal({ isOpen, onClose, card }: CreditCardTransactionModalProps) {
  const { data: categoriesData } = useCategories();
  const { createCardTransaction } = useCreditCards();
  const [error, setError] = useState('');

  const categories = (categoriesData?.categories ?? []).filter((c: any) => c.type === 'expense');

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const { register, handleSubmit, control, reset, watch, formState: { errors, isSubmitting } } = useForm<CardTransactionFormData>({
    defaultValues: {
      description: '',
      amount: '',
      categoryId: '',
      type: 'single',
      installments: '2',
      date: getTodayDate(),
    },
  });

  const transactionType = watch('type');

  const onSubmit = async (data: CardTransactionFormData) => {
    setError('');
    try {
      await createCardTransaction.mutateAsync({
        cardId: card._id,
        data: {
          description: data.description,
          amount: parseFloat(data.amount),
          categoryId: data.categoryId,
          type: data.type,
          ...(data.type === 'installment' ? { installments: parseInt(data.installments) } : {}),
          date: data.date,
        },
      });
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar transação');
    }
  };

  const handleClose = () => {
    setError('');
    reset({
      description: '',
      amount: '',
      categoryId: '',
      type: 'single',
      installments: '2',
      date: getTodayDate(),
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nova Despesa no Cartão">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-elevated)] rounded-md border border-[var(--color-border)]">
          <div
            className="w-3 h-8 rounded-sm flex-shrink-0"
            style={{ backgroundColor: card.color }}
          />
          <div>
            <p className="font-medium text-[var(--color-text)]">{card.name}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Limite disponível: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.availableLimit)}
            </p>
          </div>
        </div>

        <Input
          label="Descrição"
          placeholder="Ex: Supermercado"
          error={errors.description?.message}
          {...register('description', {
            required: 'Descrição é obrigatória',
            maxLength: { value: 200, message: 'Máximo 200 caracteres' },
          })}
        />

        <Controller
          name="amount"
          control={control}
          rules={{
            required: 'Valor é obrigatório',
            validate: (value) => parseFloat(value) > 0 || 'Valor deve ser maior que zero',
          }}
          render={({ field: { onChange, value } }) => (
            <CurrencyInput
              label="Valor Total"
              value={value}
              onChange={onChange}
              error={errors.amount?.message as string}
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
            className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-medium cursor-pointer"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.date.message}</p>
          )}
        </div>

        <Controller
          name="categoryId"
          control={control}
          rules={{ required: 'Categoria é obrigatória' }}
          render={({ field }) => (
            <SearchableSelect
              label="Categoria"
              options={categories.map((c: any) => ({ id: c._id, label: c.name, color: c.color }))}
              value={field.value}
              onChange={field.onChange}
              placeholder="Selecione..."
              error={errors.categoryId?.message as string}
            />
          )}
        />

        <div>
          <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
            Tipo da Despesa
          </label>
          <div className="grid grid-cols-3 gap-3">
            {TYPE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`
                  flex flex-col items-center gap-1 p-3 border rounded-md cursor-pointer transition-colors text-center
                  ${transactionType === opt.value
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                    : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                  }
                `}
              >
                <input type="radio" value={opt.value} {...register('type')} className="sr-only" />
                <span className={`text-sm font-medium ${transactionType === opt.value ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>
                  {opt.label}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] leading-tight">
                  {opt.description}
                </span>
              </label>
            ))}
          </div>
        </div>

        {transactionType === 'installment' && (
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              Número de Parcelas
            </label>
            <input
              type="number"
              min="2"
              max="48"
              {...register('installments', {
                required: 'Número de parcelas é obrigatório',
                min: { value: 2, message: 'Mínimo 2 parcelas' },
                max: { value: 48, message: 'Máximo 48 parcelas' },
              })}
              className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
              placeholder="Ex: 3"
            />
            {errors.installments && (
              <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.installments.message}</p>
            )}
            {transactionType === 'installment' && watch('amount') && parseInt(watch('installments')) >= 2 && (
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                {parseInt(watch('installments'))}x de{' '}
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  parseFloat(watch('amount')) / parseInt(watch('installments'))
                )}
              </p>
            )}
          </div>
        )}

        <div className="pt-4 flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Criando...' : 'Adicionar Despesa'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
