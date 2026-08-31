// src/pages/TermAcceptances.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function TermAcceptances({ termId, onBack }) {
  const navigate = useNavigate();
  
  const [acceptances, setAcceptances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [termInfo, setTermInfo] = useState(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    loadAcceptances();
  }, [termId, currentPage]);

  const loadAcceptances = async () => {
    setLoading(true);
    setError('');
    try {
      // 🔥 URL CORRETA: /api/v1/admin/terms/acceptances
      const url = '/api/v1/admin/terms/acceptances';
      
      const response = await api.get(url, {
        params: {
          term_id: termId || undefined,
          page: currentPage,
          per_page: perPage,
        }
      });
      
      const data = response.data;
      
      setAcceptances(data.data || []);
      setTotal(data.meta?.total || 0);
      setLastPage(data.meta?.last_page || 1);
      setPerPage(data.meta?.per_page || 10);
      
      // Se tiver termId, buscar informações do termo
      if (termId) {
        try {
          const termResponse = await api.get(`/api/v1/admin/terms/${termId}`);
          setTermInfo(termResponse.data);
        } catch (err) {
          console.error('Erro ao buscar termo:', err);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar aceitações:', err);
      
      // 🔥 Melhor tratamento de erro
      if (err.response?.status === 405) {
        setError('Erro 405: Método não permitido. Verifique a URL da requisição.');
      } else if (err.response?.status === 403) {
        setError('Você não tem permissão para visualizar estas informações.');
      } else if (err.response?.status === 404) {
        setError('Rota não encontrada. Verifique a configuração do servidor.');
      } else if (err.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
        // Opcional: redirecionar para login
        // navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Erro ao carregar usuários');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/admin/term-management');
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= lastPage) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#4D6BFE] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header com botão voltar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              👥 Usuários que aceitaram os termos
              {total > 0 && (
                <span className="text-sm font-normal text-slate-400">
                  ({total} usuário{total !== 1 ? 's' : ''})
                </span>
              )}
            </h1>
            {termInfo && (
              <p className="text-sm text-slate-400 mt-1">
                Termo v{termInfo.version} - {termInfo.is_active ? '⭐ Ativo' : '📌 Inativo'}
              </p>
            )}
            {!termInfo && (
              <p className="text-sm text-slate-400 mt-1">
                Visualizando todas as aceitações
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadAcceptances}
            className="px-3 py-2 bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 text-sm rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Atualizar
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-700/50 rounded-xl text-red-300 text-sm flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <span>{error}</span>
          <button 
            onClick={() => setError('')}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        {acceptances.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg text-slate-400 font-medium">Nenhum usuário aceitou os termos ainda</p>
            <p className="text-sm text-slate-500 mt-1">Aguardando aceitações dos usuários</p>
            {termInfo && (
              <p className="text-xs text-slate-600 mt-3">
                Termo v{termInfo.version} criado em {formatDate(termInfo.created_at)}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50 border-b border-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">
                      Versão
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                      Data de Aceitação
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {acceptances.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-700/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-slate-300 font-medium">
                            {item.user?.name || '—'}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {item.user?.is_admin && (
                              <span className="inline-block px-2 py-0.5 text-[10px] bg-purple-500/20 text-purple-400 rounded">
                                Admin
                              </span>
                            )}
                            {!item.user?.is_active && (
                              <span className="inline-block px-2 py-0.5 text-[10px] bg-red-500/20 text-red-400 rounded">
                                Inativo
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 hidden sm:table-cell">
                        {item.user?.email || '—'}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="px-2.5 py-1 text-xs bg-[#4D6BFE]/20 text-[#4D6BFE] rounded-full font-medium">
                          v{item.term?.version || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 hidden lg:table-cell">
                        {formatDate(item.accepted_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                          Aceito
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Footer com paginação */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-6 py-4 border-t border-slate-700/30">
              <div className="flex items-center gap-4">
                <p className="text-sm text-slate-400">
                  <span className="font-medium text-slate-300">{total}</span> usuário{total !== 1 ? 's' : ''}
                  {total > 0 && (
                    <span className="text-slate-500 ml-1">
                      (página {currentPage} de {lastPage})
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-[#4D6BFE]"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
              
              {lastPage > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-slate-700/30 hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-sm rounded-lg transition-colors"
                  >
                    «
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-slate-700/30 hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-sm rounded-lg transition-colors"
                  >
                    ‹
                  </button>
                  
                  <span className="px-4 py-1.5 bg-[#4D6BFE]/20 text-[#4D6BFE] text-sm font-medium rounded-lg">
                    {currentPage}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className="px-3 py-1.5 bg-slate-700/30 hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-sm rounded-lg transition-colors"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => handlePageChange(lastPage)}
                    disabled={currentPage === lastPage}
                    className="px-3 py-1.5 bg-slate-700/30 hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-sm rounded-lg transition-colors"
                  >
                    »
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}