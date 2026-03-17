'use client';

import { useEffect, useState } from 'react';
import { getWhatsappLogs } from '@/lib/api';

interface WhatsappLog {
  id: string;
  status: string;
  payload: Record<string, unknown>;
  response: Record<string, unknown> | null;
  createdAt: string;
  lead: {
    nome: string;
    telefone: string;
    email: string;
  };
}

export default function WhatsappLogsPage() {
  const [logs, setLogs] = useState<WhatsappLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    getWhatsappLogs()
      .then(setLogs)
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

  const statusColor: Record<string, string> = {
    sent: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400',
    error: 'bg-red-500/20 text-red-400',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">WhatsApp Logs</h1>

      {logs.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-400">Nenhum log de WhatsApp encontrado.</p>
          <p className="text-gray-500 text-sm mt-2">
            Os logs aparecem aqui quando o sistema tenta enviar mensagens via WhatsApp.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4"
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              >
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor[log.status] || 'bg-gray-500/20 text-gray-400'}`}>
                    {log.status.toUpperCase()}
                  </span>
                  <div>
                    <p className="text-white text-sm font-medium">{log.lead.nome}</p>
                    <p className="text-gray-500 text-xs">{log.lead.telefone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs">
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-gray-600 text-xs">{expandedId === log.id ? '▲' : '▼'}</p>
                </div>
              </div>

              {expandedId === log.id && (
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Payload enviado:</p>
                    <pre className="bg-gray-950 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>
                  {log.response && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Resposta da Meta:</p>
                      <pre className="bg-gray-950 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto">
                        {JSON.stringify(log.response, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
