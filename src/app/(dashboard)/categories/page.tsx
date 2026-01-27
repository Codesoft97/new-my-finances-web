'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
        color: selectedColor
      });

      await loadCategories();
      setIsModalOpen(false);
      reset();
      setSelectedColor(COLORS[0]);
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

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Categorias
            </h1>
            <p className="text-gray-600">
              Organize suas transações por categorias
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={20} className="mr-2 inline" />
            Nova Categoria
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category._id}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: category.color }}
                  >
                    <span className="text-2xl">📁</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.color}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteClick(category)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Nenhuma categoria cadastrada</p>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Cor
            </label>
            <div className="grid grid-cols-10 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`
                    w-10 h-10 rounded-lg transition-all
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