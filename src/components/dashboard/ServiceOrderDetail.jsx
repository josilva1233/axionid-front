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
  
  // 1. TRAVA DE SEGURANÇA: Se o order não existir ou não tiver ID, mostra o Loading.
  // Isso evita que o React tente ler propriedades de 'null' e dê tela branca.
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

  // Helper para Cores de Status
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

  // Helper para Cores de Prioridade
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
      
      {/* HEADER: Protocolo e Ações */}
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
            <small className="text-dim">ID do Chamado: #{order.id}</small>
          </div>
        </div>

        <div className="header-actions">
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
      </div>

      <Row className="g-4">
        {/* COLUNA ESQUERDA: DETALHES DO PROBLEMA */}
        <Col lg={8}>
          <div className="info-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div className="pe-3">
                <h3 className="text-white mb-2 fw-bold">{order.title || "Sem Título"}</h3>
                <div className="d-flex flex-wrap gap-3 text-dim small">
                  <span><i className="bi bi-calendar3 me-1"></i> {order.created_at ? new Date(order.created_at).toLocaleString("pt-BR") : "Data Indefinida"}</span>
                  <span><i className="bi bi-people me-1"></i> {order.group?.name || "Sem Grupo"}</span>
                </div>
              </div>
              <div className="text-end d-flex flex-column gap-2 align-items-end">
                {getStatusBadge(order.status)}
                {getPriorityBadge(order.priority)}
              </div>
            </div>

            <h6 className="text-primary-light text-uppercase fw-bold small mb-2" style={{ letterSpacing: '1px' }}>Descrição da Solicitação</h6>
            <div 
              className="description-box p-3 rounded-3 mb-4" 
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="text-white mb-0" style={{ whiteSpace: "pre-line", lineHeight: "1.7", fontSize: '0.95rem' }}>
                {order.description || "Nenhuma descrição detalhada fornecida."}
              </p>
            </div>

            {/* SEÇÃO DE ANEXOS (Se houver) */}
            {order.attachment_path && (
              <div className="mt-4 p-3 rounded bg-dark border border-secondary border-opacity-25">
                <h6 className="text-dim small text-uppercase mb-3"><i className="bi bi-paperclip me-1"></i> Evidência Anexada</h6>
                <div className="d-flex align-items-center gap-3">
                   <div className="bg-black rounded d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                      <i className="bi bi-file-earmark-image text-primary fs-4"></i>
                   </div>
                   <a 
                    href={`${import.meta.env.VITE_API_URL}/storage/${order.attachment_path}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-light"
                   >
                     Visualizar Anexo
                   </a>
                </div>
              </div>
            )}
          </div>
        </Col>

        {/* COLUNA DIREITA: GESTÃO E STATUS */}
        <Col lg={4}>
          <div className="info-card p-4">
            <h5 className="text-white mb-4 fw-bold pb-2 border-bottom border-secondary border-opacity-25">Gestão de Atendimento</h5>

            {/* INFO DO SOLICITANTE */}
            <div className="mb-4">
              <label className="text-dim small text-uppercase fw-bold mb-2 d-block">Solicitado por</label>
              <div className="d-flex align-items-center p-2 rounded bg-dark border border-secondary border-opacity-25 overflow-hidden">
                <div className="avatar-circle me-3 bg-secondary flex-shrink-0" style={{ width: "40px", height: "40px", borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {order.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="overflow-hidden">
                  <div className="text-white small fw-bold text-truncate">{order.user?.name || "Usuário Desconhecido"}</div>
                  <div className="text-dim text-truncate" style={{ fontSize: "0.75rem" }}>{order.user?.email}</div>
                </div>
              </div>
            </div>

            {/* SELETOR DE STATUS */}
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

            <hr className="my-4 border-secondary opacity-25" />

            {/* TÉCNICO DESIGNADO */}
            <div className="mb-2">
              <label className="text-dim small text-uppercase fw-bold mb-2 d-block">Técnico Responsável</label>
              {order.technician ? (
                <div className="d-flex align-items-center p-2 rounded bg-primary bg-opacity-10 border border-primary border-opacity-25">
                  <i className="bi bi-person-check-fill text-primary me-2 fs-5"></i>
                  <div className="overflow-hidden">
                    <div className="text-primary small fw-bold text-truncate">{order.technician.name}</div>
                    <div className="text-dim" style={{ fontSize: "0.65rem" }}>Técnico de Suporte</div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded border border-secondary border-dashed text-center bg-white-5">
                  <span className="text-dim d-block small mb-3">Nenhum técnico assumiu esta OS ainda.</span>
                  <button
                    className="btn btn-sm btn-primary w-100 py-2 fw-bold"
                    onClick={() => onUpdateStatus(order.id, "in_progress")}
                    disabled={actionLoading}
                  >
                    <i className="bi bi-hand-index-thumb me-2"></i> Assumir Chamado
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