import { useState } from "react";
import { Badge, Row, Col } from "react-bootstrap";

export default function ServiceOrderDetail({
  order,
  onBack,
  onUpdateStatus,
  onDeleteOrder,
  actionLoading,
  isSystemAdmin,
}) {
  // --- HELPERS DE INTERFACE ---
  
  const getStatusBadge = (status) => {
    const config = {
      pending: { color: "bg-warning text-dark", label: "PENDENTE" },
      open: { color: "bg-info text-white", label: "EM ABERTO" },
      in_progress: { color: "bg-primary", label: "EM ATENDIMENTO" },
      resolved: { color: "bg-success", label: "RESOLVIDO" },
      closed: { color: "bg-secondary", label: "FECHADO" },
    };
    const item = config[status] || config.pending;
    return <Badge className={item.color}>{item.label}</Badge>;
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

  // --- VALIDAÇÃO DE ENTRADA ---
  
  // Se 'order' for apenas o número (ID), ou nulo, exibe loading.
  if (!order || typeof order !== "object") {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3"></div>
        <p className="text-dim">Carregando detalhes da OS #{order || ""}...</p>
        <button className="btn-filter-clear" onClick={onBack}>Voltar para Lista</button>
      </div>
    );
  }

  // Identifica o ID real para as funções de atualização
  const actualId = order.id || order._id;

  return (
    <div className="group-detail-container animate-in w-100">
      
      {/* HEADER DE AÇÕES */}
      <div className="user-detail-header mb-4 p-3 d-flex align-items-center justify-content-between">
        <div className="header-left d-flex align-items-center">
          <button className="btn-filter-clear btn-back" onClick={onBack}>
            <i className="bi bi-arrow-left me-2"></i>Voltar
          </button>
          <div className="vertical-divider mx-3"></div>
          <div className="user-title-block">
            <span className="user-name-text">
              Protocolo: <span className="text-primary">{order.protocol || "N/A"}</span>
            </span>
            <span className="user-id-text">OS ID: {actualId}</span>
          </div>
        </div>

        <div className="header-actions">
          {isSystemAdmin && (
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => onDeleteOrder(actualId)}
              disabled={actionLoading}
            >
              <i className="bi bi-trash3 me-2"></i>Excluir Chamado
            </button>
          )}
        </div>
      </div>

      <Row className="g-4">
        {/* COLUNA ESQUERDA: CONTEÚDO */}
        <Col md={8}>
          <div className="info-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h3 className="text-white mb-1 fw-bold">{order.title || "Sem Título"}</h3>
                <p className="text-dim">
                  Aberto em: {order.created_at ? new Date(order.created_at).toLocaleString("pt-BR") : "---"}
                </p>
              </div>
              <div className="text-end">
                <div className="mb-2">{getStatusBadge(order.status)}</div>
                <div>{getPriorityBadge(order.priority)}</div>
              </div>
            </div>

            <h6 className="text-primary-light text-uppercase fw-bold small mb-2">Descrição do Problema</h6>
            <div className="description-box p-3 rounded-3 mb-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <p className="text-white mb-0" style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}>
                {order.description || "Nenhuma descrição fornecida."}
              </p>
            </div>

            {/* SEÇÃO DE ANEXO CORRIGIDA */}
            {order.attachment_path ? (
              <div className="mt-4 p-3 rounded-4" style={{ background: "rgba(13, 110, 253, 0.05)", border: "1px solid rgba(13, 110, 253, 0.2)" }}>
                <h6 className="text-white-50 mb-3 small text-uppercase">
                  <i className="bi bi-paperclip me-2"></i>Arquivo de Evidência
                </h6>
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-dark p-3 rounded border border-secondary">
                    <i className="bi bi-file-earmark-arrow-down text-primary fs-2"></i>
                  </div>
                  <div>
                    <span className="text-white d-block small fw-bold mb-2">Clique abaixo para visualizar ou baixar</span>
                    <a 
                      href={`${import.meta.env.VITE_API_URL}/storage/${order.attachment_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm px-4"
                    >
                      <i className="bi bi-download me-2"></i>Baixar Anexo
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3 text-center border border-secondary border-dashed rounded text-dim small">
                Esta ordem de serviço não possui anexos.
              </div>
            )}
          </div>
        </Col>

        {/* COLUNA DIREITA: GESTÃO */}
        <Col md={4}>
          <div className="info-card p-4 mb-4">
            <h5 className="text-white mb-4 fw-bold border-bottom border-secondary pb-2">Gestão da Ordem</h5>

            <div className="mb-4">
              <label className="text-dim small text-uppercase fw-bold mb-2 d-block">Solicitante</label>
              <div className="d-flex align-items-center p-2 rounded bg-dark border border-secondary">
                <div className="avatar-circle me-2" style={{ width: "32px", height: "32px", background: "var(--bs-primary)", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                  {order.user?.name?.charAt(0) || "U"}
                </div>
                <div className="overflow-hidden">
                  <div className="text-white small fw-bold text-truncate">{order.user?.name || "Usuário"}</div>
                  <div className="text-dim text-truncate" style={{ fontSize: "0.7rem" }}>{order.user?.email}</div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-dim small text-uppercase fw-bold mb-2 d-block">Grupo / Equipe</label>
              <div className="text-white small">
                <i className="bi bi-people me-2"></i>{order.group?.name || "Sem grupo"}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-dim small text-uppercase fw-bold mb-2 d-block">Técnico Atribuído</label>
              <div className="text-primary small fw-bold">
                <i className="bi bi-person-badge me-2"></i>{order.technician?.name || "Aguardando técnico..."}
              </div>
            </div>

            <hr className="border-secondary opacity-25 my-4" />

            <div className="mt-2">
              <label className="text-warning small text-uppercase fw-bold mb-2 d-block">Alterar Status</label>
              <select
                className="custom-input-dark w-100 py-2"
                value={order.status || "pending"}
                onChange={(e) => onUpdateStatus(actualId, e.target.value)}
                disabled={actionLoading}
              >
                <option value="pending">Pendente</option>
                <option value="open">Aberto</option>
                <option value="in_progress">Em Atendimento</option>
                <option value="resolved">Resolvido</option>
                <option value="closed">Encerrado</option>
              </select>
              {actionLoading && <small className="text-primary d-block mt-2">Atualizando...</small>}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}