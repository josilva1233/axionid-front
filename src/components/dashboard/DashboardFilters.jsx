import React from "react";

export default function DashboardFilters({
  activeTab,
  role,
  filters,
  onFilterChange,
  onClear,
  onNewGroup,
  onNewPermission,
  onNewOrder,
  isEditing,
  onBack,
  setIsEditing,
  handleSave,
  actionLoading,
  user,
  terms,                
  onNewTerm,            
  onViewAllUsers,       
  isViewingAllUsers,    
}) {
  const isUserDetailView = !!user || isViewingAllUsers;

  // ============ RENDERIZADORES ============
  const renderInput = (label, name, placeholder = "") => (
    <div className="flex-1 min-w-[160px] max-w-[240px]">
      <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
        <span className="text-blue-500">●</span>
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={filters[name] || ""}
        onChange={(e) => {
          console.log(`🔍 Input ${name} alterado:`, e.target.value);
          onFilterChange(e);
        }}
        className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
        placeholder={placeholder}
      />
    </div>
  );

  const renderSelect = (label, name, options) => (
    <div className="flex-1 min-w-[160px] max-w-[240px]">
      <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
        <span className="text-blue-500">●</span>
        {label}
      </label>
      <select
        name={name}
        value={filters[name] || ""}
        onChange={(e) => {
          console.log(`🔍 Select ${name} alterado:`, e.target.value);
          onFilterChange(e);
        }}
        className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none"
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
      primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40",
      secondary: "bg-slate-700/50 hover:bg-slate-600/50 text-slate-300",
      danger: "bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/20",
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
        {renderInput("Data Início", "start_date", "YYYY-MM-DD")}
        {renderInput("Data Fim", "end_date", "YYYY-MM-DD")}
      </>
    ),
    terms: role === "admin" && !isUserDetailView && (
      <>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              📄 Termos de Uso
              {terms?.length > 0 && (
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
              onClick={onViewAllUsers}
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <span className="text-lg">👥</span>
              Gerenciar Termos
            </button>
            <button
              onClick={onNewTerm}
              className="px-4 py-2 bg-[#4D6BFE] hover:bg-[#3D5AFE] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              Novo Termo
            </button>
          </div>
        </div>
      </>
    ),
  };

  const hasConfig = tabConfigs[activeTab];

  // ============ RENDER ============
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6 transition-colors hover:border-blue-500/30">
      <div className="flex flex-wrap gap-3 items-end">
        
        {/* SE ESTIVER VISUALIZANDO USUÁRIOS (ou um usuário específico) */}
        {isUserDetailView ? (
          <>
            <div className="flex-1 min-w-[160px] max-w-[240px]">
              {renderButton(onBack, "←", "Voltar", "secondary")}
            </div>
            
            {/* SÓ MOSTRA O BOTÃO EDITAR SE FOR UM USUÁRIO ESPECÍFICO, NÃO NA LISTA DE ACEITES */}
            {!isViewingAllUsers && (
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
            )}
          </>
        ) : (
          <>
            {/* Renderiza o conteúdo da aba ativa */}
            {hasConfig}

            {/* Botão Limpar */}
            {!isUserDetailView && (
              <div className="flex-1 min-w-[160px] max-w-[240px]">
                <button
                  onClick={onClear}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20"
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