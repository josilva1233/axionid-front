// src/pages/TermAcceptances.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function TermAcceptances({ 
  termId, 
  onBack, 
  filters: externalFilters = {},
  isDark = false // 🔥 NOVA PROP
}) {
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

  // ============ CLASSES DE TEMA ============
  const bgPage = isDark ? 'bg-slate-900' : 'bg-gray-100';
  const bgCard = isDark 
    ? 'bg-slate-800/50 border-slate-700/50' 
    : 'bg-white/80 border-gray-200';
  const bgHeader = isDark 
    ? 'bg-slate-800/80 border-slate-700/50' 
    : 'bg-gray-100/80 border-gray-200';
  const bgFooter = isDark 
    ? 'bg-slate-800/30 border-slate-700/50' 
    : 'bg-gray-100/80 border-gray-200';
  const textHeading = isDark ? 'text-white' : 'text-gray-800';
  const textSub = isDark ? 'text-slate-400' : 'text-gray-500';
  const textMuted = isDark ? 'text-slate-500' : 'text-gray-400';
  const textBody = isDark ? 'text-slate-300' : 'text-gray-700';
  const borderColor = isDark ? 'border-slate-700/50' : 'border-gray-200';
  const borderRow = isDark 
    ? 'border-slate-700/30 hover:bg-slate-800/30' 
    : 'border-gray-100 hover:bg-gray-50';
  const btnBack = isDark 
    ? 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300' 
    : 'bg-gray-200 hover:bg-gray-300 text-gray-700';
  const btnRefresh = isDark 
    ? 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300' 
    : 'bg-gray-200 hover:bg-gray-300 text-gray-700';
  const btnPagination = isDark 
    ? 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 disabled:opacity-50' 
    : 'bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-50';
  const btnPageActive = isDark 
    ? 'bg-blue-500/20 text-blue-400' 
    : 'bg-blue-100 text-blue-700';
  const selectBg = isDark 
    ? 'bg-slate-800/50 border-slate-700/50 text-slate-200' 
    : 'bg-white border-gray-300 text-gray-800';
  const selectFocus = 'focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50';
  const badgeAdmin = isDark 
    ? 'text-purple-400 bg-purple-500/15' 
    : 'text-purple-700 bg-purple-100';
  const badgeInactive = isDark 
    ? 'text-red-400 bg-red-500/15' 
    : 'text-red-700 bg-red-100';
  const badgeVersion = isDark 
    ? 'bg-blue-500/20 text-blue-400' 
    : 'bg-blue-100 text-blue-700';
  const badgeStatus = isDark 
    ? 'bg-green-500/20 text-green-400' 
    : 'bg-green-100 text-green-700';
  const errorBg = isDark 
    ? 'bg-red-500/10 border-red-500/30 text-red-400' 
    : 'bg-red-50 border-red-200 text-red-600';
  const emptyText = isDark ? 'text-slate-500' : 'text-gray-500';
  const emptySub = isDark ? 'text-slate-600' : 'text-gray-400';
  const textTableHeader = isDark 
    ? 'text-slate-400 border-slate-700/50' 
    : 'text-gray-500 border-gray-200';

  useEffect(() => {
    loadAcceptances();
  }, [termId, currentPage, perPage]);

  useEffect(() => {
    let filtered = [...acceptances];

    if (externalFilters.user) {
      const term = externalFilters.user.toLowerCase();
      filtered = filtered.filter(item => 
        item.user?.name?.toLowerCase().includes(term) ||
        item.user?.email?.toLowerCase().includes(term)
      );
    }
    if (externalFilters.start_date) {
      const start = new Date(externalFilters.start_date).setHours(0,0,0,0);
      filtered = filtered.filter(item => new Date(item.accepted_at).getTime() >= start);
    }
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
          // silencioso
        }
      }
    } catch (err) {
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
          <div className={`w-12 h-12 border-4 ${isDark ? 'border-blue-500/20 border-t-blue-500' : 'border-blue-300/20 border-t-blue-600'} rounded-full animate-spin`}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-6 h-6 border-4 ${isDark ? 'border-blue-400/30 border-t-blue-400' : 'border-blue-500/30 border-t-blue-500'} rounded-full animate-spin`} style={{ animationDelay: '150ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgPage} p-6 rounded-xl`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 font-semibold rounded-lg transition-all hover:-translate-y-0.5 ${btnBack}`}
          >
            ← Voltar
          </button>
          <div>
            <h1 className={`text-2xl font-bold flex items-center gap-3 ${textHeading}`}>
              👥 Usuários que aceitaram os termos
              {total > 0 && (
                <span className={`text-sm font-normal ${textSub}`}>
                  ({total} usuário{total !== 1 ? 's' : ''})
                </span>
              )}
            </h1>
            {termInfo && (
              <p className={`text-sm ${textSub} mt-1`}>
                Termo v{termInfo.version} - {termInfo.is_active ? '⭐ Ativo' : '📌 Inativo'}
              </p>
            )}
            {!termInfo && (
              <p className={`text-sm ${textSub} mt-1`}>
                Visualizando todas as aceitações
              </p>
            )}
          </div>
        </div>
        <button
          onClick={loadAcceptances}
          className={`inline-flex items-center gap-2 px-6 py-2.5 font-semibold rounded-lg transition-all hover:-translate-y-0.5 ${btnRefresh}`}
        >
          🔄 Atualizar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className={`mb-4 p-4 border rounded-xl text-sm flex items-center gap-2 ${errorBg}`}>
          <span className="text-lg">⚠️</span>
          <span>{error}</span>
          <button 
            onClick={() => setError('')}
            className="ml-auto hover:opacity-70"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabela */}
      <div className={`border rounded-xl overflow-hidden transition-colors hover:border-blue-500/30 ${bgCard}`}>
        {acceptances.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-12 ${emptyText}`}>
            <span className="text-5xl mb-4 opacity-60">📭</span>
            <p className="text-sm">Nenhum usuário aceitou os termos ainda.</p>
            {termInfo && (
              <p className={`text-xs ${emptySub} mt-2`}>
                Termo v{termInfo.version} criado em {formatDate(termInfo.created_at)}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className={`sticky top-0 z-10 ${bgHeader}`}>
                  <tr>
                    <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap ${textTableHeader}`}>
                      Usuário
                    </th>
                    <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap hidden sm:table-cell ${textTableHeader}`}>
                      Email
                    </th>
                    <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap hidden md:table-cell ${textTableHeader}`}>
                      Versão
                    </th>
                    <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap hidden lg:table-cell ${textTableHeader}`}>
                      Data de Aceitação
                    </th>
                    <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap ${textTableHeader}`}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAcceptances.map((item) => (
                    <tr key={item.id} className={`border-b transition-all ${borderRow}`}>
                      <td className="px-[18px] py-3.5 align-middle">
                        <div>
                          <span className={`block ${textBody}`}>{item.user?.name || '—'}</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {item.user?.is_admin && (
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeAdmin}`}>
                                Admin
                              </span>
                            )}
                            {!item.user?.is_active && (
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeInactive}`}>
                                Inativo
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={`px-[18px] py-3.5 align-middle ${textSub} hidden sm:table-cell`}>
                        {item.user?.email || '—'}
                      </td>
                      <td className="px-[18px] py-3.5 align-middle hidden md:table-cell">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${badgeVersion}`}>
                          v{item.term?.version || '—'}
                        </span>
                      </td>
                      <td className={`px-[18px] py-3.5 align-middle ${textSub} hidden lg:table-cell`}>
                        {formatDate(item.accepted_at)}
                      </td>
                      <td className="px-[18px] py-3.5 align-middle">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badgeStatus}`}>
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
            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-6 py-4 border-t ${bgFooter}`}>
              <div className="flex items-center gap-4">
                <p className={`text-sm ${textSub}`}>
                  <span className={`font-semibold ${textHeading}`}>{total}</span> usuário{total !== 1 ? 's' : ''}
                  {total > 0 && (
                    <span className={`ml-1 ${textMuted}`}>
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
                  className={`px-3 py-2 ${selectBg} rounded-lg text-sm ${selectFocus} transition-all appearance-none`}
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
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${btnPagination}`}
                  >
                    «
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${btnPagination}`}
                  >
                    ‹
                  </button>
                  
                  <span className={`px-4 py-1.5 text-sm font-semibold rounded-lg ${btnPageActive}`}>
                    {currentPage}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${btnPagination}`}
                  >
                    ›
                  </button>
                  <button
                    onClick={() => handlePageChange(lastPage)}
                    disabled={currentPage === lastPage}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${btnPagination}`}
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