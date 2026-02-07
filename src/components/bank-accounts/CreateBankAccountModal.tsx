
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import ColorPicker from '@/components/ui/ColorPicker';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import CurrencyInput from '@/components/ui/CurrencyInput';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface CreateBankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateBankAccountFormData {
  name: string;
  type: 'checking' | 'payment' | 'salary' | 'savings';
  color: string;
  initialBalance: number;
}

const COLORS = [
  '#000000', // Black
  '#820AD1', // Nubank Purple
  '#FF7A00', // Inter Orange
  '#EC7000', // Itaú Orange
  '#DC2430', // Santander Red
  '#0047BB', // Bradesco Blue
  '#13C168', // Green
  '#00C9FF', // Cyan
];

export default function CreateBankAccountModal({ isOpen, onClose }: CreateBankAccountModalProps) {
  const { createBankAccount } = useBankAccounts();
  const [error, setError] = useState('');

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<CreateBankAccountFormData>({
    defaultValues: {
      type: 'checking',
      color: COLORS[0],
      initialBalance: 0,
    }
  });

  const selectedColor = watch('color');

  const onSubmit = async (data: CreateBankAccountFormData) => {
    setError('');
    try {
      await createBankAccount.mutateAsync(data);
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar conta bancária');
    }
  };

  const handleClose = () => {
    setError('');
    reset({
      name: '',
      type: 'checking',
      color: COLORS[0],
      initialBalance: 0
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nova Conta Bancária"
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 rounded-lg">
            {error}
          </div>
        )}

        <Input
          label="Nome da Conta"
          placeholder="Ex: Nubank, Carteira..."
          error={errors.name?.message as string}
          {...register('name', { required: 'Nome é obrigatório' })}
        />

        <div>
          <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
            Tipo de Conta
          </label>
          <select
            {...register('type', { required: 'Tipo é obrigatório' })}
            className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] cursor-pointer"
          >
            <option value="checking">Conta Corrente</option>
            <option value="payment">Conta de Pagamento</option>
            <option value="salary">Conta Salário</option>
            <option value="savings">Conta Poupança</option>
          </select>
        </div>

        <Controller
          name="initialBalance"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Saldo Inicial"
              value={String(field.value)}
              onChange={(val) => field.onChange(parseFloat(val))}
              error={errors.initialBalance?.message as string}
              placeholder="0,00"
            />
          )}
        />

        <ColorPicker
          label="Cor de Identificação"
          colors={COLORS}
          value={selectedColor}
          onChange={(color) => setValue('color', color)}
        />

        <div className="pt-4 flex gap-3">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Criando...' : 'Criar Conta'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
