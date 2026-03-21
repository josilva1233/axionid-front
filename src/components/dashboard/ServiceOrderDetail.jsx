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
  
  // 1. ESTADO DE CARREGAMENTO (Evita que a tela suma ou mostre "Invalid Date")
  if (!order || Object.keys(order).length === 0) {
    return (
      <div className="text-center py-5 info-card animate-in">
        <Spinner animation="border" variant="primary" className="mb-3" />
        <h5 className="text-white">Sincronizando dados da OS...</h5>
        <p className="text-dim small">Aguardando resposta do servidor...</p>
        <button className="btn-filter-clear mt-3" onClick={onBack}>
          <i className="bi bi-arrow-left me-2"></i> Voltar para Lista
        </button>
      </div>
    );
  }

  // Funções auxiliares de estilo
  const getStatusBadge = (status) => {
    const config = {
      pending: { color: "bg-warning text-dark", label: "PENDENTE" },
      open: { color: "bg-info text-white", label: "ABERTO" },
      in_progress: { color: "bg-primary", label: "EM ATENDIMENTO" },
      resolved: { color: "bg-success", label: "RESOLVIDO" },
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
      <span className={`badge border ${item.color}`} style={{ fontSize: "0.7rem" }}>
        {item.label.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="group-detail-container animate-in w-100">
      
      {/* HEADER DA OS */}
      <div className="user-detail-header mb-4 p-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div className="header-left d-flex align-items-center">
          <button className="btn-filter-clear btn-back" onClick={onBack}>
            <i className="bi bi-arrow-left me-2"></i> Voltar
          </button>
          <div className="vertical-divider mx-3 d-none d-md-block"></div>
          <div className="user-title-block">
            <span className="user-name-text">
              Protocolo: <span className="text-primary">{order.protocol || "Gerando..."}</span>
            </span>
            <span className="user-id-text d-block">OS ID: #{order.id || "---"}</span>
          </div>
        </div>

        <div className="header-actions">
          {isSystemAdmin && (
            <button
              className="btn-critical-primary bg-danger border-0"
              onClick={() => onDeleteOrder(order.id)}
              disabled={actionLoading}
            >
              <i className="bi bi-trash3 me-2"></i> Excluir OS
            </button>
          )}
        </div>
      </div>

      <Row className="g-4">
        {/* COLUNA ESQUERDA: DETALHES */}
        <Col lg={8}>
          <div className="info-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h3 className="text-white mb-1 fw-bold">{order.title || "Sem título"}</h3>
                <p className="text-dim small">
                  <i className="bi bi-calendar3 me-2"></i>
                  Aberto em: {order.created_at ? new Date(order.created_at).toLocaleString("pt-BR") : "Data indisponível"}
                </p>
              </div>
              <div className="text-end d-flex flex-column gap-2 align-items-end">
                {getStatusBadge(order.status)}
                {getPriorityBadge(order.priority)}
              </div>
            </div>

            <h6 className="text-primary-light text-uppercase fw-bold small mb-2">Descrição da Solicitação</h6>
            <div 
              className="description-box p-3 rounded-3 mb-4"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <p className="text-white mb-0" style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}>
                {order.description || "Nenhuma descrição detalhada fornecida."}
              </p>
            </div>

            {/* SEÇÃO DE ANEXO */}
            {order.attachment_path && (
              <div className="mt-4 p-3 rounded-4 bg-dark border border-secondary">
                <h6 className="text-white-50 mb-3 small text-uppercase">
                  <i className="bi bi-paperclip me-2"></i>Anexo de Evidência
                </h6>
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="rounded-3 border border-secondary overflow-hidden"
                    style={{ width: "80px", height: "80px", background: "#000" }}
                  >
                    <img 
                      src={`${import.meta.env.VITE_API_URL}/storage/${order.attachment_path}`} 
                      alt="Anexo"
                      className="w-100 h-100"
                      style={{ objectFit: "cover" }}
                      onError={(e) => { e.target.src = "https://placehold.co/80?text=DOC"; }}
                    />
                  </div>
                  <a 
                    href={`${import.meta.env.VITE_API_URL}/storage/${order.attachment_path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bw-btn-table-action btn-sm text-decoration-none"
                  >
                    Visualizar Arquivo
                  </a>
                </div>
              </div>
            )}
          </div>
        </Col>

        {/* COLUNA DIREITA: GESTÃO */}
        <Col lg={4}>
          <div className="info-card p-4">
            <h5 className="text-white mb-4 fw-bold">Gestão da Ordem</h5>

            {/* SOLICITANTE */}
            <div className="mb-4">
              <label className="text-dim small text-uppercase fw-bold mb-2 d-block">Solicitante</label>
              <div className="d-flex align-items-center p-2 rounded bg-dark border border-secondary overflow-hidden">
                <div className="avatar-circle me-2 bg-secondary flex-shrink-0" style={{ width: "32px", height: "32px" }}>
                  {order.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="text-truncate">
                  <div className="text-white small fw-bold text-truncate">{order.user?.name || "Usuário Externo"}</div>
                  <div className="text-dim text-truncate" style={{ fontSize: "0.7rem" }}>{order.user?.email || "Email não disponível"}</div>
                </div>
              </div>
            </div>

            {/* GRUPO */}
            <div className="mb-4">
              <label className="text-dim small text-uppercase fw-bold mb-2 d-block">Grupo Responsável</label>
              <div className="text-white small">
                <i className="bi bi-people me-2 text-primary"></i>
                {order.group?.name || "Sem grupo vinculado"}
              </div>
            </div>

            <hr className="border-secondary opacity-25" />

            {/* MUDANÇA DE STATUS */}
            <div className="mb-4">
              <label className="text-dim small text-uppercase fw-bold mb-2 d-block">Alterar Status</label>
              <select
                className="custom-input-dark w-100 py-2"
                value={order.status || "pending"}
                onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                disabled={actionLoading}
              >
                <option value="pending">Pendente</option>
                <option value="open">Abrir OS</option>
                <option value="in_progress">Iniciar Atendimento</option>
                <option value="resolved">Marcar como Resolvido</option>
                <option value="closed">Encerrar Definitivamente</option>
              </select>
            </div>

            {/* TÉCNICO */}
            <div className="mb-2">
              <label className="text-dim small text-uppercase fw-bold mb-2 d-block">Técnico Designado</label>
              {order.technician ? (
                <div className="d-flex align-items-center p-2 rounded bg-dark border border-primary-subtle shadow-sm">
                   <div className="avatar-circle me-2 bg-primary flex-shrink-0" style={{ width: "32px", height: "32px" }}>
                    {order.technician.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-truncate">
                    <div className="text-primary small fw-bold text-truncate">{order.technician.name}</div>
                    <div className="text-dim" style={{ fontSize: "0.65rem" }}>Técnico Responsável</div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded border border-secondary border-dashed text-center bg-white-5">
                  <i className="bi bi-person-dash text-dim d-block mb-1" style={{ fontSize: "1.2rem" }}></i>
                  <span className="text-dim small d-block mb-2">Aguardando Técnico</span>
                  <button
                    className="btn btn-sm btn-outline-primary w-100"
                    onClick={() => onUpdateStatus(order.id, "in_progress")}
                    disabled={actionLoading}
                  >
                    Assumir este chamado
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