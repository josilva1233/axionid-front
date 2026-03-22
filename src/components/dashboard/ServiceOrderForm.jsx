import { useState } from "react";
import { Badge, OverlayTrigger, Tooltip, Spinner } from "react-bootstrap";
import "../../ServiceOrderDetail.css";

const STATUS_CONFIG = {
  pending: { color: "bg-warning text-dark", label: "PENDENTE" },
  open: { color: "bg-info text-white", label: "EM ABERTO" },
  in_progress: { color: "bg-primary", label: "EM ATENDIMENTO" },
  resolved: { color: "bg-success", label: "RESOLVIDO" },
  closed: { color: "bg-secondary", label: "FECHADO" },
};

const PRIORITY_CONFIG = {
  low: { color: "bg-success-subtle text-success", label: "Baixa" },
  medium: { color: "bg-info-subtle text-info", label: "Média" },
  high: { color: "bg-warning-subtle text-warning", label: "Alta" },
  urgent: { color: "bg-danger-subtle text-danger", label: "URGENTE!" },
};

const StatusBadge = ({ status }) => {
  const item = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return <Badge pill className={item.color}>{item.label}</Badge>;
};

const PriorityBadge = ({ priority }) => {
  const item = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;
  return <Badge pill className={`border fw-bold ${item.color}`}>{item.label}</Badge>;
};

const AttachmentPreview = ({ order, baseUrl }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileName = order.attachment_path?.split("/").pop() || "anexo";
  const fullUrl = `${baseUrl}/storage/${order.attachment_path}`;

  if (!order.attachment_path) return null;

  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(order.attachment_path);

  return (
    <div className="attachment-section">
      <h6 className="attachment-title">
        <i className="bi bi-paperclip text-warning me-2"></i>
        Evidência Anexada
      </h6>
      
      <div className="attachment-container">
        <div className="attachment-preview" onClick={() => window.open(fullUrl, "_blank")}>
          {!imageLoaded && !imageError && (
            <div className="loading-overlay-img">
              <Spinner animation="grow" variant="primary" size="sm" />
              <span className="text-white fw-bold small">Carregando...</span>
            </div>
          )}
          
          {isImage && !imageError ? (
            <img 
              src={fullUrl}
              alt="Preview da evidência"
              className="attachment-img"
              style={{ opacity: imageLoaded ? 1 : 0 }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="attachment-placeholder">
              <i className="bi bi-file-earmark-fill"></i>
              <div className="attachment-info">
                <div className="fw-bold">{fileName}</div>
                <small>Clique para visualizar</small>
              </div>
            </div>
          )}
          
          <div className="attachment-overlay">
            <i className="bi bi-zoom-in"></i>
          </div>
        </div>
        
        <div className="attachment-actions">
          <h5 className="attachment-name">📎 {fileName}</h5>
          <span className="badge-light">Evidência do chamado</span>
          <div className="attachment-buttons">
            <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="btn-outline-light">
              <i className="bi bi-eye-fill me-2"></i> Visualizar
            </a>
            <a href={fullUrl} download={fileName} className="btn-primary">
              <i className="bi bi-download me-2"></i> Download
            </a>
          </div>
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
      <div className="detail-loading">
        <Spinner animation="border" variant="primary" />
        <h5>Carregando detalhes da OS...</h5>
        <button className="btn-secondary" onClick={onBack}>Voltar</button>
      </div>
    );
  }

  return (
    <div className="service-order-detail-container">
      <div className="detail-header">
        <div className="detail-header-content">
          <div className="header-left">
            <button className="btn-back" onClick={onBack}>
              <i className="bi bi-arrow-left me-2"></i> Voltar
            </button>
            <div className="protocol-badge">
              <strong>#{order.protocol || order.id}</strong>
            </div>
            <div className="order-info">
              <h2 className="order-title">{order.title}</h2>
              <div className="order-meta">
                <span><i className="bi bi-calendar3 me-1"></i>{new Date(order.created_at).toLocaleString("pt-BR")}</span>
                <span><i className="bi bi-hash me-1"></i>ID: {order.id}</span>
              </div>
            </div>
          </div>

          <div className="header-actions">
            {isSystemAdmin && (
              <OverlayTrigger placement="bottom" overlay={<Tooltip>Excluir permanentemente</Tooltip>}>
                <button className="btn-delete-permanent" onClick={() => onDeleteOrder(order.id)} disabled={actionLoading}>
                  <i className="bi bi-trash3-fill me-2"></i> Excluir
                </button>
              </OverlayTrigger>
            )}
          </div>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-main">
          <div className="info-card">
            <div className="info-card-content">
              <div className="status-priority-badges">
                <StatusBadge status={order.status} />
                <PriorityBadge priority={order.priority} />
              </div>

              <div className="description-section">
                <h6 className="section-title">
                  <i className="bi bi-chat-square-text-fill me-2"></i>
                  Descrição da Solicitação
                </h6>
                <div className="description-card">
                  <p>{order.description || "Sem descrição fornecida."}</p>
                </div>
              </div>

              <AttachmentPreview order={order} baseUrl={baseUrl} />
            </div>
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="info-card">
            <h3 className="sidebar-title">
              <i className="bi bi-gear-fill text-primary me-2"></i>
              Gestão da Ordem
            </h3>

            <div className="user-card">
              <div className="avatar-circle-lg">
                {order.user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="user-info">
                <h6 className="user-name">{order.user?.name || "Usuário não identificado"}</h6>
                <small className="user-email">{order.user?.email || "Email não disponível"}</small>
              </div>
            </div>

            <div className="group-card">
              <div className="group-icon">
                <i className="bi bi-people-fill"></i>
              </div>
              <div>
                <h6 className="group-title">Grupo Responsável</h6>
                <p className="group-name">{order.group?.name || "Sem grupo vinculado"}</p>
              </div>
            </div>

            <div className="technician-section">
              <label className="section-label">Técnico Designado</label>
              {order.technician ? (
                <div className="technician-card">
                  <div className="avatar-circle-sm">
                    {order.technician.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h6 className="technician-name">{order.technician.name}</h6>
                    <small>Responsável pelo atendimento</small>
                  </div>
                </div>
              ) : (
                <div className="no-technician-card">
                  <i className="bi bi-person-plus-fill"></i>
                  <h6>Aguardando Técnico</h6>
                  <button
                    className="btn-primary"
                    onClick={() => onUpdateStatus(order.id, "in_progress")}
                    disabled={actionLoading}
                  >
                    <i className="bi bi-person-check me-2"></i> Assumir este chamado
                  </button>
                </div>
              )}
            </div>

            <div className="status-section">
              <label className="section-label">Alterar Status</label>
              <select
                className="status-select"
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
        </div>
      </div>
    </div>
  );
}