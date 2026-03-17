'use client';

import { useEffect, useState } from 'react';
import { getLeads, getLeadDetail } from '@/lib/api';

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  confirmado: boolean;
  createdAt: string;
  utms: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
  } | null;
  numbers: { numero: number }[];
  whatsappLogs: {
    id: string;
    status: string;
    createdAt: string;
  }[];
}

interface LeadsResponse {
  data: Lead[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState({
    date: '',
    utm_source: '',
    confirmado: '',
    page: '1',
  });

  const fetchLeads = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (filters.date) params.date = filters.date;
    if (filters.utm_source) params.utm_source = filters.utm_source;
    if (filters.confirmado) params.confirmado = filters.confirmado;
    params.page = filters.page;

    getLeads(params)
      .then(setLeads)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeads();
  }, [filters.page]);

  const openDetail = async (id: string) => {
    const detail = await getLeadDetail(id);
    setSelectedLead(detail);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Leads</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="UTM Source"
          value={filters.utm_source}
          onChange={(e) =>
            setFilters({ ...filters, utm_source: e.target.value })
          }
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
        />
        <select
          value={filters.confirmado}
          onChange={(e) =>
            setFilters({ ...filters, confirmado: e.target.value })
          }
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          <option value="true">Confirmados</option>
          <option value="false">Não confirmados</option>
        </select>
        <button
          onClick={fetchLeads}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Filtrar
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 font-medium px-4 py-3">
                  Nome
                </th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">
                  Telefone
                </th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">
                  Data
                </th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">
                  Confirmado
                </th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">
                  UTM Source
                </th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-8">
                    Carregando...
                  </td>
                </tr>
              ) : (
                leads?.data.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30"
                  >
                    <td className="px-4 py-3 text-white">{lead.nome}</td>
                    <td className="px-4 py-3 text-gray-300">{lead.telefone}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          lead.confirmado
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {lead.confirmado ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {lead.utms?.utmSource || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDetail(lead.id)}
                        className="text-orange-400 hover:text-orange-300 text-sm font-medium"
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {leads && leads.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <p className="text-gray-500 text-sm">
              {leads.total} leads - Página {leads.page} de {leads.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setFilters({
                    ...filters,
                    page: String(Math.max(1, leads.page - 1)),
                  })
                }
                disabled={leads.page <= 1}
                className="px-3 py-1 bg-gray-800 text-white rounded text-sm disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() =>
                  setFilters({
                    ...filters,
                    page: String(Math.min(leads.totalPages, leads.page + 1)),
                  })
                }
                disabled={leads.page >= leads.totalPages}
                className="px-3 py-1 bg-gray-800 text-white rounded text-sm disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {selectedLead.nome}
              </h2>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs">Email</p>
                  <p className="text-white text-sm">{selectedLead.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Telefone</p>
                  <p className="text-white text-sm">{selectedLead.telefone}</p>
                </div>
              </div>

              {/* UTMs */}
              {selectedLead.utms && (
                <div>
                  <h3 className="text-white font-semibold text-sm mb-2">
                    UTMs
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(selectedLead.utms)
                      .filter(([key]) => key.startsWith('utm'))
                      .map(([key, val]) => (
                        <div key={key}>
                          <span className="text-gray-500">{key}: </span>
                          <span className="text-gray-300">{val || '-'}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Numbers */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-2">
                  Números ({selectedLead.numbers.length})
                </h3>
                <div className="flex flex-wrap gap-1">
                  {selectedLead.numbers.map((n, i) => (
                    <span
                      key={i}
                      className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded"
                    >
                      {String(n.numero).padStart(5, '0')}
                    </span>
                  ))}
                </div>
              </div>

              {/* WhatsApp Logs */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-2">
                  Logs WhatsApp
                </h3>
                {selectedLead.whatsappLogs.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhum log</p>
                ) : (
                  <div className="space-y-2">
                    {selectedLead.whatsappLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            log.status === 'sent'
                              ? 'bg-green-500/20 text-green-400'
                              : log.status === 'error'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {log.status}
                        </span>
                        <span className="text-gray-400">
                          {new Date(log.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
