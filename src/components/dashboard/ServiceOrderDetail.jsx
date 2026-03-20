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
      <span className={`badge border ${item.color}`} style={{ fontSize: "0.75rem" }}>
        {item.label.toUpperCase()}
      </span>
    );
  };

  // --- VALIDAÇÃO DE ENTRADA ---
  // Se order for apenas o ID (número) ou nulo, exibe um estado de carregamento amigável
  if (!order || typeof order !== "object") {
    return (
      <div className="text-center py-5 animate-in">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="text-dim">Sincronizando dados da OS #{order || ""}...</p>
        <button className="btn btn-outline-secondary mt-3" onClick={onBack}>
          <i className="bi bi-arrow-left me-2"></i>Voltar para Lista
        </button>
      </div>
    );
  }

  const actualId = order.id || order._id;

  return (
    <div className="group-detail-container animate-in w-100">
      
      {/* BARRA DE TOPO */}
      <div className="user-detail-header mb-4 p-3 d-flex align-items-center justify-content-between rounded-3 shadow-sm" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="header-left d-flex align-items-center">
          <button className="btn-filter-clear btn-back" onClick={onBack}>
            <i className="bi bi-arrow-left me-2"></i>Voltar
          </button>
          <div className="vertical-divider mx-3" style={{ height: "24px", width: "1px", background: "rgba(255,255,255,0.1)" }}></div>
          <div className="user-title-block">
            <span className="user-name-text fw-bold">
              Protocolo: <span className="text-primary">{order.protocol || "S/P"}</span>
            </span>
            <span className="user-id-text d-block text-dim small">ID do Sistema: {actualId}</span>
          </div>
        </div>

        <div className="header-actions">
          {isSystemAdmin && (
            <button
              className="btn btn-sm text-danger border-0 bg-danger bg-opacity-10"
              onClick={() => onDeleteOrder(actualId)}
              disabled={actionLoading}
            >
              <i className="bi bi-trash3 me-2"></i>Excluir OS
            </button>
          )}
        </div>
      </div>

      <Row className="g-4">
        {/* COLUNA ESQUERDA: DETALHES PRINCIPAIS */}
        <Col md={8}>
          <div className="info-card p-4 h-100 shadow-sm rounded-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h3 className="text-white mb-1 fw-bold">{order.title || "Ordem de Serviço"}</h3>
                <p className="text-dim small mb-0">
                  <i className="bi bi-calendar3 me-2"></i>
                  {order.created_at ? new Date(order.created_at).toLocaleString("pt-BR") : "Data não disponível"}
                </p>
              </div>
              <div className="text-end">
                <div className="mb-2">{getStatusBadge(order.status)}</div>
                <div>{getPriorityBadge(order.priority)}</div>
              </div>
            </div>

            <h6 className="text-primary-light text-uppercase fw-bold small mb-3">Descrição da Solicitação</h6>
            <div className="description-box p-3 rounded-3 mb-4" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-white mb-0" style={{ whiteSpace: "pre-line", lineHeight: "1.6", fontSize: "0.95rem" }}>
                {order.description || "Nenhuma descrição fornecida."}
              </p>
            </div>

            {/* SEÇÃO DE ANEXO CORRIGIDA */}
            <h6 className="text-primary-light text-uppercase fw-bold small mb-3">Evidências / Anexos</h6>
            {order.attachment_path ? (
              <div className="p-3 rounded-4 d-flex align-items-center justify-content-between shadow-sm" style={{ background: "rgba(13, 110, 253, 0.05)", border: "1px solid rgba(13, 110, 253, 0.15)" }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary bg-opacity-20 p-3 rounded-3 border border-primary border-opacity-25">
                    <i className="bi bi-file-earmark-arrow-down-fill text-primary fs-3"></i>
                  </div>
                  <div>
                    <span className="text-white d-block fw-bold mb-0">Arquivo em Anexo</span>
                    <small className="text-dim">{order.attachment_path.split('/').pop()}</small>
                  </div>
                </div>
                <a 
                  href={`${import.meta.env.VITE_API_URL}/storage/${order.attachment_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm px-4 rounded-pill shadow-sm"
                >
                  <i className="bi bi-box-arrow-up-right me-2"></i>Visualizar / Baixar
                </a>
              </div>
            ) : (
              <div className="p-4 rounded-3 text-center border border-secondary border-dashed border-opacity-25 bg-light bg-opacity-5">
                <p className="text-dim mb-0 small"><i className="bi bi-info-circle me-2"></i>Esta OS não possui anexos.</p>
              </div>
            )}
          </div>
        </Col>

        {/* COLUNA DIREITA: GESTÃO */}
        <Col md={4}>
          <div className="info-card p-4 mb-4 shadow-sm rounded-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <h5 className="text-white mb-4 fw-bold pb-2 border-bottom border-secondary border-opacity-25">Gestão da Ordem</h5>

            <div className="mb-4">
              <label className="text-dim small text-uppercase fw-bold mb-2 d-block">Solicitante</label>
              <div className="d-flex align-items-center p-3 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-50">
                <div className="avatar-circle me-3" style={{ width: "42px", height: "42px", background: "var(--bs-primary)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "white" }}>
                  {order.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="overflow-hidden">
                  <div className="text-white small fw-bold text-truncate">{order.user?.name || "Usuário não identificado"}</div>
                  <div className="text-dim text-truncate" style={{ fontSize: "0.75rem" }}>{order.user?.email || "Email não disponível"}</div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="text-dim small text-uppercase fw-bold mb-1 d-block">Grupo Responsável</label>
              <div className="text-white small bg-light bg-opacity-5 p-2 rounded">
                <i className="bi bi-people-fill text-primary me-2"></i>{order.group?.name || "Sem grupo vinculado"}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-dim small text-uppercase fw-bold mb-1 d-block">Técnico Atribuído</label>
              <div className="text-info small fw-bold bg-light bg-opacity-5 p-2 rounded">
                <i className="bi bi-person-badge-fill me-2"></i>{order.technician?.name || "Aguardando Técnico..."}
              </div>
            </div>

            <hr className="border-secondary opacity-25 my-4" />

            <div className="mt-2">
              <label className="text-warning small text-uppercase fw-bold mb-2 d-block">Alterar Status</label>
              <select
                className="form-select bg-dark text-white border-secondary border-opacity-50 shadow-none py-2"
                value={order.status || "pending"}
                onChange={(e) => onUpdateStatus(actualId, e.target.value)}
                disabled={actionLoading}
                style={{ borderRadius: "8px" }}
              >
                <option value="pending">Pendente</option>
                <option value="open">Em Aberto</option>
                <option value="in_progress">Iniciar Atendimento</option>
                <option value="resolved">Resolvido</option>
                <option value="closed">Fechar Definitivamente</option>
              </select>
              {actionLoading && <div className="text-primary small mt-2 animate-pulse">Atualizando servidor...</div>}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}