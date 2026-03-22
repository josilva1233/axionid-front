import { useState } from "react";
import { Badge, Row, Col, OverlayTrigger, Tooltip, Spinner } from "react-bootstrap";
//import "../ServiceOrderDetail.css";

const STATUS_CONFIG = {
  pending: { color: "bg-warning text-dark", label: "PENDENTE" },
  open: { color: "bg-info text-white", label: "EM ABERTO" },
  in_progress: { color: "bg-primary", label: "EM ATENDIMENTO" },
  resolved: { color: "bg-success", label: "RESOLVIDO" },
  closed: { color: "bg-secondary", label: "FECHADO" },
};

const PRIORITY_CONFIG = {
  low: { color: "bg-success-subtle text-success border-success", label: "Baixa" },
  medium: { color: "bg-info-subtle text-info border-info", label: "Média" },
  high: { color: "bg-warning-subtle text-warning border-warning", label: "Alta" },
  urgent: { color: "bg-danger-subtle text-danger border-danger", label: "URGENTE!" },
};

const StatusBadge = ({ status }) => {
  const item = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <Badge pill bg={item.color.split(' ')[0]} className={item.color}>
      {item.label}
    </Badge>
  );
};

const PriorityBadge = ({ priority }) => {
  const item = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;
  return (
    <Badge pill bg="" className={`border fw-bold ${item.color}`} style={{ fontSize: "0.75rem" }}>
      {item.label}
    </Badge>
  );
};

