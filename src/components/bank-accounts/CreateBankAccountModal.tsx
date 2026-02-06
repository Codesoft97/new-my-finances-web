
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, Check } from 'lucide-react';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import CurrencyInput from '@/components/ui/CurrencyInput';

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
      reset();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar conta bancária');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--color-bg-card)] rounded-2xl w-full max-w-md shadow-2xl border border-[var(--color-border)] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
            Nova Conta Bancária
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
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Tipo de Conta
            </label>
            <select
              {...register('type', { required: 'Tipo é obrigatório' })}
              className="w-full px-4 py-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
            >
              <option value="checking">Conta Corrente</option>
              <option value="payment">Conta de Pagamento</option>
              <option value="salary">Conta Salário</option>
              <option value="savings">Conta Poupança</option>
            </select>
          </div>

          <div>
            <Controller
              name="initialBalance"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  label="Saldo Inicial"
                  value={String(field.value)}
                  onChange={(val) => field.onChange(parseFloat(val))}
                  error={errors.initialBalance?.message}
                  placeholder="0,00"
                />
              )}
            />
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
              {isSubmitting ? 'Criando...' : 'Criar Conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
