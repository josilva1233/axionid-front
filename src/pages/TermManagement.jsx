// src/pages/TermManagement.jsx
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import TermTable from '../components/dashboard/TermTable';

const TermManagement = forwardRef(({ onViewUsers, filters: externalFilters = {}, isDark = false }, ref) => {
  const navigate = useNavigate();
  const [terms, setTerms] = useState([]);
  const [filteredTerms, setFilteredTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [acceptanceCounts, setAcceptanceCounts] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  
  const [localFilters, setLocalFilters] = useState({
    version: '',
    status: '',
    creator: ''
  });

  const filters = { ...localFilters, ...externalFilters };

  useEffect(() => {
    if (externalFilters) {
      setLocalFilters(prev => ({
        ...prev,
        version: externalFilters.version ?? prev.version,
        status: externalFilters.status ?? prev.status,
        creator: externalFilters.creator ?? prev.creator,
      }));
    }
  }, [externalFilters]);

  useImperativeHandle(ref, () => ({
    openNewTermModal() {
      resetForm();
      setShowModal(true);
    },
    showAllUsers() {
      handleViewAllUsers();
    }
  }));

  const [formData, setFormData] = useState({
    content: '',
    version: '',
    is_active: false,
  });

  // 🔥 Ajuste do SweetAlert para tema
  const AxionAlert = Swal.mixin({
    background: isDark ? "#111214" : "#ffffff",
    color: isDark ? "#ffffff" : "#1f2937",
    confirmButtonColor: "#6366f1",
    cancelButtonColor: "#343a40",
    customClass: {
      popup: `border ${isDark ? 'border-slate-700' : 'border-gray-200'} rounded-xl`,
      confirmButton: "px-4 py-2 rounded-full font-bold mx-2 bg-indigo-500 hover:bg-indigo-400 transition-colors",
      cancelButton: "px-4 py-2 rounded-full font-bold mx-2 bg-slate-700 hover:bg-slate-600 transition-colors",
    },
  });

  // ============ CLASSES DE TEMA ============
  const bgCard = isDark 
    ? 'bg-slate-800/50 border-slate-700/50' 
    : 'bg-white/80 border-gray-200';
  const bgHeader = isDark 
    ? 'bg-slate-800/50' 
    : 'bg-gray-50';
  const bgInput = isDark 
    ? 'bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder-slate-500' 
    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400';
  const bgInputDisabled = isDark 
    ? 'bg-slate-800/30 border-slate-700/30 text-slate-500' 
    : 'bg-gray-100 border-gray-200 text-gray-500';
  const textHeading = isDark ? 'text-white' : 'text-gray-800';
  const textLabel = isDark ? 'text-slate-400' : 'text-gray-500';
  const textMuted = isDark ? 'text-slate-400' : 'text-gray-600';
  const textPlaceholder = isDark ? 'placeholder-slate-500' : 'placeholder-gray-400';
  const borderColor = isDark ? 'border-slate-700/50' : 'border-gray-200';
  const focusRing = 'focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50';
  const modalBg = isDark ? 'bg-slate-800/95 border-slate-700/50' : 'bg-white/95 border-gray-200';
  const overlayBg = isDark ? 'bg-black/70' : 'bg-black/50';

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
      // silencioso
    }
  };

  const applyFilters = () => {
    let filtered = [...terms];

    if (filters.version) {
      filtered = filtered.filter(term => 
        term.version?.toLowerCase().includes(filters.version.toLowerCase())
      );
    }

    if (filters.status && filters.status !== '') {
      const targetIsActive = filters.status === 'active' || filters.status === true || filters.status === '1';
      filtered = filtered.filter(term => {
        const termActive = Boolean(Number(term.is_active));
        return termActive === targetIsActive;
      });
    }

    if (filters.creator) {
      filtered = filtered.filter(term => 
        term.creator?.name?.toLowerCase().includes(filters.creator.toLowerCase())
      );
    }

    setFilteredTerms(filtered);
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
    setActionLoading(true);
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
        
        const confirmResult = await AxionAlert.fire({
          title: 'Criar Nova Versão?',
          html: `
            <p class="${isDark ? 'text-slate-300' : 'text-gray-600'}">Você está criando uma nova versão do termo.</p>
            <p class="mt-3">
              <strong class="${isDark ? 'text-white' : 'text-gray-800'}">Versão atual:</strong> <span class="text-blue-400">v${editingTerm.version}</span><br>
              <strong class="${isDark ? 'text-white' : 'text-gray-800'}">Nova versão:</strong> <span class="text-green-400">v${nextVersion}</span>
            </p>
            <p class="mt-3 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}">
              O termo atual será mantido como histórico.
            </p>
          `,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sim, criar nova versão',
          cancelButtonText: 'Cancelar',
        });
        
        if (!confirmResult.isConfirmed) {
          setActionLoading(false);
          return;
        }
        
        response = await api.post('/api/v1/admin/terms', newTermData);
        
        AxionAlert.fire({
          icon: 'success',
          title: 'Nova Versão Criada!',
          text: `Termo v${nextVersion} criado com sucesso.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        response = await api.post('/api/v1/admin/terms', formData);
        AxionAlert.fire({
          icon: 'success',
          title: 'Termo Criado!',
          text: `Termo v${formData.version} criado com sucesso.`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
      
      if (formData.is_active && !editingTerm) {
        const activateResult = await AxionAlert.fire({
          title: 'Ativar Termo?',
          text: 'Ao ativar este termo, todos os usuários precisarão aceitar novamente. Deseja continuar?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sim, ativar',
          cancelButtonText: 'Cancelar',
        });
        
        if (activateResult.isConfirmed) {
          const termId = response.data.term?.id || response.data.id;
          await api.patch(`/api/v1/admin/terms/${termId}/toggle`);
          AxionAlert.fire({
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
      AxionAlert.fire({
        icon: 'error',
        title: 'Erro!',
        text: err.response?.data?.message || 'Erro ao salvar termo',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (term) => {
    setActionLoading(true);
    try {
      await api.patch(`/api/v1/admin/terms/${term.id}/toggle`);
      
      if (!term.is_active) {
        const result = await AxionAlert.fire({
          title: 'Ativar Termo',
          text: 'Ao ativar este termo, todos os usuários precisarão aceitar novamente. Deseja continuar?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sim, ativar',
          cancelButtonText: 'Cancelar',
        });
        
        if (result.isConfirmed) {
          await loadTerms();
          AxionAlert.fire({
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
        AxionAlert.fire({
          icon: 'info',
          title: 'Termo Desativado',
          text: `O termo v${term.version} foi desativado.`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao alterar status');
      AxionAlert.fire({
        icon: 'error',
        title: 'Erro!',
        text: err.response?.data?.message || 'Erro ao alterar status',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await AxionAlert.fire({
      title: 'Excluir Termo?',
      text: 'Tem certeza que deseja excluir este termo? Esta ação não pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
    });
    
    if (!result.isConfirmed) return;

    setActionLoading(true);
    try {
      await api.delete(`/api/v1/admin/terms/${id}`);
      await loadTerms();
      AxionAlert.fire({
        icon: 'success',
        title: 'Excluído!',
        text: 'Termo removido com sucesso.',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir termo');
      AxionAlert.fire({
        icon: 'error',
        title: 'Erro!',
        text: err.response?.data?.message || 'Erro ao excluir termo',
      });
    } finally {
      setActionLoading(false);
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
    <div className="p-4 md:p-6">
      {/* Table */}
      <div className={`border rounded-xl overflow-hidden transition-colors hover:border-blue-500/30 ${bgCard}`}>
        <TermTable
          terms={filteredTerms}
          acceptanceCounts={acceptanceCounts}
          onViewUsers={handleViewUsers}
          onToggleStatus={handleToggleStatus}
          onEdit={handleEditTerm}
          onDelete={handleDelete}
          loading={loading}
          isDark={isDark}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div
            className={`fixed inset-0 ${overlayBg} backdrop-blur-sm z-[1050]`}
            onClick={() => { setShowModal(false); resetForm(); }}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[1060] p-4">
            <div className={`border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden ${modalBg}`}>
              {/* Header */}
              <div className={`flex items-center justify-between px-6 py-4 border-b ${borderColor} ${bgHeader}`}>
                <h3 className={`text-lg font-bold flex items-center gap-2 ${textHeading}`}>
                  {editingTerm ? '✏️ Criar Nova Versão' : '📄 Novo Termo de Uso'}
                </h3>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className={`${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
                {editingTerm && (
                  <div className={`flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm mb-4`}>
                    <span className="text-lg">ℹ️</span>
                    <span>
                      Baseado em <strong className={textHeading}>v{editingTerm.version}</strong> →{' '}
                      <strong className={textHeading}>v{getNextVersion(editingTerm.version)}</strong>
                    </span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide mb-2 ${textLabel}`}>
                      <span className="text-blue-500">●</span>
                      Versão {editingTerm && <span className="text-xs normal-case ${textMuted}">(automática)</span>}
                    </label>
                    <input
                      type="text"
                      value={editingTerm ? getNextVersion(editingTerm.version) : formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      className={`w-full px-3 py-2.5 ${bgInput} rounded-lg text-sm ${focusRing} transition-all disabled:opacity-50 disabled:cursor-not-allowed ${textPlaceholder}`}
                      placeholder="Ex: 1.0.0"
                      required
                      disabled={!!editingTerm}
                    />
                    {editingTerm && (
                      <small className={`block text-xs ${textMuted} mt-1`}>
                        🔒 A versão é gerada automaticamente ao editar um termo existente
                      </small>
                    )}
                  </div>

                  <div>
                    <label className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide mb-2 ${textLabel}`}>
                      <span className="text-blue-500">●</span>
                      Conteúdo <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className={`w-full px-3 py-2.5 ${bgInput} rounded-lg text-sm ${focusRing} transition-all resize-y h-64 ${textPlaceholder}`}
                      placeholder="Digite os termos de uso..."
                      required
                      disabled={actionLoading}
                    />
                    <small className={`block text-xs ${textMuted} mt-1`}>
                      {formData.content.length} caracteres
                    </small>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className={`w-4 h-4 rounded ${isDark ? 'border-slate-600 bg-slate-700/50' : 'border-gray-300 bg-white'} text-blue-500 focus:ring-blue-500 focus:ring-offset-0`}
                      disabled={actionLoading}
                    />
                    <label className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
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
                </form>
              </div>

              <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${borderColor} ${bgHeader}`}>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark 
                      ? 'text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-600/50' 
                      : 'text-gray-600 hover:text-gray-800 bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={actionLoading || !formData.content.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none flex items-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Salvando...
                    </>
                  ) : (
                    <>
                      {editingTerm ? '📝 Criar Nova Versão' : '💾 Salvar'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default TermManagement;