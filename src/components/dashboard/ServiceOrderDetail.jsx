import { useState } from "react";
import { Badge, Row, Col, OverlayTrigger, Tooltip, Spinner, Card } from "react-bootstrap";
//import "../../ServiceOrderDetail.css";

const STATUS_CONFIG = {
  pending: { color: "warning", label: "PENDENTE", icon: "⏳" },
  open: { color: "info", label: "EM ABERTO", icon: "📂" },
  in_progress: { color: "primary", label: "EM ATENDIMENTO", icon: "🔧" },
  resolved: { color: "success", label: "RESOLVIDO", icon: "✅" },
  closed: { color: "secondary", label: "FECHADO", icon: "🔒" },
};

const PRIORITY_CONFIG = {
  low: { color: "success", label: "Baixa", icon: "🔵" },
  medium: { color: "info", label: "Média", icon: "🟡" },
  high: { color: "warning", label: "Alta", icon: "🟠" },
  urgent: { color: "danger", label: "URGENTE", icon: "🔴" },
};

const StatusBadge = ({ status }) => {
  const item = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <Badge bg={item.color} className="px-3 py-2 rounded-pill fs-6 fw-bold shadow-sm">
      <span className="me-1">{item.icon}</span> {item.label}
    </Badge>
  );
};

const PriorityBadge = ({ priority }) => {
  const item = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;
  return (
    <Badge bg={item.color} className="px-3 py-2 rounded-pill fs-6 fw-bold shadow-sm">
      <span className="me-1">{item.icon}</span> {item.label}
    </Badge>
  );
};

const AttachmentPreview = ({ order, baseUrl }) => {
  const fileName = order.attachment_path?.split("/").pop() || "anexo";
  const fullUrl = `${baseUrl}/storage/${order.attachment_path}`;

  if (!order.attachment_path) return null;

  return (
    <div className="mt-4 pt-3 border-top border-secondary">
      <h6 className="text-primary mb-3 fs-5 fw-bold">
        <i className="bi bi-paperclip me-2"></i>
        Anexo da Solicitação
      </h6>
      
      <div className="bg-dark bg-opacity-25 rounded-4 p-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <i className="bi bi-file-earmark-text text-primary fs-1"></i>
            <div>
              <h6 className="text-white mb-1 fw-bold">{fileName}</h6>
              <small className="text-white-50">
                {order.attachment_path?.includes('.pdf') ? 'Documento PDF' : 'Arquivo anexado'}
              </small>
            </div>
          </div>
          
          <a
            href={fullUrl}
            download={fileName}
            className="btn btn-primary px-4 py-2 rounded-pill"
          >
            <i className="bi bi-download me-2"></i>
            Download
          </a>
        </div>
      </div>
    </div>
  );
};

