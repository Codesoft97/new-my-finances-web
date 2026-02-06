
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Check } from 'lucide-react';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { BankAccount } from '@/types';

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
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar conta bancária');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--color-bg-card)] rounded-2xl w-full max-w-md shadow-2xl border border-[var(--color-border)] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-[var(--color-text)]">
            Editar Conta
          </h2>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] cursor-pointer transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-100 rounded-lg dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Nome da Conta
            </label>
            <input
              {...register('name', { required: 'Nome é obrigatório' })}
              className="w-full px-4 py-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
              placeholder="Ex: Nubank, Carteira..."
            />
            {errors.name && <span className="text-xs text-[var(--color-danger)]">{errors.name.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Cor de Identificação
            </label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${selectedColor === color ? 'ring-2 ring-offset-2 ring-[var(--color-primary)]' : ''
                    }`}
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] cursor-pointer font-medium hover:bg-[var(--color-bg-elevated)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold hover:bg-[var(--color-primary-dark)] cursor-pointer transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Salvar' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
