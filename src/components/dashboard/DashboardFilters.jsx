import React from "react";
import { Form } from "react-bootstrap";

import '../../dashboardFilters.css';

export default function DashboardFilters({
  activeTab, role, filters, onFilterChange, onClear,
  onNewGroup, onNewPermission, onNewOrder,
  isEditing, onBack, setIsEditing, handleSave, actionLoading, user
}) {
  const isUserDetailView = !!user;

  // Renderizador de campos (Helpers)
  const renderInput = (label, name, placeholder = "") => (
    <div className="filter-col">
      <Form.Group>
        <Form.Label className="filter-label">{label}</Form.Label>
        <Form.Control 
          type="text" 
          name={name} 
          value={filters[name] || ""} 
          onChange={onFilterChange} 
          className="custom-input-dark" 
          placeholder={placeholder} 
        />
      </Form.Group>
    </div>
  );

  // Configuração das abas
  const tabConfigs = {
    users: role === "admin" && (
      <>
        {renderInput("Buscar por Nome", "name", "Ex: João Silva...")}
        <div className="filter-col">
          <Form.Group>
            <Form.Label className="filter-label">Status Perfil</Form.Label>
            <Form.Select name="completed" value={filters.completed || ""} onChange={onFilterChange} className="custom-input-dark">
              <option value="">Todos</option>
              <option value="1">✅ Completo</option>
              <option value="0">⚠️ Incompleto</option>
            </Form.Select>
          </Form.Group>
        </div>
      </>
    ),
    groups: (
      <>
        {renderInput("Buscar Grupos/Membros", "name")}
        <div className="filter-col">
          <button className="btn-primary w-100" onClick={onNewGroup}>
            <i className="bi bi-plus-lg me-2"></i> Novo Grupo
          </button>
        </div>
      </>
    ),
    orders: (
      <>
        {/* 1. Busca por Protocolo */}
        {renderInput("Buscar por Protocolo", "protocol", "Ex: OS-2026...")}

        {/* 2. Busca por Título / Assunto */}
        {renderInput("Título / Assunto", "title", "Ex: Erro no sistema...")}

        {/* 3. Busca por Solicitante */}
        {renderInput("Solicitante", "applicant", "Nome do solicitante...")}

        {/* 4. Filtro por Prioridade */}
        <div className="filter-col">
          <Form.Group>
            <Form.Label className="filter-label">Prioridade</Form.Label>
            <Form.Select 
              name="priority" 
              value={filters.priority || ""} 
              onChange={onFilterChange} 
              className="custom-input-dark"
            >
              <option value="">Todas as Prioridades</option>
              <option value="low">Baixa (Low)</option>
              <option value="medium">Média (Medium)</option>
              <option value="high">Alta (High)</option>
              <option value="urgent">Urgente (Urgent)</option>
            </Form.Select>
          </Form.Group>
        </div>

        {/* 5. Filtro por Status */}
        <div className="filter-col">
          <Form.Group>
            <Form.Label className="filter-label">Status</Form.Label>
            <Form.Select 
              name="status" 
              value={filters.status || ""} 
              onChange={onFilterChange} 
              className="custom-input-dark"
            >
              <option value="">Todos os Status</option>
              <option value="open">Aberto</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Fechado / Concluído</option>
              <option value="canceled">Cancelado</option>
            </Form.Select>
          </Form.Group>
        </div>

        {/* Botão de Novo Chamado */}
        <div className="filter-col">
          <button className="btn-primary w-100" onClick={onNewOrder}>
            <i className="bi bi-megaphone me-2"></i> Abrir Chamado
          </button>
        </div>
      </>
    )
  };

  return (
    <div className="filter-card">
      <div className="filter-row">
        {isUserDetailView ? (
          /* Renderização do Detail View */
          <>
            <div className="filter-col"><button className="btn-back w-100" onClick={onBack}><i className="bi bi-arrow-left me-2"></i> Voltar</button></div>
            <div className="filter-col">
              {!isEditing ? 
                <button className="btn-edit w-100" onClick={() => setIsEditing(true)}><i className="bi bi-pencil me-2"></i> Editar</button> :
                <div className="action-buttons">
                  <button className="btn-secondary" onClick={() => setIsEditing(false)}>Cancelar</button>
                  <button className="btn-primary" onClick={handleSave} disabled={actionLoading}>{actionLoading ? "..." : "Salvar"}</button>
                </div>
              }
            </div>
          </>
        ) : (
          /* Renderização dinâmica */
          <>
            {tabConfigs[activeTab]}
            <div className="filter-col">
              <button className="btn-filter-clear w-100" onClick={onClear}><i className="bi bi-eraser me-2"></i> Limpar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}