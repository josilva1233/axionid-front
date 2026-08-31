// src/components/dashboard/DashboardFilters.jsx
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

  // Helper para criar evento sintético
  const createChangeEvent = (name, value) => ({
    target: { name, value }
  });

  // ============ RENDERIZADORES ============
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
      primary: "bg-[#4D6BFE] hover:bg-[#3B5DE8] text-white shadow-lg shadow-[#4D6BFE]/20 hover:shadow-[#4D6BFE]/40",
      secondary: "bg-slate-700/50 hover:bg-slate-600/50 text-slate-300",
      danger: "bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/20",
      info: "bg-slate-700/50 hover:bg-slate-700 text-white",
    };

    return (
      <button
        onClick={onClick}
        className={`
          flex items-center justify-center gap-2
          w-full px-4 py-2.5
          rounded-lg font-semibold text-sm
          transition-all duration-200
          hover:-translate-y-0.5
          ${styles[variant] || styles.primary}
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
        `}
        disabled={actionLoading}
      >
        <span>{icon}</span>
        {label}
      </button>
    );
  };

  // ============ CONFIGURAÇÃO DAS ABAS ============
  const renderTabContent = () => {
    switch (activeTab) {
      case "users":
        if (role === "admin") {
          return (
            <>
              {renderInput("Buscar por Nome", "name", "Ex: João Silva...")}
              {renderSelect("Status Perfil", "completed", [
                { value: "1", label: "✅ Completo" },
                { value: "0", label: "⚠️ Incompleto" },
              ])}
              <div className="flex-1 min-w-[160px] max-w-[240px]">
                <button
                  onClick={onClear}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionLoading}
                >
                  <span>🧹</span>
                  Limpar
                </button>
              </div>
            </>
          );
        }
        return null;

      case "groups":
        return (
          <>
            {renderInput("Buscar Grupos/Membros", "name", "Digite o nome do grupo...")}
            <div className="flex-1 min-w-[160px] max-w-[240px]">
              {renderButton(onNewGroup, "➕", "Novo Grupo", "primary")}
            </div>
          </>
        );

      case "permissions":
        return (
          <>
            {renderInput("Buscar Permissão", "label", "Ex: Criar Usuários...")}
            <div className="flex-1 min-w-[160px] max-w-[240px]">
              {renderButton(onNewPermission, "➕", "Nova Permissão", "primary")}
            </div>
          </>
        );

      case "orders":
        return (
          <>
            {renderInput("Protocolo", "protocol", "Digite o protocolo...")}
            {renderInput("Título / Assunto", "title", "Digite o título...")}
            {renderInput("Solicitante", "applicant", "Digite o nome do solicitante...")}
            {renderSelect("Prioridade", "priority", [
              { value: "low", label: "Baixa" },
              { value: "medium", label: "Média" },
              { value: "high", label: "Alta" },
              { value: "urgent", label: "Urgente" },
            ])}
            {renderSelect("Status", "status", [
              { value: "open", label: "Aberto" },
              { value: "in_progress", label: "Em Andamento" },
              { value: "completed", label: "Fechado / Concluído" },
              { value: "canceled", label: "Cancelado" },
            ])}
            <div className="flex-1 min-w-[160px] max-w-[240px]">
              {renderButton(onNewOrder, "📢", "Abrir Chamado", "primary")}
            </div>
          </>
        );

      case "terms":
        return (
          <>
            {renderInput("Buscar por Versão", "version", "Ex: 1.0.0...")}
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
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={actionLoading}
              >
                <span>🧹</span>
                Limpar
              </button>
            </div>
          </>
        );

      case "audit":
        if (role === "admin") {
          return (
            <>
              {renderInput("Usuário / E-mail", "user", "Ex: joao@email.com...")}
              {renderInput("Endpoint / URL", "url", "Ex: /api/users...")}
              {renderSelect("Método HTTP", "method", [
                { value: "GET", label: "GET" },
                { value: "POST", label: "POST" },
                { value: "PUT", label: "PUT" },
                { value: "PATCH", label: "PATCH" },
                { value: "DELETE", label: "DELETE" },
              ])}
              {renderInput("Data Início", "start_date", "YYYY-MM-DD")}
              {renderInput("Data Fim", "end_date", "YYYY-MM-DD")}
              <div className="flex-1 min-w-[160px] max-w-[240px]">
                <button
                  onClick={onClear}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionLoading}
                >
                  <span>🧹</span>
                  Limpar
                </button>
              </div>
            </>
          );
        }
        return null;

      default:
        return null;
    }
  };

  // ============ RENDER ============
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6 transition-colors hover:border-[#4D6BFE]/30">
      <div className="flex flex-wrap gap-3 items-end">
        {isUserDetailView ? (
          <>
            <div className="flex-1 min-w-[160px] max-w-[240px]">
              {renderButton(onBack, "←", "Voltar", "secondary")}
            </div>
            <div className="flex-1 min-w-[160px] max-w-[240px]">
              {!isEditing ? (
                renderButton(() => setIsEditing(true), "✏️", "Editar", "primary")
              ) : (
                <div className="flex gap-2">
                  {renderButton(() => setIsEditing(false), "✕", "Cancelar", "secondary")}
                  {renderButton(handleSave, "💾", actionLoading ? "..." : "Salvar", "primary")}
                </div>
              )}
            </div>
          </>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
}