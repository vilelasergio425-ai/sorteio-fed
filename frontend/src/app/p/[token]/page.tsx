'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getParticipant } from '@/lib/api';
import { trackCompleteRegistration } from '@/lib/pixel';
import NumbersGrid from '@/components/NumbersGrid';

interface ParticipantData {
  nome: string;
  email: string;
  telefone: string;
  numeros: number[];
  confirmado: boolean;
}

export default function ParticipantPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<ParticipantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const result = await getParticipant(token);
        setData(result);
        trackCompleteRegistration();
      } catch {
        setError('Participante não encontrado.');
      } finally {
        setLoading(false);
      }
    }

    if (token) load();
  }, [token]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full" />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2">Oops!</h1>
          <p className="text-gray-400">{error || 'Algo deu errado.'}</p>
          <a
            href="/"
            className="inline-block mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition"
          >
            Voltar ao início
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🎰</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
            Seus Números da Sorte
          </h1>
          <p className="text-gray-400">Boa sorte no sorteio!</p>
        </div>

        {/* Participant Info */}
        <div className="bg-gray-800/50 rounded-2xl p-6 mb-8 border border-gray-700/50">
          <h2 className="text-white font-semibold text-lg mb-4">
            Dados do Participante
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Nome</p>
              <p className="text-white font-medium">{data.nome}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p className="text-white font-medium">{data.email}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Telefone</p>
              <p className="text-white font-medium">{data.telefone}</p>
            </div>
          </div>
        </div>

        {/* Numbers */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-semibold text-lg">
              100 Números da Sorte
            </h2>
            <span className="bg-orange-500/20 text-orange-400 text-sm font-semibold px-3 py-1 rounded-full">
              0 - 99999
            </span>
          </div>
          <NumbersGrid numbers={data.numeros} />
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="text-orange-400 hover:text-orange-300 transition text-sm"
          >
            ← Voltar ao início
          </a>
        </div>
      </div>
    </main>
  );
}
