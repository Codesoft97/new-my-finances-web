
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ColorPicker from '@/components/ui/ColorPicker';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { BankAccount } from '@/types';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface EditBankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: BankAccount;
}

interface EditBankAccountFormData {
  name: string;
  color: string;
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

export default function EditBankAccountModal({ isOpen, onClose, account }: EditBankAccountModalProps) {
  const { updateBankAccount } = useBankAccounts();
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<EditBankAccountFormData>({
    defaultValues: {
      name: account.name,
      color: account.color,
    }
  });

  // Reset form when account changes
  useEffect(() => {
    if (account) {
      reset({
        name: account.name,
        color: account.color,
      });
    }
  }, [account, reset]);

  const selectedColor = watch('color');

  const onSubmit = async (data: EditBankAccountFormData) => {
    setError('');
    try {
      await updateBankAccount.mutateAsync({ id: account._id, data });
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar conta bancária');
    }
  };

  const handleClose = () => {
    setError('');
    reset({
      name: account.name,
      color: account.color
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Conta"
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
            {isSubmitting ? 'Salvar' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
