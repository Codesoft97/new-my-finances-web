'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import ColorPicker from '@/components/ui/ColorPicker';
import CurrencyInput from '@/components/ui/CurrencyInput';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useCreditCards } from '@/hooks/useCreditCards';
import { CreditCard } from '@/types';

interface CreditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardToEdit?: CreditCard | null;
}

interface CreditCardFormData {
  name: string;
  limit: string;
  currentInvoiceAmount: string;
  brand: 'mastercard' | 'visa' | 'elo' | 'outro';
  closingDay: string;
  dueDay: string;
  color: string;
  bankAccountId: string;
}

const BRAND_OPTIONS = [
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'visa', label: 'Visa' },
  { value: 'elo', label: 'Elo' },
  { value: 'outro', label: 'Outro' },
];

const COLORS = [
  '#820AD1', // Nubank Purple
  '#000000', // Black
  '#DC2430', // Red
  '#0047BB', // Blue
  '#EC7000', // Orange
  '#13C168', // Green
  '#00C9FF', // Cyan
  '#F5A623', // Gold
];

export default function CreditCardModal({ isOpen, onClose, cardToEdit }: CreditCardModalProps) {
  const { bankAccounts } = useBankAccounts();
  const { createCreditCard, updateCreditCard } = useCreditCards();
  const [error, setError] = useState('');
  const isEditing = !!cardToEdit;

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<CreditCardFormData>({
    defaultValues: {
      name: '',
      limit: '',
      currentInvoiceAmount: '0',
      brand: 'mastercard',
      closingDay: '',
      dueDay: '',
      color: COLORS[0],
      bankAccountId: '',
    },
  });

  const selectedColor = watch('color');

  useEffect(() => {
    if (cardToEdit) {
      setValue('name', cardToEdit.name);
      setValue('limit', cardToEdit.limit.toString());
      setValue('brand', cardToEdit.brand);
      setValue('closingDay', cardToEdit.closingDay.toString());
      setValue('dueDay', cardToEdit.dueDay.toString());
      setValue('color', cardToEdit.color);
      setValue('bankAccountId', cardToEdit.bankAccountId?._id || '');
    } else {
      reset({
        name: '',
        limit: '',
        currentInvoiceAmount: '0',
        brand: 'mastercard',
        closingDay: '',
        dueDay: '',
        color: COLORS[0],
        bankAccountId: '',
      });
    }
  }, [cardToEdit, setValue, reset]);

  const onSubmit = async (data: CreditCardFormData) => {
    setError('');
    try {
      if (isEditing && cardToEdit) {
        await updateCreditCard.mutateAsync({
          id: cardToEdit._id,
          data: {
            name: data.name,
            limit: parseFloat(data.limit),
            brand: data.brand,
            closingDay: parseInt(data.closingDay),
            dueDay: parseInt(data.dueDay),
            color: data.color,
            bankAccountId: data.bankAccountId,
          },
        });
      } else {
        await createCreditCard.mutateAsync({
          name: data.name,
          limit: parseFloat(data.limit),
          currentInvoiceAmount: parseFloat(data.currentInvoiceAmount) || 0,
          brand: data.brand,
          closingDay: parseInt(data.closingDay),
          dueDay: parseInt(data.dueDay),
          color: data.color,
          bankAccountId: data.bankAccountId,
        });
      }
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar cartão de crédito');
    }
  };

  const handleClose = () => {
    setError('');
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar Cartão' : 'Novo Cartão de Crédito'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 rounded-lg">
            {error}
          </div>
        )}

        <Input
          label="Nome do Cartão"
          placeholder="Ex: Nubank, Inter..."
          error={errors.name?.message as string}
          {...register('name', {
            required: 'Nome é obrigatório',
            maxLength: { value: 50, message: 'Máximo 50 caracteres' },
          })}
        />

        <Controller
          name="limit"
          control={control}
          rules={{
            required: 'Limite é obrigatório',
            validate: (value) => parseFloat(value) > 0 || 'Limite deve ser maior que zero',
          }}
          render={({ field: { onChange, value } }) => (
            <CurrencyInput
              label="Limite"
              value={value}
              onChange={onChange}
              error={errors.limit?.message as string}
              placeholder="0,00"
            />
          )}
        />

        {!isEditing && (
          <Controller
            name="currentInvoiceAmount"
            control={control}
            render={({ field: { onChange, value } }) => (
              <CurrencyInput
                label="Valor da Fatura Atual"
                value={value}
                onChange={onChange}
                error={errors.currentInvoiceAmount?.message as string}
                placeholder="0,00"
              />
            )}
          />
        )}

        <div>
          <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
            Bandeira
          </label>
          <select
            {...register('brand', { required: 'Bandeira é obrigatória' })}
            className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] cursor-pointer"
          >
            {BRAND_OPTIONS.map((brand) => (
              <option key={brand.value} value={brand.value}>
                {brand.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              Dia do Fechamento
            </label>
            <input
              type="number"
              min="1"
              max="31"
              {...register('closingDay', {
                required: 'Obrigatório',
                min: { value: 1, message: 'Mín. 1' },
                max: { value: 31, message: 'Máx. 31' },
              })}
              className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
              placeholder="Ex: 5"
            />
            {errors.closingDay && (
              <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.closingDay.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              Dia do Vencimento
            </label>
            <input
              type="number"
              min="1"
              max="31"
              {...register('dueDay', {
                required: 'Obrigatório',
                min: { value: 1, message: 'Mín. 1' },
                max: { value: 31, message: 'Máx. 31' },
              })}
              className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
              placeholder="Ex: 15"
            />
            {errors.dueDay && (
              <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.dueDay.message}</p>
            )}
          </div>
        </div>

        <Controller
          name="bankAccountId"
          control={control}
          rules={{ required: 'Conta é obrigatória' }}
          render={({ field }) => (
            <SearchableSelect
              label="Conta Vinculada"
              options={bankAccounts?.map((b) => ({ id: b._id, label: b.name, color: b.color })) || []}
              value={field.value}
              onChange={field.onChange}
              placeholder="Selecione a conta..."
              error={errors.bankAccountId?.message as string}
            />
          )}
        />

        <ColorPicker
          label="Cor do Cartão"
          colors={COLORS}
          value={selectedColor}
          onChange={(color) => setValue('color', color)}
        />

        <div className="pt-4 flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Cartão'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
