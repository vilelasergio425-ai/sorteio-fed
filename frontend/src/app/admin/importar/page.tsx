'use client';

import { useState, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || '';

export default function ImportarPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    total: number;
    imported: number;
    duplicates: number;
    skipped: number;
    whatsappSent: number;
    whatsappFailed: number;
  } | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/api/admin/import-leads`, {
        method: 'POST',
        headers: { 'x-api-key': API_KEY },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Erro ao importar');
        return;
      }

      setResult(data);
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch {
      setError('Erro de conexao com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Importar Leads (CSV)</h1>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-2xl">
        <p className="text-gray-400 text-sm mb-4">
          Importe leads do Facebook Lead Forms. O CSV deve ter as colunas: <strong className="text-white">Nome</strong>, <strong className="text-white">Email</strong> e <strong className="text-white">Numero do WhatsApp</strong>.
          <br /><br />
          Leads com telefone ja cadastrado serao ignorados automaticamente. Cada lead importado recebe 100 numeros da sorte e uma mensagem via WhatsApp.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Arquivo CSV</label>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-500/20 file:text-orange-400 hover:file:bg-orange-500/30 cursor-pointer"
            />
          </div>

          {file && (
            <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300">
              Arquivo: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition"
          >
            {loading ? 'Importando... (aguarde, envia WhatsApp para cada lead)' : 'Importar e Enviar WhatsApp'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg space-y-2">
            <p className="text-green-400 font-semibold">Importacao concluida!</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-400">Total no CSV:</div>
              <div className="text-white font-semibold">{result.total}</div>
              <div className="text-gray-400">Importados:</div>
              <div className="text-green-400 font-semibold">{result.imported}</div>
              <div className="text-gray-400">Duplicados (ignorados):</div>
              <div className="text-yellow-400 font-semibold">{result.duplicates}</div>
              <div className="text-gray-400">Pulados (sem dados):</div>
              <div className="text-gray-500 font-semibold">{result.skipped}</div>
              <div className="text-gray-400">WhatsApp enviados:</div>
              <div className="text-green-400 font-semibold">{result.whatsappSent}</div>
              <div className="text-gray-400">WhatsApp com erro:</div>
              <div className="text-red-400 font-semibold">{result.whatsappFailed}</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-2xl">
        <h2 className="text-lg font-semibold text-white mb-3">Como funciona</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
          <li>Baixe o CSV de leads do Facebook Business Suite</li>
          <li>Selecione o arquivo aqui</li>
          <li>Clique em "Importar e Enviar WhatsApp"</li>
          <li>O sistema verifica duplicatas pelo numero de telefone</li>
          <li>Leads novos sao cadastrados no sorteio ativo</li>
          <li>Cada lead recebe 100 numeros da sorte</li>
          <li>Mensagem de WhatsApp e enviada automaticamente</li>
          <li>Delay de 1.5s entre envios para evitar rate limit</li>
        </ol>
      </div>
    </div>
  );
}
