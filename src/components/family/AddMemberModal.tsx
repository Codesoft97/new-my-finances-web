'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { CheckCircle, Copy, Check } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemberAdded?: () => void;
}

export default function AddMemberModal({ isOpen, onClose, onMemberAdded }: AddMemberModalProps) {
  const { addMember } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sendEmailLink, setSendEmailLink] = useState(false);
  const [success, setSuccess] = useState<{ setupUrl?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleClose = () => {
    reset();
    setError('');
    setSuccess(null);
    setSendEmailLink(false);
    setCopied(false);
    onMemberAdded?.();
    onClose();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError('');

    const result = await addMember(
      data.name,
      data.email,
      sendEmailLink ? undefined : data.password,
      sendEmailLink
    );

    if (result.success) {
      if (result.setupUrl) {
        setSuccess({ setupUrl: result.setupUrl });
      } else {
        setSuccess({});
        setTimeout(handleClose, 2000);
      }
    } else {
      setError(result.message || 'Erro ao adicionar membro');
    }

    setIsLoading(false);
  };

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Membro Adicionado">
        <div className="text-center py-4">
          <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Membro adicionado com sucesso!</h3>

          {success.setupUrl ? (
            <div className="mt-4">
              <p className="text-gray-600 mb-4">
                Compartilhe o link abaixo para que o membro configure sua senha:
              </p>
              <div className="bg-gray-100 p-3 rounded-lg flex items-center gap-2">
                <input
                  type="text"
                  value={success.setupUrl}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                />
                <button
                  onClick={() => copyToClipboard(success.setupUrl!)}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                >
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-gray-500" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                O link expira em 24 horas.
              </p>
            </div>
          ) : (
            <p className="text-gray-600">O membro já pode fazer login com a senha definida.</p>
          )}

          <Button className="mt-6" onClick={handleClose}>
            Fechar
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Adicionar Membro">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-sm text-red-600 text-center">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Nome"
          placeholder="Nome do membro"
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
          placeholder="email@exemplo.com"
          error={errors.email?.message as string}
          {...register('email', {
            required: 'Email é obrigatório',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email inválido'
            }
          })}
        />

        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="sendEmailLink"
            checked={sendEmailLink}
            onChange={(e) => setSendEmailLink(e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="sendEmailLink" className="text-sm text-gray-700 cursor-pointer">
            Gerar link para configurar senha depois
          </label>
        </div>

        {!sendEmailLink && (
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message as string}
            {...register('password', {
              required: sendEmailLink ? false : 'Senha é obrigatória',
              minLength: { value: 6, message: 'Mínimo 6 caracteres' }
            })}
          />
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
