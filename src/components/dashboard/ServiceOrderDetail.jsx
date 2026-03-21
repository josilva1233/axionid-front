import { Badge, Row, Col, Spinner } from "react-bootstrap";

export default function ServiceOrderDetail({
  order,
  onBack,
  onUpdateStatus,
  onDeleteOrder,
  actionLoading,
  isSystemAdmin,
}) {
  // 1. Tratamento de Loading e Dados Ausentes
  if (!order || Object.keys(order).length === 0) {
    return (
      <div className="text-center py-5 info-card">
        <Spinner animation="border" variant="primary" className="mb-3" />
        <p className="text-dim">Sincronizando dados da OS...</p>
        <button className="btn-filter-clear" onClick={onBack}>Voltar para Lista</button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: "bg-warning text-dark", label: "PENDENTE" },
      open: { color: "bg-info text-white", label: "ABERTO" },
      in_progress: { color: "bg-primary", label: "EM ATENDIMENTO" },
      resolved: { color: "bg-success", label: "RESOLVIDO" },
      completed: { color: "bg-success", label: "CONCLUÍDO" },
      closed: { color: "bg-secondary", label: "FECHADO" },
    };
    const item = config[status] || config.pending;
    return <Badge className={`${item.color} px-3 py-2`}>{item.label}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const config = {
      low: { color: "border-secondary text-dim", label: "Baixa" },
      medium: { color: "border-info text-info", label: "Média" },
      high: { color: "border-warning text-warning", label: "Alta" },
      urgent: { color: "border-danger text-danger", label: "Urgente" },
    };
    const item = config[priority] || config.low;
    return (
      <span className={`badge border ${item.color} text-uppercase`} style={{ fontSize: "0.7rem" }}>
        {item.label}
      </span>
    );
  };

  return (
    <div className="group-detail-container animate-in w-100">
      {/* HEADER CORRIGIDO */}
      <div className="user-detail-header mb-4 p-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div className="header-left d-flex align-items-center">
          <button className="btn-filter-clear btn-back" onClick={onBack}>
            <i className="bi bi-arrow-left me-2"></i>Voltar
          </button>
          <div className="vertical-divider mx-3 d-none d-md-block"></div>
          <div className="user-title-block">
            <h5 className="user-name-text mb-0">
              Protocolo: <span className="text-primary">{order.protocol || 'N/A'}</span>
            </h5>
            <small className="text-dim">ID Interno: #{order.id}</small>
          </div>
        </div>

        {isSystemAdmin && (
          <button className="btn-critical-primary bg-danger border-0" onClick={() => onDeleteOrder(order.id)} disabled={actionLoading}>
            <i className="bi bi-trash3 me-2"></i>Excluir OS
          </button>
        )}
      </div>

      <Row className="g-4">
        <Col lg={8}>
          <div className="info-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h3 className="text-white mb-1 fw-bold">{order.title || "Sem Título"}</h3>
                <p className="text-dim small">
                  <i className="bi bi-calendar-event me-2"></i>
                  Aberto em: {order.created_at ? new Date(order.created_at).toLocaleString("pt-BR") : "Data indisponível"}
                </p>
              </div>
              <div className="text-end d-flex flex-column gap-2">
                {getStatusBadge(order.status)}
                {getPriorityBadge(order.priority)}
              </div>
            </div>

            <h6 className="text-primary-light text-uppercase fw-bold small mb-2">Descrição</h6>
            <div className="description-box p-3 rounded-3 mb-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <p className="text-white mb-0" style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}>
                {order.description || "Nenhuma descrição fornecida."}
              </p>
            </div>
          </div>
        </Col>

        <Col lg={4}>
          <div className="info-card p-4">
            <h5 className="text-white mb-4 fw-bold border-bottom border-secondary pb-2">Gestão</h5>
            
            <div className="mb-4">
              <label className="text-dim small text-uppercase fw-bold mb-2 d-block">Solicitante</label>
              <div className="d-flex align-items-center p-2 rounded bg-dark border border-secondary">
                <div className="avatar-circle me-2 bg-secondary" style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {order.user?.name?.charAt(0) || "?"}
                </div>
                <div className="overflow-hidden">
                  <div className="text-white small fw-bold text-truncate">{order.user?.name || "Desconhecido"}</div>
                  <div className="text-dim text-truncate" style={{ fontSize: "0.7rem" }}>{order.user?.email}</div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-dim small text-uppercase fw-bold mb-2 d-block">Alterar Status</label>
              <select 
                className="custom-input-dark w-100" 
                value={order.status} 
                onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                disabled={actionLoading}
              >
                <option value="pending">Pendente</option>
                <option value="open">Aberto</option>
                <option value="in_progress">Em Atendimento</option>
                <option value="resolved">Resolvido</option>
                <option value="closed">Encerrado</option>
              </select>
            </div>

            <div className="mb-2">
              <label className="text-dim small text-uppercase fw-bold mb-2 d-block">Técnico Designado</label>
              {order.technician ? (
                <div className="d-flex align-items-center p-2 rounded bg-dark border border-primary-subtle">
                  <i className="bi bi-person-badge text-primary me-2"></i>
                  <span className="text-primary small fw-bold">{order.technician.name}</span>
                </div>
              ) : (
                <div className="p-3 rounded border border-secondary border-dashed text-center bg-white-5">
                  <span className="text-dim d-block small mb-2">Aguardando técnico</span>
                  <button 
                    className="btn btn-sm btn-outline-primary w-100" 
                    onClick={() => onUpdateStatus(order.id, "in_progress")}
                    disabled={actionLoading}
                  >
                    Assumir Chamado
                  </button>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}