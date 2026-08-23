import React from "react";
import { Form } from "react-bootstrap";

export default function DashboardFilters({
  activeTab, role, filters, onFilterChange, onClear,
  onNewGroup, onNewPermission, onNewOrder,
  isEditing, onBack, setIsEditing, handleSave, actionLoading, user
}) {
  const isUserDetailView = !!user;

  // Renderizador de campos
  const renderInput = (label, name, placeholder = "") => (
    <div className="filter-col">
      <Form.Group>
        <Form.Label className="filter-label">{label}</Form.Label>
        <Form.Control 
          type="text" 
          name={name} 
          value={filters[name] || ""} 
          onChange={(e) => {
            console.log(`🔍 Input ${name} alterado:`, e.target.value);
            onFilterChange(e);
          }} 
          className="custom-input-dark" 
          placeholder={placeholder} 
        />
      </Form.Group>
    </div>
  );

  const renderSelect = (label, name, options) => (
    <div className="filter-col">
      <Form.Group>
        <Form.Label className="filter-label">{label}</Form.Label>
        <Form.Select 
          name={name} 
          value={filters[name] || ""} 
          onChange={(e) => {
            console.log(`🔍 Select ${name} alterado:`, e.target.value);
            onFilterChange(e);
          }} 
          className="custom-input-dark"
        >
          <option value="">Todos</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Form.Select>
      </Form.Group>
    </div>
  );

  // Configuração das abas
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
        <div className="filter-col">
          <button className="btn-primary w-100" onClick={onNewGroup}>
            <i className="bi bi-plus-lg me-2"></i> Novo Grupo
          </button>
        </div>
      </>
    ),
    permissions: (
      <>
        {renderInput("Buscar Permissão", "label", "Ex: Criar Usuários...")}
        <div className="filter-col">
          <button className="btn-primary w-100" onClick={onNewPermission}>
            <i className="bi bi-plus-lg me-2"></i> Nova Permissão
          </button>
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
        <div className="filter-col">
          <button className="btn-primary w-100" onClick={onNewOrder}>
            <i className="bi bi-megaphone me-2"></i> Abrir Chamado
          </button>
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
  };

  // Verifica se a aba atual tem configuração
  const hasConfig = tabConfigs[activeTab];
  const isAuditOrPermission = activeTab === "audit" || activeTab === "permissions";

  return (
    <div className="filter-card">
      <div className="filter-row">
        {isUserDetailView ? (
          <>
            <div className="filter-col">
              <button className="btn-back w-100" onClick={onBack}>
                <i className="bi bi-arrow-left me-2"></i> Voltar
              </button>
            </div>
            <div className="filter-col">
              {!isEditing ? 
                <button className="btn-edit w-100" onClick={() => setIsEditing(true)}>
                  <i className="bi bi-pencil me-2"></i> Editar
                </button> :
                <div className="action-buttons" style={{ display: "flex", gap: "8px" }}>
                  <button className="btn-secondary" onClick={() => setIsEditing(false)}>Cancelar</button>
                  <button className="btn-primary" onClick={handleSave} disabled={actionLoading}>
                    {actionLoading ? "..." : "Salvar"}
                  </button>
                </div>
              }
            </div>
          </>
        ) : (
          <>
            {hasConfig}
            {/* Botão Limpar - aparece apenas se não for visualização de usuário */}
            {!isUserDetailView && (
              <div className="filter-col">
                <button className="btn-filter-clear w-100" onClick={onClear}>
                  <i className="bi bi-eraser me-2"></i> Limpar
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}