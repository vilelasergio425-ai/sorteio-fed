'use client';

import { useEffect, useState } from 'react';
import { getOverview } from '@/lib/api';

interface Overview {
  totalLeads: number;
  confirmados: number;
  leadsHoje: number;
  whatsappEnviados: number;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOverview()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-4">Overview</h1>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 font-semibold mb-2">
            Erro ao conectar com a API
          </p>
          <p className="text-gray-400 text-sm">
            Verifique se a <code className="text-white">NEXT_PUBLIC_ADMIN_API_KEY</code> está configurada corretamente.
          </p>
          {error && <p className="text-gray-500 text-xs mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  const taxa = data.totalLeads > 0 ? ((data.confirmados / data.totalLeads) * 100).toFixed(1) : '0';

  const cards = [
    { label: 'Total de Leads', value: data.totalLeads, color: 'blue' },
    { label: 'Leads Hoje', value: data.leadsHoje, color: 'green' },
    { label: 'Confirmados', value: data.confirmados, color: 'orange' },
    { label: 'WhatsApp Enviados', value: data.whatsappEnviados, color: 'purple' },
    { label: 'Taxa de Conversão', value: `${taxa}%`, color: 'cyan' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    orange: 'text-orange-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Overview</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
          >
            <p className="text-gray-400 text-sm mb-1">{card.label}</p>
            <p className={`text-3xl font-bold ${colorMap[card.color] || 'text-white'}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
