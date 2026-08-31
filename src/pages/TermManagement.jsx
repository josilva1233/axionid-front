// src/pages/TermManagement.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import TermTable from '../components/dashboard/TermTable';
import DashboardFilters from '../components/dashboard/DashboardFilters'; 

export default function TermManagement({ onViewUsers }) {
  const navigate = useNavigate();
  const [terms, setTerms] = useState([]);
  const [filteredTerms, setFilteredTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [acceptanceCounts, setAcceptanceCounts] = useState({});
  const [filters, setFilters] = useState({
    version: '',
    status: '',
    creator: '',
  });
  const [formData, setFormData] = useState({
    content: '',
    version: '',
    is_active: false,
  });

  useEffect(() => {
    loadTerms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [terms, filters]);

  const loadTerms = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/v1/admin/terms');
      const termsData = response.data.data || response.data;
      const termsArray = Array.isArray(termsData) ? termsData : [];
      setTerms(termsArray);
      
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

  const loadAcceptanceCounts = async (termsList) => {
    try {
      const counts = {};
      await Promise.all(
        termsList.map(async (term) => {
          try {
            const response = await api.get('/api/v1/admin/terms/acceptances', {
              params: { term_id: term.id, per_page: 1 }
            });
            counts[term.id] = response.data.meta?.total || 0;
          } catch (err) {
            counts[term.id] = 0;
          }
        })
      );
      setAcceptanceCounts(counts);
    } catch (err) {
      console.error('Erro ao carregar contagens:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...terms];

    if (filters.version) {
      filtered = filtered.filter(term => 
        term.version.toLowerCase().includes(filters.version.toLowerCase())
      );
    }

    if (filters.status) {
      const isActive = filters.status === 'active';
      filtered = filtered.filter(term => term.is_active === isActive);
    }

    if (filters.creator) {
      filtered = filtered.filter(term => 
        term.creator?.name?.toLowerCase().includes(filters.creator.toLowerCase())
      );
    }

    setFilteredTerms(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      version: '',
      status: '',
      creator: '',
    });
  };

  const getNextVersion = (currentVersion) => {
    if (!currentVersion) return '1.0.0';
    
    const versionMatch = currentVersion.match(/(\d+)\.(\d+)\.(\d+)/);
    if (versionMatch) {
      const major = parseInt(versionMatch[1]);
      const minor = parseInt(versionMatch[2]);
      const patch = parseInt(versionMatch[3]);
      return `${major}.${minor}.${patch + 1}`;
    }
    
    const numMatch = currentVersion.match(/(\d+)/);
    if (numMatch) {
      const num = parseInt(numMatch[0]);
      return `${num + 1}`;
    }
    
    return `${currentVersion}.1`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      
      if (editingTerm) {
        const nextVersion = getNextVersion(editingTerm.version);
        const newTermData = {
          content: formData.content,
          version: nextVersion,
          is_active: false,
        };
        
        const confirmResult = await Swal.fire({
          title: 'Criar Nova Versão?',
          html: `
            <p>Você está criando uma nova versão do termo.</p>
            <p class="mt-2">
              <strong>Versão atual:</strong> v${editingTerm.version}<br>
              <strong>Nova versão:</strong> v${nextVersion}
            </p>
            <p class="mt-2 text-sm text-slate-400">
              O termo atual será mantido como histórico.
            </p>
          `,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sim, criar nova versão',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#4D6BFE',
          cancelButtonColor: '#dc3545',
        });
        
        if (!confirmResult.isConfirmed) {
          setLoading(false);
          return;
        }
        
        response = await api.post('/api/v1/admin/terms', newTermData);
        
        Swal.fire({
          icon: 'success',
          title: 'Nova Versão Criada!',
          text: `Termo v${nextVersion} criado com sucesso.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        response = await api.post('/api/v1/admin/terms', formData);
        Swal.fire({
          icon: 'success',
          title: 'Termo Criado!',
          text: `Termo v${formData.version} criado com sucesso.`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
      
      if (formData.is_active && !editingTerm) {
        const activateResult = await Swal.fire({
          title: 'Ativar Termo?',
          text: 'Ao ativar este termo, todos os usuários precisarão aceitar novamente. Deseja continuar?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sim, ativar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#4D6BFE',
          cancelButtonColor: '#dc3545',
        });
        
        if (activateResult.isConfirmed) {
          const termId = response.data.term?.id || response.data.id;
          await api.patch(`/api/v1/admin/terms/${termId}/toggle`);
          Swal.fire({
            icon: 'success',
            title: 'Termo Ativado!',
            text: 'Todos os usuários precisarão aceitar os novos termos.',
            timer: 2000,
            showConfirmButton: false,
          });
        }
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
      
      if (!term.is_active) {
        const result = await Swal.fire({
          title: 'Ativar Termo',
          text: 'Ao ativar este termo, todos os usuários precisarão aceitar novamente. Deseja continuar?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sim, ativar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#4D6BFE',
          cancelButtonColor: '#dc3545',
        });
        
        if (result.isConfirmed) {
          await loadTerms();
          Swal.fire({
            icon: 'success',
            title: 'Termo Ativado!',
            text: 'Todos os usuários precisarão aceitar os novos termos.',
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          await api.patch(`/api/v1/admin/terms/${term.id}/toggle`);
          await loadTerms();
        }
      } else {
        await loadTerms();
        Swal.fire({
          icon: 'info',
          title: 'Termo Desativado',
          text: `O termo v${term.version} foi desativado.`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao alterar status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Excluir Termo?',
      text: 'Tem certeza que deseja excluir este termo? Esta ação não pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#4D6BFE',
    });
    
    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await api.delete(`/api/v1/admin/terms/${id}`);
      await loadTerms();
      Swal.fire({
        icon: 'success',
        title: 'Excluído!',
        text: 'Termo removido com sucesso.',
        timer: 1500,
        showConfirmButton: false,
      });
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

  const handleEditTerm = (term) => {
    setEditingTerm(term);
    setFormData({
      content: term.content,
      version: '',
      is_active: false,
    });
    setShowModal(true);
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
      {/* Header com botões */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            📄 Termos de Uso
            {filteredTerms.length > 0 && (
              <span className="text-sm font-normal text-slate-400">
                ({filteredTerms.length} termo{filteredTerms.length !== 1 ? 's' : ''})
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

      {/* Filters */}
      <TermFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
        onNewTerm={() => {
          resetForm();
          setShowModal(true);
        }}
        loading={loading}
      />

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        <TermTable
          terms={filteredTerms}
          acceptanceCounts={acceptanceCounts}
          onViewUsers={handleViewUsers}
          onToggleStatus={handleToggleStatus}
          onEdit={handleEditTerm}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>

      {/* Modal de criação/edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingTerm ? (
                  <div>
                    <span>✏️ Criar Nova Versão</span>
                    <p className="text-sm text-slate-400 font-normal mt-1">
                      Baseado em v{editingTerm.version} → v{getNextVersion(editingTerm.version)}
                    </p>
                  </div>
                ) : (
                  '📄 Novo Termo de Uso'
                )}
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
                  Versão {editingTerm && <span className="text-xs text-slate-500">(automática)</span>}
                </label>
                <input
                  type="text"
                  value={editingTerm ? getNextVersion(editingTerm.version) : formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-[#4D6BFE] focus:ring-1 focus:ring-[#4D6BFE]"
                  placeholder="Ex: 1.0.0"
                  required
                  disabled={!!editingTerm}
                />
                {editingTerm && (
                  <p className="text-xs text-slate-500 mt-1">
                    🔒 A versão é gerada automaticamente ao editar um termo existente
                  </p>
                )}
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

              {editingTerm && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-xs text-blue-400">
                    💡 Você está criando uma nova versão do termo. O termo atual v{editingTerm.version} será mantido como histórico.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-[#4D6BFE] hover:bg-[#3D5AFE] text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Salvando...' : editingTerm ? '📝 Criar Nova Versão' : '💾 Salvar'}
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