import { Row, Col, Form } from "react-bootstrap";

export default function DashboardFilters({ 
  activeTab, 
  role, 
  filters, 
  onFilterChange, 
  onClear, 
  onNewGroup, 
  onNewPermission,
  // Props com valores padrão
  isEditing = false,
  onBack = () => {},
  setIsEditing = () => {},
  handleSave = () => {},
   handleSave = () => {},
  actionLoading = false,
  user = null
}) {
  const isUserTab = activeTab === "users" && role === "admin";
  const isGroupTab = activeTab === "groups";
  const isAuditTab = activeTab === "audit" && role === "admin";
  const isPermissionTab = activeTab === "permissions";

  const isUserDetailView = !!user;

  // ✅ CORREÇÃO: user.id pode ser número
  const userIdDisplay = user?.id ? String(user.id).substring(0, 18) + "..." : "N/A";

  return (
    <div className="filter-card mb-4 p-4 animate-in">
      <Row className="align-items-end g-3">
        {isUserDetailView ? (
          <>
            <Col md={5}>
              <Form.Group>
                <Form.Label className="filter-label">Navegação</Form.Label>
                <button className="btn-filter-clear w-100 d-flex align-items-center justify-content-center" style={{ height: "45px" }} onClick={onBack}>
                  <i className="bi bi-arrow-left me-2"></i> Voltar para a lista
                </button>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="filter-label">Ações de Registro</Form.Label>
                {!isEditing ? (
                  <button className="btn-critical-primary w-100" style={{ height: "45px" }} onClick={() => setIsEditing(true)}>
                    <i className="bi bi-pencil me-2"></i> Editar Usuário
                  </button>
                ) : (
                  <div className="d-flex gap-2">
                    <button className="btn-critical-secondary w-50" style={{ height: "45px" }} onClick={() => setIsEditing(false)}>
                      Cancelar
                    </button>
                    <button 
                      className="btn-table-action w-50" 
                      style={{ height: "45px", background: "var(--success)", border: "none" }} 
                      onClick={handleSave} // <--- Chama a função passada pelo pai
                      disabled={actionLoading}
                    >
                      {actionLoading ? "..." : "Salvar"}
                    </button>
                  </div>
                )}
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group>
                <Form.Label className="filter-label">ID do Sistema</Form.Label>
                <div className="custom-input-dark d-flex align-items-center px-3 mono-text" style={{ height: "45px", fontSize: "0.75rem", color: "var(--primary)", opacity: 0.8 }}>
                  {userIdDisplay} {/* ✅ CORRIGIDO */}
                </div>
              </Form.Group>
            </Col>
          </>
        ) : (
          <>
            {/* RESTO DO CÓDIGO FICA EXATAMENTE IGUAL */}
            {isUserTab && (
              <>
                <Col md={5}>
                  <Form.Group>
                    <Form.Label className="filter-label">Buscar por Nome</Form.Label>
                    <Form.Control type="text" name="name" value={filters.name || ""} onChange={onFilterChange} className="custom-input-dark" placeholder="Ex: João Silva..." />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="filter-label">Status Perfil</Form.Label>
                    <Form.Select name="completed" value={filters.completed || ""} onChange={onFilterChange} className="custom-input-dark">
                      <option value="">Todos</option>
                      <option value="1">✅ Completo</option>
                      <option value="0">⚠️ Incompleto</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </>
            )}

            {isGroupTab && (
              <>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="filter-label">Buscar Grupos/Membros</Form.Label>
                    <Form.Control type="text" name="name" value={filters.name || ""} onChange={onFilterChange} className="custom-input-dark" />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <button className="btn-table-action w-100" style={{ height: "45px" }} onClick={onNewGroup}>
                    <i className="bi bi-plus-lg me-2"></i> Novo Grupo
                  </button>
                </Col>
              </>
            )}

            {isPermissionTab && (
              <>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="filter-label">Buscar Permissões</Form.Label>
                    <Form.Control type="text" name="name" value={filters.name || ""} onChange={onFilterChange} className="custom-input-dark" placeholder="Filtrar por slug..." />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <button className="btn-table-action w-100" style={{ height: "45px" }} onClick={onNewPermission}>
                    <i className="bi bi-plus-lg me-2"></i> Nova Permissão
                  </button>
                </Col>
              </>
            )}

            {isAuditTab && (
              <>
                <Col md={5}>
                  <Form.Group>
                    <Form.Label className="filter-label">Método HTTP</Form.Label>
                    <Form.Select name="method" value={filters.method || ""} onChange={onFilterChange} className="custom-input-dark">
                      <option value="">Todos</option>
                      <option value="GET">GET</option><option value="POST">POST</option>
                      <option value="PUT">PUT</option><option value="DELETE">DELETE</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="filter-label">Data</Form.Label>
                    <Form.Control type="date" name="date" value={filters.date || ""} onChange={onFilterChange} className="custom-input-dark" />
                  </Form.Group>
                </Col>
              </>
            )}

            <Col md={3}>
              <button className="btn-filter-clear w-100" style={{ height: "45px" }} onClick={onClear}>
                <i className="bi bi-eraser me-2"></i> Limpar Filtros
              </button>
            </Col>
          </>
        )}
      </Row>
    </div>
  );
}
