'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import GoogleLoginButton from '@/components/ui/GoogleLoginButton';
import { validatePassword } from '@/utils/passwordValidator';

export default function RegisterPage() {
  const { user, register: registerUser, loginWithGoogle, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const passwordValue = watch('password', '');

  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError('');

    const result = await registerUser(data.name, data.email, data.password);

    if (!result.success) {
      setError(result.message || 'Erro ao criar conta');
    }

    setIsLoading(false);
  };

  const handleGoogleSuccess = async (idToken: string) => {
    setIsGoogleLoading(true);
    setError('');

    const result = await loginWithGoogle(idToken);

    if (!result.success) {
      setError(result.message || 'Erro ao fazer login com Google');
    }

    setIsGoogleLoading(false);
  };

  const handleGoogleError = (message: string) => {
    setError(message);
  };

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
          <p className="text-[var(--color-text-secondary)]">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)]">
      <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/logo.svg" alt="DuoFinance" width={60} height={60} className="rounded-lg" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">DuoFinance</h1>
          </div>
          <p className="text-[var(--color-text-secondary)]">Crie sua conta para começar</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Nome"
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

          <PasswordInput
            label="Senha"
            placeholder="••••••••"
            error={errors.password?.message as string}
            {...register('password', {
              required: 'Senha é obrigatória',
              validate: (value: string) => {
                const result = validatePassword(value);
                return result.isValid || result.errors[0];
              }
            })}
          />

          <Button type="submit" fullWidth disabled={isLoading || isGoogleLoading}>
            {isLoading ? 'Criando conta...' : 'Criar Conta'}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-[var(--color-border)]"></div>
          <span className="text-sm text-[var(--color-text-secondary)]">ou</span>
          <div className="flex-1 h-px bg-[var(--color-border)]"></div>
        </div>

        <div className={isGoogleLoading ? 'opacity-50 pointer-events-none' : ''}>
          <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}