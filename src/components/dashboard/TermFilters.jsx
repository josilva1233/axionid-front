// src/components/dashboard/TermFilters.jsx
import React from 'react';

export default function TermFilters({
  filters,
  onFilterChange,
  onClear,
  onNewTerm,
  loading = false,
}) {
  const renderInput = (label, name, placeholder = "") => (
    <div className="flex-1 min-w-[160px] max-w-[240px]">
      <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
        <span className="text-[#4D6BFE]">●</span>
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={filters[name] || ""}
        onChange={onFilterChange}
        className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#4D6BFE]/50 focus:border-[#4D6BFE]/50 transition-all"
        placeholder={placeholder}
        disabled={loading}
      />
    </div>
  );

  const renderSelect = (label, name, options) => (
    <div className="flex-1 min-w-[160px] max-w-[240px]">
      <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
        <span className="text-[#4D6BFE]">●</span>
        {label}
      </label>
      <select
        name={name}
        value={filters[name] || ""}
        onChange={onFilterChange}
        className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4D6BFE]/50 focus:border-[#4D6BFE]/50 transition-all appearance-none"
        disabled={loading}
      >
        <option value="">Todos</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6 transition-colors hover:border-[#4D6BFE]/30">
      <div className="flex flex-wrap gap-3 items-end">
        {renderInput("Buscar por Versão", "version", "Ex: 1.0.0...")}
        
        {renderSelect("Status", "status", [
          { value: "active", label: "✅ Ativo" },
          { value: "inactive", label: "⛔ Inativo" },
        ])}

        {renderInput("Criado por", "creator", "Digite o nome...")}

        <div className="flex-1 min-w-[160px] max-w-[240px]">
          <button
            onClick={onNewTerm}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 bg-[#4D6BFE] hover:bg-[#3B5DE8] text-white shadow-lg shadow-[#4D6BFE]/20 hover:shadow-[#4D6BFE]/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            disabled={loading}
          >
            <span>➕</span>
            Novo Termo
          </button>
        </div>

        <div className="flex-1 min-w-[160px] max-w-[240px]">
          <button
            onClick={onClear}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            disabled={loading}
          >
            <span>🧹</span>
            Limpar
          </button>
        </div>
      </div>
    </div>
  );
}