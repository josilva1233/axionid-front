import React from "react";
import { Badge, Row, Col, Spinner } from "react-bootstrap";

export default function ServiceOrderDetail({
  order,
  onBack,
  onUpdateStatus,
  onDeleteOrder,
  actionLoading,
  isSystemAdmin,
}) {
  
  // 1. Loading State: Só sai daqui quando o objeto 'order' tem dados reais
  if (!order || !order.id) {
    return (
      <div className="text-center py-5 info-card animate-in w-100">
        <Spinner animation="border" variant="primary" className="mb-3" />
        <h5 className="text-white">Sincronizando dados da OS...</h5>
        <p className="text-dim small">Buscando informações no servidor AxionID</p>
        <button className="btn-filter-clear mt-3" onClick={onBack}>
          <i className="bi bi-arrow-left me-2"></i> Voltar para Lista
        </button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: "bg-warning text-dark", label: "PENDENTE" },
      open: { color: "bg-info text-white", label: "ABERTO" },
      in_progress: { color: "bg-primary text-white", label: "EM ATENDIMENTO" },
      resolved: { color: "bg-success text-white", label: "RESOLVIDO" },
      closed: { color: "bg-secondary text-white", label: "FECHADO" },
    };
    const item = config[status] || config.pending;
    return <Badge className={`${item.color} px-3 py-2 shadow-sm`}>{item.label}</Badge>;
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
      <span className={`badge border ${item.color} text-uppercase`} style={{ fontSize: "0.7rem", letterSpacing: '1px' }}>
        {item.label}
      </span>
    );
  };

  return (
    <div className="group-detail-container animate-in w-100">
      {/* HEADER */}
      <div className="user-detail-header mb-4 p-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div className="header-left d-flex align-items-center">
          <button className="btn-filter-clear btn-back" onClick={onBack}>
            <i className="bi bi-arrow-left me-2"></i> Voltar
          </button>
          <div className="vertical-divider mx-3 d-none d-md-block"></div>
          <div className="user-title-block">
            <h5 className="user-name-text mb-0">
              Protocolo: <span className="text-primary">{order.protocol || "N/A"}</span>
            </h5>
            <small className="text-dim">ID: #{order.id}</small>
          </div>
        </div>

        {isSystemAdmin && (
          <button
            className="btn-critical-primary bg-danger border-0 d-flex align-items-center"
            onClick={() => onDeleteOrder(order.id)}
            disabled={actionLoading}
          >
            <i className="bi bi-trash3 me-2"></i> Excluir OS
          </button>
        )}
      </div>

      <Row className="g-4">
        <Col lg={8}>
          <div className="info-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div className="pe-3">
                <h3 className="text-white mb-2 fw-bold">{order.title || "Sem Título"}</h3>
                <div className="d-flex flex-wrap gap-3 text-dim small">
                  <span><i className="bi bi-calendar3 me-1"></i> {order.created_at ? new Date(order.created_at).toLocaleString("pt-BR") : "---"}</span>
                  <span><i className="bi bi-people me-1"></i> {order.group?.name || "Geral"}</span>
                </div>
              </div>
              <div className="text-end d-flex flex-column gap-2 align-items-end">
                {getStatusBadge(order.status)}
                {getPriorityBadge(order.priority)}
              </div>
            </div>

            <h6 className="text-primary-light text-uppercase fw-bold small mb-2">Descrição</h6>
            <div className="description-box p-3 rounded-3 mb-4 bg-dark-subtle border border-secondary border-opacity-10">
              <p className="text-white mb-0" style={{ whiteSpace: "pre-line", lineHeight: "1.7" }}>
                {order.description || "Nenhuma descrição."}
              </p>
            </div>

            {order.attachment_path && (
              <div className="mt-4 p-3 rounded bg-dark border border-secondary border-opacity-25 d-flex align-items-center gap-3">
                 <i className="bi bi-paperclip text-primary fs-4"></i>
                 <a href={`${import.meta.env.VITE_API_URL}/storage/${order.attachment_path}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-light">
                   Abrir Anexo
                 </a>
              </div>
            )}
          </div>
        </Col>

        <Col lg={4}>
          <div className="info-card p-4">
            <h5 className="text-white mb-4 fw-bold pb-2 border-bottom border-secondary border-opacity-25">Gestão</h5>

            <div className="mb-4">
              <label className="text-dim small text-uppercase fw-bold mb-2 d-block">Solicitante</label>
              <div className="d-flex align-items-center p-2 rounded bg-dark border border-secondary border-opacity-25">
                <div className="avatar-circle me-3 bg-secondary flex-shrink-0" style={{ width: "35px", height: "35px", borderRadius: '50%', textAlign: 'center', lineHeight: '35px' }}>
                  {order.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="text-white small fw-bold text-truncate">{order.user?.name}</div>
                  <div className="text-dim text-truncate small">{order.user?.email}</div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-dim small text-uppercase fw-bold mb-2 d-block">Alterar Status</label>
              <select
                className="custom-input-dark w-100 py-2"
                value={order.status || "pending"}
                onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                disabled={actionLoading}
              >
                <option value="pending">Pendente</option>
                <option value="open">Aberto</option>
                <option value="in_progress">Em Atendimento</option>
                <option value="resolved">Resolvido</option>
                <option value="closed">Encerrar Chamado</option>
              </select>
            </div>

            <div className="mb-2">
              <label className="text-dim small text-uppercase fw-bold mb-2 d-block">Técnico Responsável</label>
              {order.technician ? (
                <div className="d-flex align-items-center p-2 rounded bg-primary bg-opacity-10 border border-primary border-opacity-25">
                  <i className="bi bi-person-check-fill text-primary me-2"></i>
                  <span className="text-primary small fw-bold">{order.technician.name}</span>
                </div>
              ) : (
                <button className="btn btn-sm btn-primary w-100 fw-bold" onClick={() => onUpdateStatus(order.id, "in_progress")} disabled={actionLoading}>
                   Assumir Chamado
                </button>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}