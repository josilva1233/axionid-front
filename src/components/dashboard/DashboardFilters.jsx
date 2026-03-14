import { Row, Col, Form } from "react-bootstrap";

export default function DashboardFilters({ 
  activeTab, 
  role, 
  filters, 
  onFilterChange, 
  onClear, 
  onNewGroup,
  onNewPermission // Adicionada esta prop
}) {
  const isUserTab = activeTab === "users" && role === "admin";
  const isGroupTab = activeTab === "groups";
  const isAuditTab = activeTab === "audit" && role === "admin";
  const isPermissionTab = activeTab === "permissions"; // Nova constante

  return (
    <div className="filter-card mb-4 p-4 animate-in">
      <Row className="align-items-end g-3">
        {/* --- FILTROS DE USUÁRIOS --- */}
        {isUserTab && (
          <>
            <Col md={5}>
              <Form.Group>
                <Form.Label className="filter-label">Buscar por Nome</Form.Label>
                <Form.Control type="text" name="name" value={filters.name} onChange={onFilterChange} className="custom-input-dark" placeholder="Ex: João Silva..." />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="filter-label">Status Perfil</Form.Label>
                <Form.Select name="completed" value={filters.completed} onChange={onFilterChange} className="custom-input-dark">
                  <option value="">Todos</option>
                  <option value="1">✅ Completo</option>
                  <option value="0">⚠️ Incompleto</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </>
        )}

        {/* --- FILTROS DE GRUPOS --- */}
        {isGroupTab && (
          <>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="filter-label">Buscar Grupos/Membros</Form.Label>
                <Form.Control type="text" name="name" value={filters.name} onChange={onFilterChange} className="custom-input-dark" />
              </Form.Group>
            </Col>
            <Col md={3}>
              <button className="btn-table-action w-100" style={{ height: "45px" }} onClick={onNewGroup}>
                <i className="bi bi-plus-lg me-2"></i> Novo Grupo
              </button>
            </Col>
          </>
        )}

        {/* --- NOVO: FILTROS DE PERMISSÕES --- */}
        {isPermissionTab && (
          <>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="filter-label">Buscar Permissões</Form.Label>
                <Form.Control 
                  type="text" 
                  name="name" 
                  value={filters.name} 
                  onChange={onFilterChange} 
                  className="custom-input-dark" 
                  placeholder="Ex: admin.users..."
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <button className="btn-primary-axion w-100" style={{ height: "45px" }} onClick={onNewPermission}>
                <i className="bi bi-shield-lock me-2"></i> Nova Permissão
              </button>
            </Col>
          </>
        )}

        {/* --- FILTROS DE AUDITORIA --- */}
        {isAuditTab && (
          <>
            <Col md={5}>
              <Form.Group>
                <Form.Label className="filter-label">Método HTTP</Form.Label>
                <Form.Select name="method" value={filters.method} onChange={onFilterChange} className="custom-input-dark">
                  <option value="">Todos</option>
                  <option value="GET">GET</option><option value="POST">POST</option>
                  <option value="PUT">PUT</option><option value="DELETE">DELETE</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="filter-label">Data</Form.Label>
                <Form.Control type="date" name="date" value={filters.date} onChange={onFilterChange} className="custom-input-dark" />
              </Form.Group>
            </Col>
          </>
        )}

        <Col md={3}>
          <button className="btn-filter-clear w-100" style={{ height: "45px" }} onClick={onClear}>
            <i className="bi bi-eraser me-2"></i> Limpar Filtros
          </button>
        </Col>
      </Row>
    </div>
  );
}