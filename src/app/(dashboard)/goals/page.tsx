'use client';

import { useState, useEffect } from 'react';
import { Plus, Target, Trash2, Pencil, Crown } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import CurrencyInput from '@/components/ui/CurrencyInput';
import Modal from '@/components/ui/Modal';
import ColorPicker from '@/components/ui/ColorPicker';
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '@/hooks/useGoals';
import { Goal } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { isPremiumFamily } from '@/utils/billing';
import { useRouter } from 'next/navigation';

const GOAL_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#64748B'];

export default function GoalsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const { family, loading: authLoading, refreshFamily } = useAuth();
  const router = useRouter();
  const isPremium = isPremiumFamily(family);
  const { data: goalsData, isLoading, error } = useGoals({ enabled: isPremium });
  const goals = goalsData?.goals ?? [];
  const isForbidden = (error as any)?.response?.status === 403;
  const showPaywall = !isPremium || isForbidden;
  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoal();
  const deleteMutation = useDeleteGoal();

  useEffect(() => {
    refreshFamily();
  }, [refreshFamily]);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      description: '',
      totalAmount: '',
      targetDate: '',
      initialAmount: '',
      color: '#3B82F6' // Default blue
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const goalData = {
        description: data.description,
        totalAmount: parseFloat(data.totalAmount),
        targetDate: data.targetDate,
        initialAmount: data.initialAmount ? parseFloat(data.initialAmount) : undefined,
        color: data.color
      };

      if (editingGoal) {
        // Exclude initialAmount from update to prevent duplication
        const { initialAmount, ...updateData } = goalData;
        await updateMutation.mutateAsync({
          id: editingGoal.id || editingGoal._id!,
          data: updateData
        });
      } else {
        await createMutation.mutateAsync(goalData);
      }
      closeModal();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar objetivo');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
    reset({
      description: '',
      totalAmount: '',
      targetDate: '',
      initialAmount: '',
      color: '#3B82F6'
    });
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    reset({
      description: goal.description,
      totalAmount: goal.totalAmount.toString(),
      targetDate: goal.targetDate.split('T')[0],
      initialAmount: '', // Don't populate initialAmount to avoid confusion
      color: goal.color
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este objetivo?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert('Erro ao excluir objetivo');
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  const calculateProgress = (goal: Goal) => {
    if (goal.totalAmount <= 0) return 0;
    const progress = (goal.valorAportado / goal.totalAmount) * 100;
    return Math.min(progress, 100);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-medium text-[var(--color-text)] mb-1">
              Objetivos
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              Defina metas e acompanhe suas conquistas
            </p>
          </div>
          {showPaywall ? (
            <Button onClick={() => router.push('/premium')} className="flex items-center gap-2">
              <Crown size={20} />
              Assinar Premium
            </Button>
          ) : (
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
              <Plus size={20} />
              Novo Objetivo
            </Button>
          )}
        </div>

        {/* Goals List */}
        {authLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        ) : showPaywall ? (
          <div className="text-center py-10 bg-[var(--color-bg-card)] rounded-md border border-[var(--color-border)]">
            <div className="w-16 h-16 bg-[var(--color-action)]/10 rounded-md flex items-center justify-center mx-auto mb-4">
              <Crown size={32} className="text-[var(--color-action)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--color-text)] mb-1">
              Objetivos são do Plano Premium
            </h3>
            <p className="text-[var(--color-text-muted)] max-w-lg mx-auto mb-6">
              Crie metas financeiras, acompanhe seu progresso e planeje seus sonhos. Assine o Premium para desbloquear este recurso.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => router.push('/premium')} className="flex items-center gap-2">
                <Crown size={18} />
                Ver planos Premium
              </Button>
              <Button onClick={() => router.push('/transactions')} variant="outline">
                Continuar sem objetivos
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        ) : !goals || goals.length === 0 ? (
          <div className="text-center py-10 bg-[var(--color-bg-card)] rounded-md border border-[var(--color-border)]">
            <div className="w-16 h-16 bg-[var(--color-bg-elevated)] rounded-md flex items-center justify-center mx-auto mb-4">
              <Target size={32} className="text-[var(--color-text-muted)]" />
            </div>
            <h3 className="text-base font-medium text-[var(--color-text)] mb-2">
              Nenhum objetivo encontrado
            </h3>
            <p className="text-[var(--color-text-muted)] max-w-md mx-auto mb-6">
              Comece a planejar seu futuro financeiro criando seu primeiro objetivo.
            </p>
            <Button onClick={() => setIsModalOpen(true)} variant="outline">
              Criar Objetivo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const progress = calculateProgress(goal);
              // Use id from API response, fallback to _id if needed, or index as last resort (though discouraged)
              const goalId = goal.id || goal._id;

              return (
                <div
                  key={goalId}
                  className="bg-[var(--color-bg-card)] rounded-md p-4 border border-[var(--color-border)] border-l-2"
                  style={{ borderLeftColor: goal.color }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-base font-medium text-[var(--color-text)] mb-1">{goal.description}</h3>
                      <p className="text-sm text-[var(--color-text-muted)]">Meta: {formatDate(goal.targetDate)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] cursor-pointer transition-colors rounded-md hover:bg-[var(--color-bg-elevated)]"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(goalId)}
                        className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] cursor-pointer transition-colors rounded-md hover:bg-[var(--color-bg-elevated)]"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center ml-2"
                        style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                      >
                        <Target size={20} />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[var(--color-text-secondary)]">Progresso</span>
                      <span className="font-medium text-[var(--color-text)]">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-[var(--color-bg-elevated)] rounded-sm h-2.5 overflow-hidden">
                      <div
                        className="h-2.5 rounded-sm transition-all duration-500"
                        style={{ width: `${progress}%`, backgroundColor: goal.color }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[var(--color-border)]">
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">Acumulado</p>
                      <p className="font-medium text-[var(--color-success)]">{formatCurrency(goal.valorAportado)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--color-text-muted)]">Meta Total</p>
                      <p className="font-medium text-[var(--color-text)]">{formatCurrency(goal.totalAmount)}</p>
                    </div>
                  </div>

                  {goal.valorRestante > 0 && (
                    <div className="mt-2 text-xs text-center bg-[var(--color-bg-elevated)] py-1 rounded px-2 text-[var(--color-text-secondary)]">
                      Faltam: <strong>{formatCurrency(goal.valorRestante)}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingGoal ? "Editar Objetivo" : "Novo Objetivo"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Descrição"
            placeholder="Ex: Comprar Carro"
            error={errors.description?.message as string}
            {...register('description', {
              required: 'Descrição é obrigatória',
              maxLength: { value: 100, message: 'Máximo 100 caracteres' }
            })}
          />

          <Controller
            name="totalAmount"
            control={control}
            rules={{
              required: 'Valor total é obrigatório',
              validate: (value) => parseFloat(value) > 0 || 'Valor deve ser maior que zero'
            }}
            render={({ field: { onChange, value } }) => (
              <CurrencyInput
                label="Valor da Meta"
                value={value}
                onChange={onChange}
                error={errors.totalAmount?.message as string}
                placeholder="0,00"
              />
            )}
          />

          {!editingGoal && (
            <Controller
              name="initialAmount"
              control={control}
              render={({ field: { onChange, value } }) => (
                <CurrencyInput
                  label="Valor Inicial (Já guardado)"
                  value={value}
                  onChange={onChange}
                  placeholder="0,00"
                />
              )}
            />
          )}

          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              Data Alvo
            </label>
            <input
              type="date"
              {...register('targetDate', { required: 'Data alvo é obrigatória' })}
              className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-medium cursor-pointer"
            />
            {errors.targetDate && (
              <p className="mt-2 text-sm text-[var(--color-danger)]">{errors.targetDate.message as string}</p>
            )}
          </div>

          <Controller
            name="color"
            control={control}
            render={({ field: { onChange, value } }) => (
              <ColorPicker
                label="Cor de identificação"
                colors={GOAL_COLORS}
                value={value}
                onChange={onChange}
              />
            )}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={closeModal}
            >
              Cancelar
            </Button>
            <Button type="submit" fullWidth disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : (editingGoal ? 'Salvar Alterações' : 'Criar Objetivo')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
