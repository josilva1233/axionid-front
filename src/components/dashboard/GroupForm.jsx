import { useState } from "react";

export default function GroupForm({ onSave, onCancel, loading, isDark = false }) {
  const [name, setName] = useState("");

  // ============ CLASSES DE TEMA ============
  const bgCard = isDark 
    ? 'bg-slate-800/50 border-slate-700/50' 
    : 'bg-white/80 border-gray-200';
  const textHeading = isDark ? 'text-white' : 'text-gray-800';
  const textLabel = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgInput = isDark 
    ? 'bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder-slate-500' 
    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400';
  const focusRing = 'focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50';
  const btnSubmit = 'bg-blue-600 hover:bg-blue-500 text-white';
  const btnCancel = isDark 
    ? 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300' 
    : 'bg-gray-200 hover:bg-gray-300 text-gray-700';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("O nome do grupo é obrigatório.");
      return;
    }
    onSave({ name });
  };

  return (
    <div className={`border rounded-xl p-6 mb-6 transition-colors hover:border-blue-500/30 ${bgCard}`}>
      <h4 className={`text-sm font-bold flex items-center gap-2 mb-4 ${textHeading}`}>
        ➕ Criar Novo Grupo
      </h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide mb-2 ${textLabel}`}>
            <span className="text-blue-500">●</span>
            Nome do Grupo <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            className={`w-full px-3 py-2.5 ${bgInput} rounded-lg text-sm ${focusRing} transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            placeholder="Ex: Administradores, Financeiro..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 font-semibold rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none ${btnSubmit}`}
            disabled={loading || !name.trim()}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Salvando...
              </>
            ) : (
              <>
                ✅ Salvar Grupo
              </>
            )}
          </button>

          <button
            type="button"
            className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 font-semibold rounded-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${btnCancel}`}
            onClick={onCancel}
            disabled={loading}
          >
            ❌ Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}