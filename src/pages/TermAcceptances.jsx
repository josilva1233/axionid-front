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
  const [filters, setFilters] = useState({
    user_name: '',
    email: '',
  });
  const [filteredAcceptances, setFilteredAcceptances] = useState([]);

  useEffect(() => {
    loadAcceptances();
  }, [termId, currentPage]);

  useEffect(() => {
    applyFilters();
  }, [acceptances, filters]);

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

  const applyFilters = () => {
    let filtered = [...acceptances];

    if (filters.user_name && filters.user_name.trim() !== '') {
      filtered = filtered.filter(item => 
        item.user?.name?.toLowerCase().includes(filters.user_name.toLowerCase().trim())
      );
    }

    if (filters.email && filters.email.trim() !== '') {
      filtered = filtered.filter(item => 
        item.user?.email?.toLowerCase().includes(filters.email.toLowerCase().trim())
      );
    }

    setFilteredAcceptances(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      user_name: '',
      email: '',
    });
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
    <div className="p-4 md:p-6">
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

      {/* Filtros Integrados via Componente Central ou Linha Única */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6 transition-colors hover:border-[#4D6BFE]/30">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px] max-w-[240px]">
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
              <span className="text-[#4D6BFE]">●</span>
              Nome do Usuário
            </label>
            <input
              type="text"
              name="user_name"
              value={filters.user_name}
              onChange={handleFilterChange}
              className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#4D6BFE]/50 focus:border-[#4D6BFE]/50 transition-all"
              placeholder="Buscar por nome..."
            />
          </div>

          <div className="flex-1 min-w-[160px] max-w-[240px]">
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
              <span className="text-[#4D6BFE]">●</span>
              Email
            </label>
            <input
              type="text"
              name="email"
              value={filters.email}
              onChange={handleFilterChange}
              className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#4D6BFE]/50 focus:border-[#4D6BFE]/50 transition-all"
              placeholder="Buscar por email..."
            />
          </div>

          <div className="flex-1 min-w-[160px] max-w-[240px]">
            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20"
            >
              <span>🧹</span>
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        {filteredAcceptances.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg text-slate-400 font-medium">
              {acceptances.length === 0 
                ? 'Nenhum usuário aceitou os termos ainda'
                : 'Nenhum usuário encontrado com os filtros aplicados'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50 border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Usuário</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">Versão</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden lg:table-cell">Data de Aceitação</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredAcceptances.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-300 font-medium">{item.user?.name || '—'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 hidden sm:table-cell">{item.user?.email || '—'}</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="px-2.5 py-1 text-xs bg-[#4D6BFE]/20 text-[#4D6BFE] rounded-full font-medium">
                        v{item.term?.version || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 hidden lg:table-cell">{formatDate(item.accepted_at)}</td>
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
        )}
      </div>
    </div>
  );
}