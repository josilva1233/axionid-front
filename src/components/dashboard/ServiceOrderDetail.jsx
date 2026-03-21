import { useState } from "react";
import { Badge, Row, Col, Card } from "react-bootstrap";

export default function ServiceOrderDetail({
  order,
  onBack,
  onUpdateStatus,
  onAssignTechnician,
  onDeleteOrder,
  actionLoading,
  isSystemAdmin,
}) {
  // Função para traduzir e colorir os badges de status
  const getStatusBadge = (status) => {
    const config = {
      pending: { color: "bg-warning text-dark", label: "PENDENTE" },
      open: { color: "bg-info text-white", label: "EM ABERTO" },
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
      <span className={`badge border ${item.color} px-2 py-1`} style={{ fontSize: "0.75rem", letterSpacing: '0.5px' }}>
        {item.label.toUpperCase()}
      </span>
    );
  };

  if (!order) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="text-dim">Carregando detalhes da OS...</p>
        <button className="btn-filter-clear" onClick={onBack}>Voltar</button>
      </div>
    );
  }

  return (
    <div className="group-detail-container animate-in w-100">
      {/* HEADER PADRONIZADO */}
      <div className="user-detail-header mb-4 p-3 d-flex align-items-center justify-content-between bg-dark rounded-4 border border-secondary">
        <div className="header-left d-flex align-items-center">
          <button className="btn-filter-clear btn-back d-flex align-items-center" onClick={onBack}>
            <i className="bi bi-arrow-left me-2"></i>
            Voltar
          </button>

          <div className="vertical-divider mx-3" style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }}></div>

          <div className="user-title-block">
            <h5 className="text-white mb-0 fw-bold">
              Protocolo: <span className="text-primary">{order.protocol}</span>
            </h5>
            <small className="text-dim">ID Interno: {order.id}</small>
          </div>
        </div>

        <div className="header-actions">
          {isSystemAdmin && (
            <button
              className="btn btn-outline-danger d-flex align-items-center"
              onClick={() => onDeleteOrder(order.id)}
              disabled={actionLoading}
              style={{ borderRadius: "8px", fontSize: '0.9rem' }}
            >
              <i className="bi bi-trash3 me-2"></i>
              Excluir Registro
            </button>
          )}
        </div>
      </div>

      <Row className="g-4">
        {/* COLUNA ESQUERDA: CONTEÚDO */}
        <Col lg={8}>
          <Card className="info-card bg-dark border-secondary p-4 rounded-4 h-100">
            <div className="d-flex justify-content-between align-items-start mb-4 pb-3 border-bottom border-secondary border-opacity-25">
              <div>
                <h2 className="text-white fw-bold mb-2">{order.title}</h2>
                <div className="d-flex align-items-center text-dim small">
                  <i className="bi bi-calendar3 me-2"></i>
                  Aberto em: {order.created_at ? new Date(order.created_at).toLocaleString("pt-BR") : "---"}
                </div>
              </div>
              <div className="d-flex flex-column align-items-end gap-2">
                {getStatusBadge(order.status)}
                {getPriorityBadge(order.priority)}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-primary-light text-uppercase fw-bold small mb-3 d-block" style={{ letterSpacing: '1px' }}>
                Detalhamento da Solicitação
              </label>
              <div className="description-box p-4 rounded-4 text-white shadow-sm" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)", lineHeight: "1.8" }}>
                {order.description}
              </div>
            </div>

            {/* ANEXOS */}
            {order.attachment_path && (
              <div className="mt-auto pt-3">
                <label className="text-dim text-uppercase fw-bold small mb-3 d-block">Documentos e Evidências</label>
                <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-black bg-opacity-25 border border-secondary border-opacity-25">
                  <div 
                    className="attachment-preview rounded-3 overflow-hidden border border-secondary"
                    style={{ width: "80px", height: "80px", cursor: "pointer" }}
                    onClick={() => window.open(`${import.meta.env.VITE_API_URL}/storage/${order.attachment_path}`, "_blank")}
                  >
                    {["jpg", "jpeg", "png", "webp"].some(ext => order.attachment_path.toLowerCase().endsWith(ext)) ? (
                      <img src={`${import.meta.env.VITE_API_URL}/storage/${order.attachment_path}`} alt="Preview" className="w-100 h-100 object-fit-cover" />
                    ) : (
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-dark">
                        <i className="bi bi-file-earmark-text text-primary fs-2"></i>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <span className="text-white d-block small fw-bold text-truncate" style={{ maxWidth: '200px' }}>
                      {order.attachment_path.split("/").pop()}
                    </span>
                    <a 
                      href={`${import.meta.env.VITE_API_URL}/storage/${order.attachment_path}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary small text-decoration-none d-flex align-items-center mt-1"
                    >
                      Visualizar arquivo completo <i className="bi bi-box-arrow-up-right ms-2" style={{ fontSize: '0.7rem' }}></i>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* COLUNA DIREITA: GESTÃO */}
        <Col lg={4}>
          <div className="d-flex flex-column gap-4">
            {/* CARD DE PESSOAS */}
            <Card className="info-card bg-dark border-secondary p-4 rounded-4 shadow-sm">
              <h6 className="text-white mb-4 fw-bold d-flex align-items-center">
                <i className="bi bi-person-gear me-2 text-primary"></i> Envolvidos
              </h6>

              <div className="mb-4">
                <label className="text-dim small text-uppercase fw-bold mb-2 d-block">Solicitante</label>
                <div className="d-flex align-items-center p-2 rounded-3 bg-black bg-opacity-25 border border-secondary border-opacity-50">
                  <div className="avatar-circle me-3 bg-primary bg-opacity-25 text-primary fw-bold d-flex align-items-center justify-content-center rounded-circle" style={{ width: "38px", height: "38px" }}>
                    {order.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-white small fw-bold text-truncate">{order.user?.name}</div>
                    <div className="text-dim text-truncate" style={{ fontSize: "0.7rem" }}>{order.user?.email}</div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-dim small text-uppercase fw-bold mb-2 d-block">Departamento / Grupo</label>
                <div className="text-white bg-dark p-2 rounded-3 border border-secondary border-opacity-25 small">
                  <i className="bi bi-shield-lock me-2 text-primary-light"></i>
                  {order.group?.name || "Não atribuído"}
                </div>
              </div>

              <div>
                <label className="text-dim small text-uppercase fw-bold mb-2 d-block">Técnico Responsável</label>
                <div className="text-primary bg-primary bg-opacity-10 p-2 rounded-3 border border-primary border-opacity-25 small">
                  <i className="bi bi-person-badge me-2"></i>
                  {order.technician?.name || "Aguardando designação"}
                </div>
              </div>
            </Card>

            {/* CARD DE AÇÕES */}
            <Card className="info-card bg-dark border-secondary p-4 rounded-4 shadow-sm">
              <h6 className="text-white mb-4 fw-bold d-flex align-items-center">
                <i className="bi bi-arrow-repeat me-2 text-primary"></i> Fluxo de Trabalho
              </h6>
              
              <label className="text-dim small text-uppercase fw-bold mb-2 d-block">Mudar Status da OS</label>
              <select
                className="custom-input-dark w-100 p-2 rounded-3"
                style={{ cursor: 'pointer' }}
                value={order.status}
                onChange={(e) => onUpdateStatus(order.id || order._id, e.target.value)}
                disabled={actionLoading}
              >
                <option value="pending">Pendente</option>
                <option value="open">Abrir OS</option>
                <option value="in_progress">Iniciar Atendimento</option>
                <option value="resolved">Marcar como Resolvido</option>
                <option value="closed">Encerrar Definitivamente</option>
              </select>
              
              <div className="mt-3 p-2 bg-info bg-opacity-10 border border-info border-opacity-25 rounded-3">
                <small className="text-info d-flex align-items-start">
                  <i className="bi bi-info-circle me-2 mt-1"></i>
                  Alterar o status atualizará o histórico de auditoria desta OS.
                </small>
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}