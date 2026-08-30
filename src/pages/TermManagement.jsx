// src/pages/TermManagement.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function TermManagement({ onViewUsers }) {
  const navigate = useNavigate();
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [acceptanceCounts, setAcceptanceCounts] = useState({});
  const [formData, setFormData] = useState({
    content: '',
    version: '',
    is_active: false,
  });

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/v1/admin/terms');
      const termsData = response.data.data || response.data;
      
      // Garantir que é um array
      const termsArray = Array.isArray(termsData) ? termsData : [];
      setTerms(termsArray);
      
      // Carregar contagem de aceitações para cada termo
      if (termsArray.length > 0) {
        await loadAcceptanceCounts(termsArray);
      }
    } catch (err) {
      console.error('Erro ao carregar termos:', err);
      setError(err.response?.data?.message || 'Erro ao carregar termos');
      setTerms([]);
    } finally {
      setLoading(false);
    }
  };

// src/pages/TermManagement.jsx
// No loadAcceptanceCounts

const loadAcceptanceCounts = async (termsList) => {
  try {
    const counts = {};
    await Promise.all(
      termsList.map(async (term) => {
        try {
          // 🔥 URL CORRETA
          const response = await api.get('/api/v1/admin/terms/acceptances', {
            params: { 
              term_id: term.id, 
              per_page: 1 
            }
          });
          counts[term.id] = response.data.meta?.total || 0;
        } catch (err) {
          console.error(`Erro ao carregar contagem para termo ${term.id}:`, err);
          counts[term.id] = 0;
        }
      })
    );
    setAcceptanceCounts(counts);
  } catch (err) {
    console.error('Erro ao carregar contagens:', err);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingTerm) {
        await api.put(`/api/v1/admin/terms/${editingTerm.id}`, formData);
      } else {
        await api.post('/api/v1/admin/terms', formData);
      }
      await loadTerms();
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar termo');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (term) => {
    setLoading(true);
    try {
      await api.patch(`/api/v1/admin/terms/${term.id}/toggle`);
      await loadTerms();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao alterar status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este termo?')) return;

    setLoading(true);
    try {
      await api.delete(`/api/v1/admin/terms/${id}`);
      await loadTerms();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir termo');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ content: '', version: '', is_active: false });
    setEditingTerm(null);
  };

  const handleViewUsers = (termId) => {
    if (onViewUsers) {
      onViewUsers(termId);
    } else {
      navigate(`/admin/term-acceptances?term_id=${termId}`);
    }
  };

  const handleViewAllUsers = () => {
    if (onViewUsers) {
      onViewUsers(null);
    } else {
      navigate('/admin/term-acceptances');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading && !showModal) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#4D6BFE] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Carregando termos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            📄 Termos de Uso
            {terms.length > 0 && (
              <span className="text-sm font-normal text-slate-400">
                ({terms.length} termo{terms.length !== 1 ? 's' : ''})
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gerencie os termos de uso da plataforma
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleViewAllUsers}
            className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="text-lg">👥</span>
            Ver Todos os Usuários
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-[#4D6BFE] hover:bg-[#3D5AFE] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Novo Termo
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

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        {terms.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg text-slate-400 font-medium">Nenhum termo cadastrado</p>
            <p className="text-sm text-slate-500 mt-1">Clique em "Novo Termo" para criar o primeiro.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-700/50 border-b border-slate-700/50">
                  <tr>
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Versão
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">
                      Criado por
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                      Data
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Usuários
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {terms.map((term) => {
                    const acceptanceCount = acceptanceCounts[term.id] || 0;
                    return (
                      <tr key={term.id} className="hover:bg-slate-700/30 transition-colors group">
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-300 font-medium">
                              v{term.version}
                            </span>
                            {term.is_active && (
                              <span className="inline-block px-2 py-0.5 text-[10px] bg-green-500/20 text-green-400 rounded-full font-medium">
                                Atual
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full ${
                            term.is_active 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              term.is_active ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                            }`}></span>
                            {term.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-slate-300 hidden md:table-cell">
                          {term.creator?.name || '—'}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-slate-400 hidden lg:table-cell">
                          {formatDate(term.created_at)}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <button
                            onClick={() => handleViewUsers(term.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4D6BFE]/10 hover:bg-[#4D6BFE]/20 text-[#4D6BFE] text-xs rounded-lg transition-colors group"
                          >
                            <span className="font-medium">{acceptanceCount}</span>
                            <span>usuário{acceptanceCount !== 1 ? 's' : ''}</span>
                            <svg 
                              className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              onClick={() => handleViewUsers(term.id)}
                              className="px-2.5 py-1 text-xs bg-[#4D6BFE]/20 text-[#4D6BFE] hover:bg-[#4D6BFE]/30 rounded transition-colors flex items-center gap-1"
                              title="Ver usuários que aceitaram"
                            >
                              <span className="text-sm">👥</span>
                              Ver
                            </button>
                            <button
                              onClick={() => handleToggleStatus(term)}
                              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                                term.is_active
                                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              }`}
                            >
                              {term.is_active ? 'Desativar' : 'Ativar'}
                            </button>
                            <button
                              onClick={() => {
                                setEditingTerm(term);
                                setFormData({
                                  content: term.content,
                                  version: term.version,
                                  is_active: term.is_active,
                                });
                                setShowModal(true);
                              }}
                              className="px-2.5 py-1 text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(term.id)}
                              className="px-2.5 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              disabled={acceptanceCount > 0}
                              title={acceptanceCount > 0 ? 'Não é possível excluir um termo que já foi aceito' : ''}
                            >
                              Excluir
                            </button>
                          </div>
                          {acceptanceCount > 0 && (
                            <div className="text-[10px] text-slate-500 mt-1">
                              ⚠️ {acceptanceCount} usuário{acceptanceCount !== 1 ? 's' : ''} aceitaram
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal de criação/edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingTerm ? '✏️ Editar Termo' : '📄 Novo Termo de Uso'}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-slate-400 hover:text-white text-xl transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Versão *
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-[#4D6BFE] focus:ring-1 focus:ring-[#4D6BFE]"
                  placeholder="Ex: 1.0.0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Conteúdo *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-[#4D6BFE] focus:ring-1 focus:ring-[#4D6BFE] h-64 resize-y"
                  placeholder="Digite os termos de uso..."
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.content.length} caracteres
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700/50 text-[#4D6BFE] focus:ring-[#4D6BFE] focus:ring-offset-0"
                />
                <label htmlFor="is_active" className="text-sm text-slate-300">
                  Ativar este termo imediatamente
                </label>
              </div>

              {formData.is_active && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-xs text-green-400">
                    ✅ Ao ativar este termo, todos os outros serão desativados automaticamente.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-[#4D6BFE] hover:bg-[#3D5AFE] text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Salvando...' : '💾 Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 font-medium text-sm rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}