const AttachmentPreview = ({ order, baseUrl }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileName = order.attachment_path?.split("/").pop() || "anexo";
  const fullUrl = `${baseUrl}/storage/${order.attachment_path}`;

  if (!order.attachment_path) return null;

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);

  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(order.attachment_path);

  return (
    <div className="attachment-section">
      <h6 className="text-white-50 mb-4 fs-5 fw-bold text-uppercase">
        <i className="bi bi-paperclip text-warning me-2"></i>
        Evidência Anexada
      </h6>
      
      <div className="row g-4 align-items-center">
        <Col md={4}>
          <div 
            className="attachment-preview"
            style={{ width: "100%", height: "200px", background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)" }}
            onClick={() => window.open(fullUrl, "_blank")}
          >
            {!imageLoaded && !imageError && (
              <div className="loading-overlay-img">
                <Spinner animation="grow" variant="primary" className="me-2" size="sm" />
                <span className="text-white fw-bold small">Carregando...</span>
              </div>
            )}
            
            {isImage && !imageError ? (
              <img 
                src={fullUrl}
                alt="Preview da evidência"
                className="w-100 h-100 object-fit-cover"
                style={{ opacity: imageLoaded ? 1 : 0, transition: "opacity 0.5s ease" }}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center p-4">
                <i className="bi bi-file-earmark-fill text-white-50 mb-3" style={{ fontSize: "3rem", opacity: 0.5 }}></i>
                <div className="text-white-75 small text-center">
                  <div className="fw-bold mb-1">{fileName}</div>
                  <small className="text-white-50">Clique para visualizar</small>
                </div>
              </div>
            )}
            
            <div className="position-absolute inset-0 bg-black bg-opacity-0 hover-bg-opacity-50 d-flex align-items-center justify-content-center rounded-4 transition-all">
              <i className="bi bi-zoom-in text-white fs-1 hover-opacity-100"></i>
            </div>
          </div>
        </Col>
        
        <Col md={8}>
          <div className="d-flex flex-column h-100 justify-content-center">
            <div className="mb-4">
              <h5 className="text-white fw-bold mb-2">📎 {fileName}</h5>
              <span className="badge bg-light text-dark fs-6 px-3 py-2">Evidência do chamado</span>
            </div>
            
            <div className="d-flex gap-3 flex-wrap">
              <OverlayTrigger placement="bottom" overlay={<Tooltip>Abrir em nova aba</Tooltip>}>
                <a
                  href={fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-light btn-lg px-4 rounded-pill shadow-sm hover-lift"
                >
                  <i className="bi bi-eye-fill me-2"></i>
                  Visualizar
                </a>
              </OverlayTrigger>
              
              <OverlayTrigger placement="bottom" overlay={<Tooltip>Baixar arquivo</Tooltip>}>
                <a
                  href={fullUrl}
                  download={fileName}
                  className="btn btn-primary btn-lg px-4 rounded-pill shadow-sm hover-lift"
                >
                  <i className="bi bi-download me-2"></i>
                  Download
                </a>
              </OverlayTrigger>
            </div>
          </div>
        </Col>
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
  // URL base do ambiente
  const baseUrl = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || "http://163.176.168.224";

  if (!order) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-50 text-center p-5">
        <Spinner animation="border" variant="primary" className="mb-3" />
        <h5 className="text-white mb-3">Carregando detalhes da OS...</h5>
        <button className="btn btn-outline-light btn-lg px-4" onClick={onBack}>
          <i className="bi bi-arrow-left me-2"></i>Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="service-order-detail-container">
      {/* HEADER */}
      <div className="detail-header">
        <div className="container-fluid p-4">
          <div className="row align-items-center">
            <div className="col-auto pe-0">
              <button 
                className="btn btn-outline-light btn-lg px-4 py-2 rounded-pill shadow-sm hover-lift"
                onClick={onBack}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Voltar
              </button>
            </div>
            
            <div className="col ps-4">
              <div className="d-flex align-items-center h-100">
                <div className="protocol-badge me-3">
                  <strong>#{order.protocol || order.id}</strong>
                </div>
                <div>
                  <h2 className="text-white mb-1 fw-bold lh-sm">{order.title}</h2>
                  <div className="d-flex align-items-center gap-3 text-white-50 small">
                    <span><i className="bi bi-calendar3 me-1"></i>{new Date(order.created_at).toLocaleString("pt-BR")}</span>
                    <span><i className="bi bi-hash me-1"></i>ID: {order.id}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-auto">
              <div className="d-flex gap-2">
                {isSystemAdmin && (
                  <OverlayTrigger placement="bottom" overlay={<Tooltip>Excluir permanentemente</Tooltip>}>
                    <button
                      className="btn btn-outline-danger btn-lg px-4 py-2 rounded-pill shadow-sm hover-lift"
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
        </div>
      </div>

      <div className="container-fluid">
        <Row className="g-4">
          {/* COLUNA PRINCIPAL */}
          <Col lg={8}>
            <div className="info-card">
              <div className="p-5 position-relative">
                {/* STATUS E PRIORIDADE */}
                <div className="position-absolute top-0 end-0 p-4">
                  <div className="d-flex flex-column gap-2">
                    <div><StatusBadge status={order.status} /></div>
                    <div><PriorityBadge priority={order.priority} /></div>
                  </div>
                </div>

                {/* DESCRIÇÃO */}
                <div className="mb-5">
                  <h6 className="text-primary text-uppercase fw-bold mb-3 fs-5">
                    <i className="bi bi-chat-square-text-fill me-2"></i>
                    Descrição da Solicitação
                  </h6>
                  <div className="description-card">
                    <p>
                      {order.description || "Sem descrição fornecida."}
                    </p>
                  </div>
                </div>

                {/* ANEXO */}
                <AttachmentPreview order={order} baseUrl={baseUrl} />
              </div>
            </div>
          </Col>

          {/* COLUNA LATERAL */}
          <Col lg={4}>
            <div className="info-card p-5">
              <h3 className="text-white mb-5 fw-bold text-center position-relative pb-3">
                <i className="bi bi-gear-fill text-primary me-2"></i>
                Gestão da Ordem
                <div className="position-absolute bottom-0 start-50 translate-middle-x w-25 h-1 bg-gradient-primary rounded-pill"></div>
              </h3>

              {/* SOLICITANTE */}
              <div className="user-card mb-5">
                <div className="d-flex align-items-start gap-3">
                  <div className="avatar-circle-lg mt-1">
                    {order.user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <h6 className="text-white fw-bold mb-1 truncate">{order.user?.name || "Usuário não identificado"}</h6>
                    <small className="text-white-50 d-block truncate">{order.user?.email || "Email não disponível"}</small>
                  </div>
                </div>
              </div>

              {/* GRUPO */}
              <div className="group-card mb-5">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-info bg-opacity-20 p-3 rounded-circle shadow-sm">
                    <i className="bi bi-people-fill text-info fs-4"></i>
                  </div>
                  <div>
                    <h6 className="text-white mb-1 fw-bold">Grupo Responsável</h6>
                    <p className="text-white-50 mb-0">{order.group?.name || "Sem grupo vinculado"}</p>
                  </div>
                </div>
              </div>

              {/* TÉCNICO */}
              <div className="mb-5">
                <label className="text-white-50 small text-uppercase fw-bold mb-3 d-block">Técnico Designado</label>
                {order.technician ? (
                  <div className="technician-card">
                    <div className="d-flex align-items-center gap-3">
                      <div className="avatar-circle-lg">
                        {order.technician.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{order.technician.name}</h6>
                        <small className="opacity-75">Responsável pelo atendimento</small>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="no-technician-card">
                    <i className="bi bi-person-plus-fill"></i>
                    <h6>Aguardando Técnico</h6>
                    <button
                      className="btn btn-outline-primary btn-lg w-100 rounded-pill py-2 fw-bold"
                      onClick={() => onUpdateStatus(order.id, "in_progress")}
                      disabled={actionLoading}
                    >
                      <i className="bi bi-person-check me-2"></i>
                      Assumir este chamado
                    </button>
                  </div>
                )}
              </div>

              {/* STATUS SELECT */}
              <div className="status-section">
                <label className="text-white-50 small text-uppercase fw-bold mb-3 d-block">
                  Alterar Status
                </label>
                <select
                  className="form-select form-select-lg status-select"
                  value={order.status}
                  onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                  disabled={actionLoading}
                >
                  <option value="pending">⏳ Pendente</option>
                  <option value="open">📂 Abrir OS</option>
                  <option value="in_progress">🔧 Iniciar Atendimento</option>
                  <option value="resolved">✅ Marcar como Resolvido</option>
                  <option value="closed">🔒 Encerrar Definitivamente</option>
                </select>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}