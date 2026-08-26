// components/dashboard/PermissionForm.jsx
import { useState } from "react";

export default function PermissionForm({ loading, onCancel, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.label.trim()) {
      alert("Nome e label da permissão são obrigatórios.");
      return;
    }
    onSave(formData);
  };

  // ============ MODAL ============
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1050]"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[1060] p-4">
        <div className="bg-slate-800/95 border border-slate-700/50 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/50">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              🛡️ Nova Permissão
            </h3>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-200 transition-colors"
              disabled={loading}
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome (Slug) */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  📌 Nome (Slug) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="ex: users.create"
                  required
                  disabled={loading}
                />
                <small className="block text-xs text-slate-500 mt-1">
                  Identificador único da permissão (usado no código)
                </small>
              </div>

              {/* Label */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  📝 Label (Nome Exibido) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="ex: Criar Usuários"
                  required
                  disabled={loading}
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  📄 Descrição
                </label>
                <textarea
                  rows={2}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-y disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Descreva o que esta permissão concede..."
                  disabled={loading}
                />
              </div>

              {/* Ações */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/50">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Criando...
                    </>
                  ) : (
                    <>
                      🛡️ Criar Permissão
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}