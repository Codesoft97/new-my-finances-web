'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { categoryService } from '@/services/api';
import { Category } from '@/types';

const COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#64748B', '#6B7280', '#000000'
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.list();
      setCategories(data.categories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await categoryService.create({
        name: data.name,
        color: selectedColor,
        type: selectedType
      });

      await loadCategories();
      setIsModalOpen(false);
      reset();
      setSelectedColor(COLORS[0]);
      setSelectedType('expense');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao criar categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await categoryService.delete(categoryToDelete._id);
      await loadCategories();
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao deletar categoria');
    }
  };

  // Separate categories by type
  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
              Categorias
            </h1>
            <p className="text-[var(--color-text-secondary)]">
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
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
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
                  className="bg-[var(--color-bg-card)] rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border-l-4 border-[var(--color-success)]"
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
                        <h3 className="font-semibold text-[var(--color-text)]">{category.name}</h3>
                        <p className="text-sm text-[var(--color-success)]">Receita</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteClick(category)}
                      className="p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]/20 rounded-lg transition-colors cursor-pointer"
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
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
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
                  className="bg-[var(--color-bg-card)] rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border-l-4 border-[var(--color-danger)]"
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
                        <h3 className="font-semibold text-[var(--color-text)]">{category.name}</h3>
                        <p className="text-sm text-[var(--color-danger)]">Despesa</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteClick(category)}
                      className="p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]/20 rounded-lg transition-colors cursor-pointer"
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
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
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

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">
              Cor
            </label>
            <div className="grid grid-cols-10 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`
                    w-10 h-10 rounded-lg transition-all cursor-pointer
                    ${selectedColor === color ? 'ring-4 ring-primary-300 scale-110' : ''}
                  `}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

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
          <p className="text-gray-700 mb-6">
            Tem certeza que deseja deletar a categoria <strong>{categoryToDelete?.name}</strong>?
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