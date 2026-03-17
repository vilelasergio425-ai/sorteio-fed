'use client';

import { useEffect, useState } from 'react';
import { getOverview } from '@/lib/api';

interface Overview {
  totalLeads: number;
  leadsToday: number;
  totalConfirmed: number;
  conversionRate: number;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOverview()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-4">Overview</h1>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 font-semibold mb-2">
            Erro ao conectar com o backend
          </p>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>1. Verifique se o backend está rodando (<code className="text-white">cd backend && npm run start:dev</code>)</li>
            <li>2. Verifique se o MySQL está ativo e o banco <code className="text-white">sorteio</code> existe</li>
            <li>3. Verifique se a <code className="text-white">NEXT_PUBLIC_ADMIN_API_KEY</code> no <code className="text-white">.env.local</code> bate com a <code className="text-white">ADMIN_API_KEY</code> do backend</li>
          </ul>
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'Total de Leads', value: data.totalLeads, color: 'blue' },
    { label: 'Leads Hoje', value: data.leadsToday, color: 'green' },
    { label: 'Confirmados', value: data.totalConfirmed, color: 'orange' },
    {
      label: 'Taxa de Conversão',
      value: `${data.conversionRate}%`,
      color: 'purple',
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    orange: 'bg-orange-500/20 text-orange-400',
    purple: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Overview</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
          >
            <p className="text-gray-400 text-sm mb-1">{card.label}</p>
            <p
              className={`text-3xl font-bold ${colorMap[card.color]?.split(' ')[1] || 'text-white'}`}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
