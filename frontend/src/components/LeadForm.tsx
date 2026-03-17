'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createLead } from '@/lib/api';
import { getUtmParams } from '@/lib/utm';
import { trackLead } from '@/lib/pixel';

const schema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(14, 'Telefone inválido'),
});

type FormData = z.infer<typeof schema>;

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function LeadForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const telefoneValue = watch('telefone') || '';

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setValue('telefone', formatted, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (loading) return;
      setLoading(true);
      setError('');

      try {
        const utms = getUtmParams();
        await createLead({ ...data, ...utms });
        trackLead({ nome: data.nome, email: data.email, telefone: data.telefone });
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Erro ao participar. Tente novamente.');
      } finally {
        setLoading(false);
      }
    },
    [loading],
  );

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">
          Participação confirmada!
        </h3>
        <p className="text-green-700">
          Enviamos seus números da sorte via WhatsApp. Verifique sua mensagem!
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 w-full max-w-md"
      noValidate
    >
      <div>
        <input
          {...register('nome')}
          type="text"
          placeholder="Seu nome completo"
          className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-800/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 outline-none transition text-white placeholder-gray-400"
        />
        {errors.nome && (
          <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
        )}
      </div>

      <div>
        <input
          {...register('email')}
          type="email"
          placeholder="Seu melhor e-mail"
          className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-800/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 outline-none transition text-white placeholder-gray-400"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <input
          type="tel"
          placeholder="(00) 00000-0000"
          value={telefoneValue}
          onChange={handlePhoneChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-800/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 outline-none transition text-white placeholder-gray-400"
        />
        {errors.telefone && (
          <p className="text-red-500 text-sm mt-1">
            {errors.telefone.message}
          </p>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Participando...
          </span>
        ) : (
          'QUERO PARTICIPAR GRÁTIS'
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Ao participar, você concorda com nosso{' '}
        <a href="/regulamento" className="underline hover:text-gray-600">
          regulamento
        </a>{' '}
        e{' '}
        <a href="/privacidade" className="underline hover:text-gray-600">
          política de privacidade
        </a>
        .
      </p>
    </form>
  );
}
