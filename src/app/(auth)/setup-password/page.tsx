'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { authService } from '@/services/api';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { validatePassword } from '@/utils/passwordValidator';

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
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)]">
        <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md text-center">
          <CheckCircle className="text-[var(--color-success)] mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">Senha Configurada!</h2>
          <p className="text-[var(--color-text-secondary)] mb-4">Sua senha foi configurada com sucesso.</p>
          <p className="text-sm text-[var(--color-text-muted)]">Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)]">
      <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/logo.png" alt="DuoFinance" width={40} height={40} className="rounded-lg" />
            <h1 className="text-3xl font-bold text-[var(--color-text)]">DuoFinance</h1>
          </div>
          <p className="text-[var(--color-text-secondary)]">Configure sua senha para acessar a conta</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[var(--color-danger-light)]/20 border-2 border-[var(--color-danger)]/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-[var(--color-danger)] flex-shrink-0" size={20} />
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
          </div>
        )}

        {!token ? (
          <div className="text-center">
            <Link href="/login" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <PasswordInput
              label="Nova Senha"
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

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
          <p className="text-[var(--color-text-secondary)]">Carregando...</p>
        </div>
      </div>
    }>
      <SetupPasswordForm />
    </Suspense>
  );
}