export default function ServiceOrderDetail({
  order,
  onBack,
  onUpdateStatus,
  onDeleteOrder,
  actionLoading,
  isSystemAdmin,
}) {
  const baseUrl = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || "http://163.176.168.224";

  if (!order) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-50 text-center p-5">
        <Spinner animation="border" variant="primary" className="mb-3" style={{ width: "3rem", height: "3rem" }} />
        <h5 className="text-white-50 mb-3">Carregando detalhes da OS...</h5>
        <button className="btn btn-outline-light px-4 py-2 rounded-pill" onClick={onBack}>
          <i className="bi bi-arrow-left me-2"></i>Voltar
        </button>
      </div>
    );
  }

  const formattedDate = new Date(order.created_at).toLocaleString("pt-BR", {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="service-order-detail-container">
      {/* Header Moderno */}
      <div className="detail-header bg-dark border-bottom border-primary" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)" }}>
        <div className="container-fluid px-4 py-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <button 
                className="btn btn-outline-light px-4 py-2 rounded-pill hover-lift"
                onClick={onBack}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Voltar
              </button>
              
              <div className="protocol-badge bg-primary bg-opacity-25 px-4 py-2 rounded-pill">
                <strong className="text-primary fs-5">#{order.protocol || order.id}</strong>
              </div>
            </div>
            
            <div className="flex-grow-1">
              <h2 className="text-white mb-1 fw-bold">{order.title}</h2>
              <div className="d-flex gap-3 text-white-50 small">
                <span><i className="bi bi-calendar3 me-1"></i>{formattedDate}</span>
                <span><i className="bi bi-hash me-1"></i>ID: {order.id}</span>
              </div>
            </div>

            {isSystemAdmin && (
              <OverlayTrigger placement="bottom" overlay={<Tooltip>Excluir permanentemente</Tooltip>}>
                <button
                  className="btn btn-outline-danger px-4 py-2 rounded-pill"
                  onClick={() => onDeleteOrder(order.id)}
                  disabled={actionLoading}
                >
                  <i className="bi bi-trash3-fill me-2"></i>
                  Excluir
                </button>
              </OverlayTrigger>
            )}
          </div>
        </div>
      </div>

      <div className="container-fluid px-4 py-4">
        <Row className="g-4">
          {/* Coluna Principal */}
          <Col lg={8}>
            <Card className="bg-dark bg-opacity-50 border-secondary rounded-4 shadow-lg">
              <Card.Body className="p-4">
                {/* Status e Prioridade */}
                <div className="d-flex gap-3 mb-4 pb-3 border-bottom border-secondary">
                  <StatusBadge status={order.status} />
                  <PriorityBadge priority={order.priority} />
                </div>

                {/* Descrição */}
                <div className="mb-4">
                  <h6 className="text-primary mb-3 fs-5 fw-bold">
                    <i className="bi bi-chat-square-text-fill me-2"></i>
                    Descrição da Solicitação
                  </h6>
                  <div className="bg-dark bg-opacity-25 rounded-4 p-4">
                    <p className="text-white-50 mb-0 lh-lg">
                      {order.description || "Sem descrição fornecida."}
                    </p>
                  </div>
                </div>

                {/* Anexo */}
                <AttachmentPreview order={order} baseUrl={baseUrl} />
              </Card.Body>
            </Card>
          </Col>

          {/* Coluna Lateral */}
          <Col lg={4}>
            <Card className="bg-dark bg-opacity-50 border-secondary rounded-4 shadow-lg">
              <Card.Body className="p-4">
                <h4 className="text-white mb-4 fw-bold text-center">
                  <i className="bi bi-gear-fill text-primary me-2"></i>
                  Gestão da Ordem
                </h4>

                {/* Solicitante */}
                <div className="mb-4 p-3 bg-dark bg-opacity-25 rounded-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="avatar-circle-lg bg-primary bg-opacity-25 text-primary fw-bold">
                      {order.user?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="text-white mb-1 fw-bold">{order.user?.name || "Usuário não identificado"}</h6>
                      <small className="text-white-50">{order.user?.email || "Email não disponível"}</small>
                    </div>
                  </div>
                </div>

                {/* Grupo */}
                <div className="mb-4 p-3 bg-dark bg-opacity-25 rounded-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-info bg-opacity-20 p-2 rounded-circle">
                      <i className="bi bi-people-fill text-info fs-4"></i>
                    </div>
                    <div>
                      <h6 className="text-white-50 small mb-1 text-uppercase">Grupo Responsável</h6>
                      <p className="text-white mb-0 fw-bold">{order.group?.name || "Sem grupo vinculado"}</p>
                    </div>
                  </div>
                </div>

                {/* Técnico */}
                <div className="mb-4 p-3 bg-dark bg-opacity-25 rounded-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-success bg-opacity-20 p-2 rounded-circle">
                      <i className="bi bi-person-badge text-success fs-4"></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="text-white-50 small mb-1 text-uppercase">Técnico Designado</h6>
                      {order.technician ? (
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar-circle-sm bg-success">
                            {order.technician.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white mb-0 fw-bold">{order.technician.name}</p>
                            <small className="text-white-50">Responsável pelo atendimento</small>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-3">
                          <i className="bi bi-person-plus-fill text-white-50 fs-1 mb-2 d-block"></i>
                          <p className="text-white-50 mb-2">Aguardando técnico</p>
                          <button
                            className="btn btn-outline-primary w-100 py-2 rounded-pill"
                            onClick={() => onUpdateStatus(order.id, "in_progress")}
                            disabled={actionLoading}
                          >
                            <i className="bi bi-person-check me-2"></i>
                            Assumir este chamado
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Select */}
                <div className="mt-4 pt-3 border-top border-secondary">
                  <label className="text-white-50 small text-uppercase fw-bold mb-3 d-block">
                    Alterar Status
                  </label>
                  <select
                    className="form-select bg-dark text-white border-primary rounded-pill py-2"
                    value={order.status}
                    onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                    disabled={actionLoading}
                    style={{ cursor: "pointer" }}
                  >
                    <option value="pending">⏳ Pendente</option>
                    <option value="open">📂 Em Aberto</option>
                    <option value="in_progress">🔧 Em Atendimento</option>
                    <option value="resolved">✅ Resolvido</option>
                    <option value="closed">🔒 Fechado</option>
                  </select>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}