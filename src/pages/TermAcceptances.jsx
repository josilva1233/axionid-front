// src/pages/TermAcceptances.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function TermAcceptances({ termId, onBack, filters: externalFilters = {} }) {
  const navigate = useNavigate();
  
  const [acceptances, setAcceptances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [termInfo, setTermInfo] = useState(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filteredAcceptances, setFilteredAcceptances] = useState([]);

  useEffect(() => {
    loadAcceptances();
  }, [termId, currentPage, perPage]);

    useEffect(() => {
    let filtered = [...acceptances];

    // Filtro por Nome ou E-mail do usuário
    if (externalFilters.user) {
      const term = externalFilters.user.toLowerCase();
      filtered = filtered.filter(item => 
        item.user?.name?.toLowerCase().includes(term) ||
        item.user?.email?.toLowerCase().includes(term)
      );
    }
        // Filtro por Data Início
    if (externalFilters.start_date) {
      const start = new Date(externalFilters.start_date).setHours(0,0,0,0);
      filtered = filtered.filter(item => new Date(item.accepted_at).getTime() >= start);
    }

    // Filtro por Data Fim
    if (externalFilters.end_date) {
      const end = new Date(externalFilters.end_date).setHours(23,59,59,999);
      filtered = filtered.filter(item => new Date(item.accepted_at).getTime() <= end);
    }

    setFilteredAcceptances(filtered);
  }, [acceptances, externalFilters]);


  const loadAcceptances = async () => {
    setLoading(true);
    setError('');
    try {
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
      
      if (err.response?.status === 405) {
        setError('Erro 405: Método não permitido. Verifique a URL da requisição.');
      } else if (err.response?.status === 403) {
        setError('Você não tem permissão para visualizar estas informações.');
      } else if (err.response?.status === 404) {
        setError('Rota não encontrada. Verifique a configuração do servidor.');
      } else if (err.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
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
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" style={{ animationDelay: '150ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-semibold rounded-lg transition-all hover:-translate-y-0.5"
          >
            ← Voltar
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
        <button
          onClick={loadAcceptances}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-semibold rounded-lg transition-all hover:-translate-y-0.5"
        >
          🔄 Atualizar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
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
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden transition-colors hover:border-blue-500/30">
        {acceptances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <span className="text-5xl mb-4 opacity-60">📭</span>
            <p className="text-sm">Nenhum usuário aceitou os termos ainda.</p>
            {termInfo && (
              <p className="text-xs text-slate-600 mt-2">
                Termo v{termInfo.version} criado em {formatDate(termInfo.created_at)}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-800/80 sticky top-0 z-10">
                  <tr>
                    <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap">
                      Usuário
                    </th>
                    <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap hidden sm:table-cell">
                      Email
                    </th>
                    <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap hidden md:table-cell">
                      Versão
                    </th>
                    <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap hidden lg:table-cell">
                      Data de Aceitação
                    </th>
                    <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAcceptances.map((item) => (
                    <tr key={item.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-all">
                      <td className="px-[18px] py-3.5 align-middle">
                        <div>
                          <span className="text-slate-300 block">{item.user?.name || '—'}</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {item.user?.is_admin && (
                              <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-full">
                                Admin
                              </span>
                            )}
                            {!item.user?.is_active && (
                              <span className="text-[10px] font-semibold text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full">
                                Inativo
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-[18px] py-3.5 align-middle text-slate-400 hidden sm:table-cell">
                        {item.user?.email || '—'}
                      </td>
                      <td className="px-[18px] py-3.5 align-middle hidden md:table-cell">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                          v{item.term?.version || '—'}
                        </span>
                      </td>
                      <td className="px-[18px] py-3.5 align-middle text-slate-400 hidden lg:table-cell">
                        {formatDate(item.accepted_at)}
                      </td>
                      <td className="px-[18px] py-3.5 align-middle">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-6 py-4 border-t border-slate-700/50 bg-slate-800/30">
              <div className="flex items-center gap-4">
                <p className="text-sm text-slate-400">
                  <span className="font-semibold text-slate-300">{total}</span> usuário{total !== 1 ? 's' : ''}
                  {total > 0 && (
                    <span className="text-slate-500 ml-1">
                      (página {currentPage} de {lastPage})
                    </span>
                  )}
                </p>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              
              {lastPage > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 text-sm rounded-lg transition-all"
                  >
                    «
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 text-sm rounded-lg transition-all"
                  >
                    ‹
                  </button>
                  
                  <span className="px-4 py-1.5 bg-blue-500/20 text-blue-400 text-sm font-semibold rounded-lg">
                    {currentPage}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 text-sm rounded-lg transition-all"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => handlePageChange(lastPage)}
                    disabled={currentPage === lastPage}
                    className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 text-sm rounded-lg transition-all"
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