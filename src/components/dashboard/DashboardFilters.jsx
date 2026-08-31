import React from "react";

export default function DashboardFilters({
  activeTab,
  role,
  filters = {},
  onFilterChange,
  onClear,
  onNewGroup,
  onNewPermission,
  onNewOrder,
  onNewTerm,
  onViewAllUsers,
  isEditing,
  onBack,
  setIsEditing,
  handleSave,
  actionLoading,
  user
}) {
  const isUserDetailView = !!user;

  const createChangeEvent = (name, value) => ({
    target: { name, value }
  });

  const renderInput = (label, name, placeholder = "") => (
    <div className="flex-1 min-w-[160px] max-w-[240px]" key={name}>
      <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
        <span className="text-[#4D6BFE]">●</span>
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={filters[name] !== undefined && filters[name] !== null ? filters[name] : ""}
        onChange={(e) => onFilterChange(createChangeEvent(name, e.target.value))}
        className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#4D6BFE]/50 focus:border-[#4D6BFE]/50 transition-all"
        placeholder={placeholder}
        disabled={actionLoading}
      />
    </div>
  );

  const renderSelect = (label, name, options) => (
    <div className="flex-1 min-w-[160px] max-w-[240px]" key={name}>
      <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
        <span className="text-[#4D6BFE]">●</span>
        {label}
      </label>
      <select
        name={name}
        value={filters[name] !== undefined && filters[name] !== null ? filters[name] : ""}
        onChange={(e) => onFilterChange(createChangeEvent(name, e.target.value))}
        className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4D6BFE]/50 focus:border-[#4D6BFE]/50 transition-all appearance-none"
        disabled={actionLoading}
      >
        <option value="">Todos</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const renderButton = (onClick, icon, label, variant = "primary") => {
    const styles = {
      primary: "bg-[#4D6BFE] hover:bg-[#3B5DE8] text-white shadow-lg shadow-[#4D6BFE]/20",
      secondary: "bg-slate-700/50 hover:bg-slate-600/50 text-slate-300",
      info: "bg-slate-700/50 hover:bg-slate-700 text-white",
    };

    return (
      <button
        onClick={onClick}
        className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${styles[variant] || styles.primary} disabled:opacity-50`}
        disabled={actionLoading}
      >
        <span>{icon}</span>
        {label}
      </button>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "terms":
        return (
          <>
            {renderInput("Buscar por Versão", "version", "Ex: 1.0.0.....")}
            {renderSelect("Status", "status", [
              { value: "active", label: "✅ Ativo" },
              { value: "inactive", label: "⛔ Inativo" },
            ])}
            {renderInput("Criado por", "creator", "Digite o nome...")}
            <div className="flex-1 min-w-[160px] max-w-[240px]">
              {renderButton(onViewAllUsers, "👥", "Ver Todos os Usuários", "info")}
            </div>
            <div className="flex-1 min-w-[160px] max-w-[240px]">
              {renderButton(onNewTerm, "➕", "Novo Termo", "primary")}
            </div>
            <div className="flex-1 min-w-[160px] max-w-[240px]">
              <button
                onClick={onClear}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg font-semibold text-sm bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20"
                disabled={actionLoading}
              >
                <span>🧹</span> Limpar
              </button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
      <div className="flex flex-wrap gap-3 items-end">
        {isUserDetailView ? (
          <>
            <div className="flex-1 min-w-[160px] max-w-[240px]">
              {renderButton(onBack, "←", "Voltar", "secondary")}
            </div>
          </>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
}