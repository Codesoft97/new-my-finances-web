'use client';

import { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ColorPicker from '@/components/ui/ColorPicker';
import { Category } from '@/types';
import { useCategories, useCreateCategory, useDeleteCategory } from '@/hooks/useCategories';

const COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#64748B', '#6B7280', '#000000'
];

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');

  // React Query hooks
  const { data: categoriesData } = useCategories();
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();

  const categories = categoriesData?.categories ?? [];

  const isProtectedCategory = (category: Category) => {
    const name = category.name?.trim().toLowerCase();
    return name === 'renda' || name === 'outros';
  };

  const getProtectedCategoryMessage = (category: Category) => {
    const name = category.name?.trim().toLowerCase();
    if (name === 'renda') return 'Categoria "Renda" nao pode ser deletada';
    if (name === 'outros') return 'Categoria "Outros" nao pode ser deletada';
    return 'Categoria protegida nao pode ser deletada';
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        color: selectedColor,
        type: selectedType
      });
      setIsModalOpen(false);
      reset();
      setSelectedColor(COLORS[0]);
      setSelectedType('expense');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao criar categoria');
    }
  };

  const handleDeleteClick = (category: Category) => {
    if (isProtectedCategory(category)) {
      alert(getProtectedCategoryMessage(category));
      return;
    }
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    if (isProtectedCategory(categoryToDelete)) {
      alert(getProtectedCategoryMessage(categoryToDelete));
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      return;
    }

    try {
      await deleteMutation.mutateAsync(categoryToDelete._id);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao deletar categoria');
    }
  };

  // Separate categories by type
  const incomeCategories = categories.filter(c => c.type === 'income');

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const loading = createMutation.isPending;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-[var(--color-text)] mb-2">
              Categorias
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Organize suas transações por categorias
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={20} className="mr-2 inline" />
            Nova Categoria
          </Button>
        </div>

        {/* Income Categories */}
        <div className="mb-8">
          <h2 className="text-base font-medium text-[var(--color-text)] mb-4 flex items-center gap-2">
            <TrendingUp className="text-[var(--color-success)]" size={20} />
            Categorias de Receita
          </h2>
          {incomeCategories.length === 0 ? (
            <p className="text-[var(--color-text-muted)] text-sm">Nenhuma categoria de receita cadastrada</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {incomeCategories.map((category) => (
                <div
                  key={category._id}
                  className="bg-[var(--color-bg-card)] rounded-md p-4 border border-[var(--color-border)] border-l-2 border-[var(--color-success)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: category.color }}
                      >
                        <TrendingUp className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-[var(--color-text)]">{category.name}</h3>
                        <p className="text-sm text-[var(--color-success)]">Receita</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteClick(category)}
                      className={`p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]/20 rounded-lg transition-colors cursor-pointer ${isProtectedCategory(category) ? 'hidden' : ''}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expense Categories */}
        <div className="mb-8">
          <h2 className="text-base font-medium text-[var(--color-text)] mb-4 flex items-center gap-2">
            <TrendingDown className="text-[var(--color-danger)]" size={20} />
            Categorias de Despesa
          </h2>
          {expenseCategories.length === 0 ? (
            <p className="text-[var(--color-text-muted)] text-sm">Nenhuma categoria de despesa cadastrada</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {expenseCategories.map((category) => (
                <div
                  key={category._id}
                  className="bg-[var(--color-bg-card)] rounded-md p-4 border border-[var(--color-border)] border-l-2 border-[var(--color-danger)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: category.color }}
                      >
                        <TrendingDown className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-[var(--color-text)]">{category.name}</h3>
                        <p className="text-sm text-[var(--color-danger)]">Despesa</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteClick(category)}
                      className={`p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]/20 rounded-lg transition-colors cursor-pointer ${isProtectedCategory(category) ? 'hidden' : ''}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--color-text-muted)] mb-4">Nenhuma categoria cadastrada</p>
            <Button onClick={() => setIsModalOpen(true)} variant="outline">
              Criar primeira categoria
            </Button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
          setSelectedColor(COLORS[0]);
          setSelectedType('expense');
        }}
        title="Nova Categoria"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Nome da Categoria"
            placeholder="Ex: Alimentação, Transporte..."
            error={errors.name?.message as string}
            {...register('name', {
              required: 'Nome é obrigatório',
              maxLength: { value: 50, message: 'Máximo 50 caracteres' }
            })}
          />

          {/* Type Selector */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Tipo
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`
                flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all
                ${selectedType === 'income'
                  ? 'border-[var(--color-success)] bg-[var(--color-success)]/10'
                  : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                }
              `}>
                <input
                  type="radio"
                  value="income"
                  checked={selectedType === 'income'}
                  onChange={() => setSelectedType('income')}
                  className="sr-only"
                />
                <TrendingUp size={20} className={selectedType === 'income' ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'} />
                <span className={selectedType === 'income' ? 'text-[var(--color-success)] font-medium' : 'text-[var(--color-text-secondary)]'}>
                  Receita
                </span>
              </label>

              <label className={`
                flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all
                ${selectedType === 'expense'
                  ? 'border-[var(--color-danger)] bg-[var(--color-danger)]/10'
                  : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                }
              `}>
                <input
                  type="radio"
                  value="expense"
                  checked={selectedType === 'expense'}
                  onChange={() => setSelectedType('expense')}
                  className="sr-only"
                />
                <TrendingDown size={20} className={selectedType === 'expense' ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'} />
                <span className={selectedType === 'expense' ? 'text-[var(--color-danger)] font-medium' : 'text-[var(--color-text-secondary)]'}>
                  Despesa
                </span>
              </label>
            </div>
          </div>

          <ColorPicker
            label="Cor"
            colors={COLORS}
            value={selectedColor}
            onChange={setSelectedColor}
          />

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => {
                setIsModalOpen(false);
                reset();
                setSelectedColor(COLORS[0]);
                setSelectedType('expense');
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="text-center">
          <p className="text-[var(--color-text-secondary)] mb-2">
            Tem certeza que deseja deletar a categoria <strong>{categoryToDelete?.name}</strong>?
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            As transações vinculadas a esta categoria serão automaticamente transferidas para a categoria <strong>Outros</strong>.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setIsDeleteModalOpen(false);
                setCategoryToDelete(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="danger" fullWidth onClick={confirmDelete}>
              Deletar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
