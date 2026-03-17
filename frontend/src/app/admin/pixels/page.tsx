'use client';

import { useEffect, useState } from 'react';
import { getPixels, createPixel, updatePixel, deletePixel } from '@/lib/api';

interface Pixel {
  id: string;
  pixelId: string;
  nome: string;
  ativo: boolean;
  createdAt: string;
}

export default function AdminPixelsPage() {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPixelId, setNewPixelId] = useState('');
  const [newNome, setNewNome] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchPixels = () => {
    setLoading(true);
    getPixels()
      .then(setPixels)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPixels();
  }, []);

  const handleCreate = async () => {
    if (!newPixelId.trim() || !newNome.trim()) {
      setError('Preencha todos os campos');
      return;
    }

    setCreating(true);
    setError('');
    try {
      await createPixel({ pixelId: newPixelId.trim(), nome: newNome.trim() });
      setNewPixelId('');
      setNewNome('');
      fetchPixels();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (pixel: Pixel) => {
    try {
      await updatePixel(pixel.id, { ativo: !pixel.ativo });
      fetchPixels();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePixel(id);
      fetchPixels();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Meta Pixels</h1>

      <p className="text-gray-400 text-sm mb-6">
        Gerencie os pixels do Facebook/Meta que serão carregados automaticamente
        na landing page e na página de confirmação. Todos os pixels ativos
        recebem os eventos <strong className="text-white">Lead</strong> e{' '}
        <strong className="text-white">CompleteRegistration</strong> com os
        dados do participante.
      </p>

      {/* Add Pixel Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-4">Adicionar Pixel</h2>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="ID do Pixel (ex: 123456789012345)"
            value={newPixelId}
            onChange={(e) => setNewPixelId(e.target.value)}
            className="flex-1 min-w-[200px] bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Nome (ex: Pixel Principal)"
            value={newNome}
            onChange={(e) => setNewNome(e.target.value)}
            className="flex-1 min-w-[150px] bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
          >
            {creating ? 'Adicionando...' : 'Adicionar'}
          </button>
        </div>
        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}
      </div>

      {/* Pixels List */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 font-medium px-4 py-3">
                Nome
              </th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">
                Pixel ID
              </th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">
                Status
              </th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">
                Criado em
              </th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-8">
                  Carregando...
                </td>
              </tr>
            ) : pixels.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-8">
                  Nenhum pixel cadastrado. Adicione um acima.
                </td>
              </tr>
            ) : (
              pixels.map((pixel) => (
                <tr
                  key={pixel.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30"
                >
                  <td className="px-4 py-3 text-white font-medium">
                    {pixel.nome}
                  </td>
                  <td className="px-4 py-3 text-gray-300 font-mono text-xs">
                    {pixel.pixelId}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(pixel)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        pixel.ativo
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {pixel.ativo ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(pixel.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(pixel.id)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <h3 className="text-blue-400 font-semibold text-sm mb-2">
          Como funciona
        </h3>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>
            Todos os pixels <strong className="text-white">ativos</strong> são
            carregados automaticamente em todas as páginas.
          </li>
          <li>
            Evento <strong className="text-white">Lead</strong> é disparado
            quando o formulário é enviado, com nome, email e telefone.
          </li>
          <li>
            Evento{' '}
            <strong className="text-white">CompleteRegistration</strong> é
            disparado quando o participante acessa a página dos números.
          </li>
          <li>
            Você pode adicionar <strong className="text-white">múltiplos pixels</strong>{' '}
            (ex: pixel do cliente + pixel da agência).
          </li>
        </ul>
      </div>
    </div>
  );
}
