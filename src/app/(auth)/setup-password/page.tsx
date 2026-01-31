'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { authService } from '@/services/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Wallet, CheckCircle, AlertCircle } from 'lucide-react';

function SetupPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  useEffect(() => {
    if (!token) {
      setError('Token inválido. Solicite um novo link de configuração.');
    }
  }, [token]);

  const onSubmit = async (data: any) => {
    if (!token) return;

    setIsLoading(true);
    setError('');

    try {
      await authService.setupPassword({ token, password: data.password });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao configurar senha');
    }

    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Senha Configurada!</h2>
          <p className="text-gray-600 mb-4">Sua senha foi configurada com sucesso.</p>
          <p className="text-sm text-gray-500">Redirecionando para o login...</p>
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
          <p className="text-gray-600">Configure sua senha para acessar a conta</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!token ? (
          <div className="text-center">
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Nova Senha"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message as string}
              {...register('password', {
                required: 'Senha é obrigatória',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' }
              })}
            />

            <Input
              label="Confirmar Senha"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message as string}
              {...register('confirmPassword', {
                required: 'Confirmação é obrigatória',
                validate: (value: string) => value === password || 'As senhas não coincidem'
              })}
            />

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? 'Configurando...' : 'Configurar Senha'}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <SetupPasswordForm />
    </Suspense>
  );
}
