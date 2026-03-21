'use client';

import { useEffect, useState } from 'react';
import { getSorteios, finalizarSorteio, envioMassa, envioTeste } from '@/lib/api';

interface Sorteio {
  id: string;
  numero: number;
  nome: string;
  numeroGanhador: number | null;
  ativo: boolean;
  createdAt: string;
  finalizadoAt: string | null;
  _count: { leads: number };
}

export default function SorteiosPage() {
  const [sorteios, setSorteios] = useState<Sorteio[]>([]);
  const [loading, setLoading] = useState(true);

  // Finalizar form
  const [numeroGanhador, setNumeroGanhador] = useState('');
  const [iniciarNovo, setIniciarNovo] = useState(true);
  const [finalizando, setFinalizando] = useState(false);
  const [finResult, setFinResult] = useState('');

  // Envio em massa form
  const [templateName, setTemplateName] = useState('');
  const [envioSorteioId, setEnvioSorteioId] = useState('');
  const [selectedParams, setSelectedParams] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [envioResult, setEnvioResult] = useState('');

  // Envio teste
  const [testPhone, setTestPhone] = useState('5562997021311');
  const [testando, setTestando] = useState(false);
  const [testResult, setTestResult] = useState('');

  const availableParams = [
    { key: 'nome', label: 'Nome', hint: 'Nome do lead' },
    { key: 'email', label: 'Email', hint: 'Email do lead' },
    { key: 'telefone', label: 'Telefone', hint: '(62) 99702-1311' },
    { key: 'url', label: 'URL dos numeros', hint: 'https://caminhopremiado.com/p/...' },
    { key: 'numero_sorteado', label: 'Numero sorteado', hint: '55638' },
  ];

  const addParam = (key: string) => {
    setSelectedParams([...selectedParams, key]);
  };

  const removeParam = (index: number) => {
    setSelectedParams(selectedParams.filter((_, i) => i !== index));
  };

  const moveParam = (index: number, direction: 'up' | 'down') => {
    const newParams = [...selectedParams];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newParams.length) return;
    [newParams[index], newParams[target]] = [newParams[target], newParams[index]];
    setSelectedParams(newParams);
  };

  const fetchSorteios = () => {
    setLoading(true);
    getSorteios()
      .then(setSorteios)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSorteios();
  }, []);

  const sorteioAtivo = sorteios.find((s) => s.ativo);

  const handleFinalizar = async () => {
    if (!sorteioAtivo) return;
    if (!numeroGanhador) {
      setFinResult('Informe o numero ganhador');
      return;
    }

    const num = parseInt(numeroGanhador);
    if (isNaN(num) || num < 0 || num > 99999) {
      setFinResult('Numero deve ser entre 0 e 99999');
      return;
    }

    setFinalizando(true);
    setFinResult('');

    try {
      const result = await finalizarSorteio(sorteioAtivo.id, {
        numeroGanhador: num,
        iniciarNovo,
      });
      setFinResult(
        `Sorteio finalizado! ${result.leadsAtualizados} leads atualizados com o numero ${String(num).padStart(5, '0')}.${
          result.novoSorteio ? ` Novo sorteio "${result.novoSorteio.nome}" criado.` : ''
        }`,
      );
      setNumeroGanhador('');
      fetchSorteios();
    } catch (err: any) {
      setFinResult(`Erro: ${err.message}`);
    } finally {
      setFinalizando(false);
    }
  };

  const handleEnvioTeste = async () => {
    if (!envioSorteioId || !templateName || selectedParams.length === 0) {
      setTestResult('Configure o sorteio, template e parametros primeiro');
      return;
    }
    if (!testPhone) {
      setTestResult('Informe o numero de teste');
      return;
    }

    setTestando(true);
    setTestResult('Enviando teste...');

    try {
      const result = await envioTeste(envioSorteioId, templateName, selectedParams, testPhone);
      if (result.status === 'sent') {
        setTestResult('Teste enviado com sucesso! Confira no WhatsApp.');
      } else {
        setTestResult(`Falha no teste: ${JSON.stringify(result.response?.error?.message || result.response)}`);
      }
    } catch (err: any) {
      setTestResult(`Erro: ${err.message}`);
    } finally {
      setTestando(false);
    }
  };

  const handleEnvioMassa = async () => {
    if (!envioSorteioId || !templateName) {
      setEnvioResult('Selecione um sorteio e informe o template');
      return;
    }
    if (selectedParams.length === 0) {
      setEnvioResult('Adicione pelo menos um parametro');
      return;
    }

    setEnviando(true);
    setEnvioResult('Enviando mensagens... Isso pode levar alguns minutos.');

    try {
      const result = await envioMassa(envioSorteioId, templateName, selectedParams);
      setEnvioResult(
        `Envio concluido! ${result.enviados} enviados, ${result.falhas} falhas, de ${result.total} total.`,
      );
    } catch (err: any) {
      setEnvioResult(`Erro: ${err.message}`);
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Sorteios</h1>

      {/* Sorteio Ativo */}
      {sorteioAtivo && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">
              ATIVO
            </span>
            <h2 className="text-xl font-bold text-white">{sorteioAtivo.nome}</h2>
            <span className="text-gray-400 text-sm">
              {sorteioAtivo._count.leads} leads
            </span>
          </div>

          {/* Finalizar */}
          <div className="bg-gray-900/50 rounded-lg p-4 space-y-4">
            <h3 className="text-white font-semibold text-sm">Finalizar Sorteio</h3>

            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-gray-400 text-xs block mb-1">
                  Numero ganhador (0-99999)
                </label>
                <input
                  type="number"
                  min="0"
                  max="99999"
                  value={numeroGanhador}
                  onChange={(e) => setNumeroGanhador(e.target.value)}
                  placeholder="Ex: 55638"
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm w-40"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={iniciarNovo}
                  onChange={(e) => setIniciarNovo(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-orange-500 focus:ring-orange-500"
                />
                Iniciar novo sorteio
              </label>

              <button
                onClick={handleFinalizar}
                disabled={finalizando}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                {finalizando ? 'Finalizando...' : 'Finalizar Sorteio'}
              </button>
            </div>

            {finResult && (
              <p
                className={`text-sm ${
                  finResult.startsWith('Erro') ? 'text-red-400' : 'text-green-400'
                }`}
              >
                {finResult}
              </p>
            )}

            <p className="text-gray-500 text-xs">
              Ao finalizar, o numero ganhador sera adicionado na lista de numeros de todos
              os {sorteioAtivo._count.leads} leads deste sorteio.
            </p>
          </div>
        </div>
      )}

      {!sorteioAtivo && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
          <p className="text-yellow-400 font-semibold">
            Nenhum sorteio ativo. Finalize o sorteio atual com &quot;Iniciar novo sorteio&quot;
            marcado para criar um novo.
          </p>
        </div>
      )}

      {/* Envio em Massa */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Envio em Massa (WhatsApp)</h2>

        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-gray-400 text-xs block mb-1">Sorteio</label>
            <select
              value={envioSorteioId}
              onChange={(e) => setEnvioSorteioId(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Selecione...</option>
              {sorteios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} ({s._count.leads} leads)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-xs block mb-1">
              Nome do Template WhatsApp
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Ex: sorteio_ganhador"
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm w-56"
            />
          </div>
        </div>

        {/* Parameter Selection */}
        <div>
          <label className="text-gray-400 text-xs block mb-2">
            Parametros do template (na ordem do template)
          </label>

          {selectedParams.length > 0 && (
            <div className="space-y-1 mb-3">
              {selectedParams.map((param, index) => {
                const info = availableParams.find((p) => p.key === param);
                return (
                  <div
                    key={`${param}-${index}`}
                    className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2"
                  >
                    <span className="text-orange-400 font-mono text-xs w-12">
                      {`{{${index + 1}}}`}
                    </span>
                    <span className="text-white text-sm">{info?.label || param}</span>
                    <span className="text-gray-500 text-xs flex-1">({info?.hint})</span>
                    <button
                      onClick={() => moveParam(index, 'up')}
                      disabled={index === 0}
                      className="text-gray-500 hover:text-white disabled:opacity-30 text-xs"
                    >
                      &#9650;
                    </button>
                    <button
                      onClick={() => moveParam(index, 'down')}
                      disabled={index === selectedParams.length - 1}
                      className="text-gray-500 hover:text-white disabled:opacity-30 text-xs"
                    >
                      &#9660;
                    </button>
                    <button
                      onClick={() => removeParam(index)}
                      className="text-red-400 hover:text-red-300 text-xs ml-1"
                    >
                      &#10005;
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {availableParams.map((param) => (
              <button
                key={param.key}
                onClick={() => addParam(param.key)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition border border-gray-700"
              >
                + {param.label}
              </button>
            ))}
          </div>
        </div>

        {/* Envio Teste */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
          <h3 className="text-white font-semibold text-sm">Enviar Teste</h3>
          <p className="text-gray-500 text-xs">
            Envia 1 mensagem de teste para o numero abaixo com dados de um lead aleatorio do sorteio.
          </p>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-gray-400 text-xs block mb-1">Numero de teste</label>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="5562997021311"
                className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm w-48"
              />
            </div>
            <button
              onClick={handleEnvioTeste}
              disabled={testando}
              className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              {testando ? 'Enviando...' : 'Enviar Teste'}
            </button>
          </div>
          {testResult && (
            <p
              className={`text-sm ${
                testResult.includes('sucesso') ? 'text-green-400' : 'text-yellow-400'
              }`}
            >
              {testResult}
            </p>
          )}
        </div>

        {/* Envio em massa button */}
        <button
          onClick={handleEnvioMassa}
          disabled={enviando}
          className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          {enviando ? 'Enviando...' : 'Enviar para Todos'}
        </button>

        {envioResult && (
          <p
            className={`text-sm ${
              envioResult.startsWith('Erro') ? 'text-red-400' : 'text-blue-400'
            }`}
          >
            {envioResult}
          </p>
        )}

        <p className="text-gray-500 text-xs">
          Adicione os parametros na mesma ordem do template da Meta. Max 30 caracteres por
          parametro. Delay de 1s entre envios.
        </p>
      </div>

      {/* Lista de Sorteios */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">Historico</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 font-medium px-4 py-3">#</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Nome</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Leads</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">
                Num. Ganhador
              </th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {sorteios.map((s) => (
              <tr
                key={s.id}
                className="border-b border-gray-800/50 hover:bg-gray-800/30"
              >
                <td className="px-4 py-3 text-gray-300">{s.numero}</td>
                <td className="px-4 py-3 text-white font-medium">{s.nome}</td>
                <td className="px-4 py-3 text-gray-300">{s._count.leads}</td>
                <td className="px-4 py-3 text-orange-400 font-mono">
                  {s.numeroGanhador !== null
                    ? String(s.numeroGanhador).padStart(5, '0')
                    : '-'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      s.ativo
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {s.ativo ? 'Ativo' : 'Finalizado'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                  {s.finalizadoAt && (
                    <span className="block text-gray-600">
                      Fin: {new Date(s.finalizadoAt).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
