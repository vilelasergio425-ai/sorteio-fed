'use client';

import { useEffect, useState } from 'react';
import { getCampaigns } from '@/lib/api';

interface Adset {
  adset: string;
  leads: number;
  confirmed: number;
  conversionRate: number;
}

interface Campaign {
  campaign: string;
  leads: number;
  confirmed: number;
  conversionRate: number;
  adsets: Adset[];
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    getCampaigns()
      .then(setCampaigns)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (campaign: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(campaign)) {
        next.delete(campaign);
      } else {
        next.add(campaign);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Campanhas</h1>

      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <p className="text-gray-500">Nenhuma campanha encontrada.</p>
        ) : (
          campaigns.map((camp) => (
            <div
              key={camp.campaign}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
            >
              {/* Campaign Row */}
              <button
                onClick={() => toggleExpand(camp.campaign)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-800/30 transition"
              >
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 text-sm">
                    {expanded.has(camp.campaign) ? '▼' : '▶'}
                  </span>
                  <div className="text-left">
                    <p className="text-white font-semibold">{camp.campaign}</p>
                    <p className="text-gray-500 text-sm">
                      {camp.adsets.length} adset(s)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-sm">
                  <div className="text-right">
                    <p className="text-gray-500">Leads</p>
                    <p className="text-white font-semibold">{camp.leads}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Confirmados</p>
                    <p className="text-green-400 font-semibold">
                      {camp.confirmed}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Conversão</p>
                    <p className="text-orange-400 font-semibold">
                      {camp.conversionRate}%
                    </p>
                  </div>
                </div>
              </button>

              {/* Adsets */}
              {expanded.has(camp.campaign) && (
                <div className="border-t border-gray-800">
                  {camp.adsets.map((adset) => (
                    <div
                      key={adset.adset}
                      className="flex items-center justify-between px-6 py-3 pl-16 border-b border-gray-800/50 last:border-0"
                    >
                      <p className="text-gray-300 text-sm">{adset.adset}</p>
                      <div className="flex items-center gap-8 text-sm">
                        <div className="text-right">
                          <p className="text-white">{adset.leads}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400">{adset.confirmed}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-orange-400">
                            {adset.conversionRate}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
