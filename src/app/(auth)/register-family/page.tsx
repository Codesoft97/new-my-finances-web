'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Wallet, Users } from 'lucide-react';

export default function RegisterFamilyPage() {
  const { user, registerFamily, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError('');

    const result = await registerFamily(data.familyName, data.name, data.email, data.password);

    if (!result.success) {
      setError(result.message || 'Erro ao criar família');
    }

    setIsLoading(false);
  };

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wallet className="text-primary-600" size={36} />
            <h1 className="text-3xl font-bold text-gray-900">Minhas Finanças</h1>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Users size={20} />
            <p>Criar conta familiar para casais</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Nome da Família"
            placeholder="Ex: Família Silva"
            error={errors.familyName?.message as string}
            {...register('familyName', {
              required: 'Nome da família é obrigatório',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              maxLength: { value: 100, message: 'Máximo 100 caracteres' }
            })}
          />

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Seus dados (primeiro membro)</p>
          </div>

          <Input
            label="Seu Nome"
            placeholder="Seu nome completo"
            error={errors.name?.message as string}
            {...register('name', {
              required: 'Nome é obrigatório',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              maxLength: { value: 100, message: 'Máximo 100 caracteres' }
            })}
          />

          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message as string}
            {...register('email', {
              required: 'Email é obrigatório',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email inválido'
              }
            })}
          />

          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message as string}
            {...register('password', {
              required: 'Senha é obrigatória',
              minLength: { value: 6, message: 'Mínimo 6 caracteres' }
            })}
          />

          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? 'Criando família...' : 'Criar Conta Familiar'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">
              Faça login
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            Quer uma conta individual?{' '}
            <Link href="/register" className="font-medium text-primary-600 hover:text-primary-700">
              Cadastro simples
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
