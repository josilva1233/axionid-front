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
  onViewAllTerms,
  showTermAcceptances,
  isEditing,
  onBack,
  setIsEditing,
  handleSave,
  actionLoading,
  user,
  isDark = false,
}) {
  const isUserDetailView = !!user;

  // ============ CLASSES DE TEMA ============
  const containerBg = isDark
    ? 'bg-slate-800/50 border-slate-700/50'
    : 'bg-white/80 border-gray-200';
  const labelClass = isDark ? 'text-slate-400' : 'text-gray-500';
  const inputBg = isDark
    ? 'bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder-slate-500'
    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400';
  const selectBg = isDark
    ? 'bg-slate-800/50 border-slate-700/50 text-slate-200'
    : 'bg-white border-gray-300 text-gray-800';
  const focusRing = 'focus:ring-2 focus:ring-[#4D6BFE]/50 focus:border-[#4D6BFE]/50';

  // ============ RENDERIZADORES ============
  const renderInput = (label, name, placeholder = "", type = "text", min = "", max = "") => (
    <div className="flex-1 min-w-[160px] max-w-[240px]" key={name}>
      <label className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>
        <span className="text-[#4D6BFE]">●</span>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={filters[name] ?? ""}
        onChange={(e) => {
          if (onFilterChange) onFilterChange(e);
        }}
        className={`w-full px-3 py-2.5 ${inputBg} rounded-lg text-sm ${focusRing} transition-all`}
        placeholder={placeholder}
        disabled={actionLoading}
        min={min}
        max={max}
      />
    </div>
  );

  const renderSelect = (label, name, options) => (
    <div className="flex-1 min-w-[160px] max-w-[240px]" key={name}>
      <label className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide mb-2 ${labelClass}`}>
        <span className="text-[#4D6BFE]">●</span>
        {label}
      </label>
      <select
        name={name}
        value={filters[name] ?? ""}
        onChange={(e) => {
          if (onFilterChange) onFilterChange(e);
        }}
        className={`w-full px-3 py-2.5 ${selectBg} rounded-lg text-sm ${focusRing} transition-all appearance-none`}
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
      primary:
        "bg-[#4D6BFE] hover:bg-[#3B5DE8] text-white shadow-lg shadow-[#4D6BFE]/20 hover:shadow-[#4D6BFE]/40",
      secondary: isDark
        ? "bg-slate-700/50 hover:bg-slate-600/50 text-slate-300"
        : "bg-gray-200 hover:bg-gray-300 text-gray-700",
      danger: isDark
        ? "bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/20"
        : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
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
  const tabConfigs = {
    users: role === "admin" && (
      <>
          {renderInput("Buscar por Nome", "name", "Ex: João Silva...")}
          {renderInput("CPF/CNPJ", "cpf", "Ex: 123456...")}
          {renderInput("E-mail", "email", "Ex: joao@email.com...")}
          {renderSelect("Status Perfil", "completed", [
          { value: "1", label: "✅ Completo" },
          { value: "0", label: "⚠️ Incompleto" },
        ])}
      </>
    ),
    groups: (
      <>
        {renderInput("Buscar Grupos/Membros", "name", "Digite o nome do grupo...")}
        <div className="flex-1 min-w-[160px] max-w-[240px]">
          {renderButton(onNewGroup, "➕", "Novo Grupo", "primary")}
        </div>
      </>
    ),
    permissions: (
      <>
        {renderInput("Buscar Permissão", "label", "Ex: Criar Usuários...")}
        <div className="flex-1 min-w-[160px] max-w-[240px]">
          {renderButton(onNewPermission, "➕", "Nova Permissão", "primary")}
        </div>
      </>
    ),
    orders: (
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
    ),
    terms: showTermAcceptances ? (
      <>
        {renderInput("Buscar Usuário", "user", "Digite o nome...")}
        {renderInput("Data Início", "start_date", "", "date")}
        {renderInput("Data Fim", "end_date", "", "date")}
      </>
    ) : (
      <>
        {renderInput("Buscar por Versão", "version", "Ex: 1.0.0...")}
        {renderSelect("Status", "status", [
          { value: "active", label: "✅ Ativo" },
          { value: "inactive", label: "⛔ Inativo" },
        ])}
        {renderInput("Criado por", "creator", "Digite o nome...")}
        <div className="flex-1 min-w-[160px] max-w-[240px]">
          {renderButton(onNewTerm, "➕", "Novo Termo", "primary")}
        </div>
        <div className="flex-1 min-w-[160px] max-w-[240px]">
          {renderButton(onViewAllTerms, "👥", "Ver Todos", "secondary")}
        </div>
      </>
    ),
    audit: role === "admin" && (
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
        {renderInput("Data Início", "start_date", "", "date")}
        {renderInput("Data Fim", "end_date", "", "date")}
      </>
    ),
  };

  const hasConfig = tabConfigs[activeTab];

  // ============ RENDER ============
  return (
    <div className={`border rounded-xl p-6 mb-6 transition-colors hover:border-[#4D6BFE]/30 ${containerBg}`}>
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
          <>
            {hasConfig}
            {!isUserDetailView && (
              <div className="flex-1 min-w-[160px] max-w-[240px]">
                <button
                  onClick={onClear}
                  className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
                    isDark
                      ? 'bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20'
                      : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                  }`}
                  disabled={actionLoading}
                >
                  <span>🧹</span>
                  Limpar
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}