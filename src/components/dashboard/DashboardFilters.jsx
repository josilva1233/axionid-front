import React from "react";
import { Row, Col, Form } from "react-bootstrap";

export default function DashboardFilters({
  activeTab,
  role,
  filters,
  onFilterChange,
  onClear,
  onNewGroup,
  onNewPermission,
  onNewOrder,
  isEditing = false,
  onBack = () => {},
  setIsEditing = () => {},
  handleSave = () => {},
  actionLoading = false,
  user = null,
}) {
  const isUserTab = activeTab === "users" && role === "admin";
  const isGroupTab = activeTab === "groups";
  const isAuditTab = activeTab === "audit" && role === "admin";
  const isPermissionTab = activeTab === "permissions";
  const isOrdersTab = activeTab === "orders";
  const isUserDetailView = !!user;

  const userIdDisplay = user?.id ? String(user.id).substring(0, 18) + "..." : "N/A";

  return (
    <div className="filter-card">
      {isUserDetailView ? (
        <div className="filter-row">
          <div className="filter-col">
            <Form.Group>
              <Form.Label className="filter-label">Navegação</Form.Label>
              <button className="btn-back w-100" onClick={onBack}>
                <i className="bi bi-arrow-left me-2"></i> Voltar para a lista
              </button>
            </Form.Group>
          </div>

          <div className="filter-col">
            <Form.Group>
              <Form.Label className="filter-label">Ações de Registro</Form.Label>
              {!isEditing ? (
                <button className="btn-edit w-100" onClick={() => setIsEditing(true)}>
                  <i className="bi bi-pencil me-2"></i> Editar Usuário
                </button>
              ) : (
                <div className="action-buttons">
                  <button className="btn-secondary" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </button>
                  <button className="btn-primary" onClick={handleSave} disabled={actionLoading}>
                    {actionLoading ? "..." : "Salvar"}
                  </button>
                </div>
              )}
            </Form.Group>
          </div>

          <div className="filter-col">
            <Form.Group>
              <Form.Label className="filter-label">ID do Sistema</Form.Label>
              <div className="user-id-display">{userIdDisplay}</div>
            </Form.Group>
          </div>
        </div>
      ) : (
        <div className="filter-row">
          {isUserTab && (
            <>
              <div className="filter-col">
                <Form.Group>
                  <Form.Label className="filter-label">Buscar por Nome</Form.Label>
                  <Form.Control
                    type="text" name="name"
                    value={filters.name || ""}
                    onChange={onFilterChange}
                    className="custom-input-dark"
                    placeholder="Ex: João Silva..."
                  />
                </Form.Group>
              </div>
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
          )}

          {isGroupTab && (
            <>
              <div className="filter-col">
                <Form.Group>
                  <Form.Label className="filter-label">Buscar Grupos/Membros</Form.Label>
                  <Form.Control type="text" name="name" value={filters.name || ""} onChange={onFilterChange} className="custom-input-dark" />
                </Form.Group>
              </div>
              <div className="filter-col">
                <button className="btn-primary w-100" onClick={onNewGroup}>
                  <i className="bi bi-plus-lg me-2"></i> Novo Grupo
                </button>
              </div>
            </>
          )}

          {isOrdersTab && (
            <>
              <div className="filter-col">
                <Form.Group>
                  <Form.Label className="filter-label">Buscar por Protocolo ou Título</Form.Label>
                  <Form.Control
                    type="text"
                    name="protocol"
                    value={filters.protocol || ""}
                    onChange={onFilterChange}
                    className="custom-input-dark"
                    placeholder="Ex: OS-2026..."
                  />
                </Form.Group>
              </div>
              <div className="filter-col">
                <button className="btn-primary w-100" onClick={onNewOrder}>
                  <i className="bi bi-megaphone me-2"></i> Abrir Chamado
                </button>
              </div>
            </>
          )}

          {isPermissionTab && (
            <>
              <div className="filter-col">
                <Form.Group>
                  <Form.Label className="filter-label">Buscar Permissões</Form.Label>
                  <Form.Control type="text" name="name" value={filters.name || ""} onChange={onFilterChange} className="custom-input-dark" placeholder="Filtrar por slug..." />
                </Form.Group>
              </div>
              <div className="filter-col">
                <button className="btn-primary w-100" onClick={onNewPermission}>
                  <i className="bi bi-plus-lg me-2"></i> Nova Permissão
                </button>
              </div>
            </>
          )}

          {isAuditTab && (
            <>
              <div className="filter-col">
                <Form.Group>
                  <Form.Label className="filter-label">Método HTTP</Form.Label>
                  <Form.Select name="method" value={filters.method || ""} onChange={onFilterChange} className="custom-input-dark">
                    <option value="">Todos</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="filter-col">
                <Form.Group>
                  <Form.Label className="filter-label">Data</Form.Label>
                  <Form.Control type="date" name="date" value={filters.date || ""} onChange={onFilterChange} className="custom-input-dark" />
                </Form.Group>
              </div>
            </>
          )}

          <div className="filter-col">
            <button className="btn-filter-clear w-100" onClick={onClear}>
              <i className="bi bi-eraser me-2"></i> Limpar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}