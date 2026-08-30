// src/pages/TermManagement.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function TermManagement() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [formData, setFormData] = useState({
    content: '',
    version: '',
    is_active: false,
  });

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      const response = await api.get('/api/v1/admin/terms');
      setTerms(response.data.data || response.data);
    } catch (err) {
      console.error('Erro ao carregar termos:', err);
      setError('Erro ao carregar termos');
    } finally {
      setLoading(false);
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
    try {
      await api.patch(`/api/v1/admin/terms/${term.id}/toggle`);
      await loadTerms();
    } catch (err) {
      setError('Erro ao alterar status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este termo?')) return;

    try {
      await api.delete(`/api/v1/admin/terms/${id}`);
      await loadTerms();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir termo');
    }
  };

  const resetForm = () => {
    setFormData({ content: '', version: '', is_active: false });
    setEditingTerm(null);
  };

  if (loading && !showModal) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#4D6BFE] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Termos de Uso</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-[#4D6BFE] hover:bg-[#3D5AFE] text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Novo Termo
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        {terms.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p className="text-lg">Nenhum termo cadastrado</p>
            <p className="text-sm mt-1">Clique em "Novo Termo" para criar o primeiro.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Versão</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">Criado por</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden lg:table-cell">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {terms.map((term) => (
                <tr key={term.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-300 font-medium">{term.version}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      term.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {term.is_active ? '✅ Ativo' : '❌ Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300 hidden md:table-cell">
                    {term.creator?.name || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 hidden lg:table-cell">
                    {new Date(term.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleToggleStatus(term)}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
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
                        className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(term.id)}
                        className="px-3 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingTerm ? 'Editar Termo' : 'Novo Termo de Uso'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Versão *</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-[#4D6BFE]"
                  placeholder="1.0.0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Conteúdo *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-[#4D6BFE] h-64"
                  placeholder="Digite os termos de uso..."
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700/50 text-[#4D6BFE]"
                />
                <label htmlFor="is_active" className="text-sm text-slate-300">
                  Ativar este termo imediatamente
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-[#4D6BFE] hover:bg-[#3D5AFE] text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 px-4 bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 font-medium text-sm rounded-lg transition-colors"
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