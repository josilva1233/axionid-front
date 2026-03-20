import { useState } from "react";
import { Badge, Row, Col } from "react-bootstrap";

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
  completed: { color: "bg-success", label: "RESOLVIDO" },
  canceled: { color: "bg-secondary", label: "CANCELADO" },
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
      <span
        className={`badge border ${item.color}`}
        style={{ fontSize: "0.7rem" }}
      >
        {item.label.toUpperCase()}
      </span>
    );
  };

  if (!order) {
    return (
      <div className="text-center py-5">
        <p className="text-dim">Carregando detalhes da OS...</p>
        <button className="btn-filter-clear" onClick={onBack}>
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="group-detail-container animate-in w-100">
      {/* BARRA DE TOPO PADRONIZADA (Igual ao GroupDetail) */}
      <div className="user-detail-header mb-4 p-3 d-flex align-items-center justify-content-between">
        <div className="header-left d-flex align-items-center">
          <button className="btn-filter-clear btn-back" onClick={onBack}>
            <i className="bi bi-arrow-left me-2"></i>
            Voltar
          </button>

          <div className="vertical-divider mx-3"></div>

          <div className="user-title-block">
            <span className="user-name-text">
              Protocolo: <span className="text-primary">{order.protocol}</span>
            </span>
            <span className="user-id-text">OS ID: {order.id}</span>
          </div>
        </div>

        <div className="header-actions d-flex gap-2">
          {isSystemAdmin && (
            <button
              className="btn-critical-primary"
              onClick={() => onDeleteOrder(order.id)}
              disabled={actionLoading}
              style={{
                background: "var(--bs-danger)",
                border: "none",
                padding: "8px 15px",
                borderRadius: "8px",
              }}
            >
              <i className="bi bi-trash3 me-2"></i>
              Excluir OS
            </button>
          )}
        </div>
      </div>

      <Row className="g-4">
        {/* COLUNA DA ESQUERDA: INFORMAÇÕES PRINCIPAIS */}
        <Col md={8}>
          <div className="info-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h3 className="text-white mb-1 fw-bold">{order.title}</h3>
<p className="text-dim">
  Aberto em:{" "}
  {order.created_at
    ? new Date(order.created_at).toLocaleString("pt-BR")
    : "Data inválida"}
</p>

              </div>
              <div className="text-end">
                <div className="mb-2">{getStatusBadge(order.status)}</div>
                <div>{getPriorityBadge(order.priority)}</div>
              </div>
            </div>

            <h6 className="text-primary-light text-uppercase fw-bold small mb-2">
              Descrição da Solicitação
            </h6>
            <div
              className="description-box p-3 rounded-3 mb-4"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <p
                className="text-white mb-0"
                style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}
              >
                {order.description}
              </p>
            </div>

            {/* SEÇÃO DE ANEXO */}
            {order.attachment_path && (
              <div
                className="mt-4 p-3 rounded-4"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <h6
                  className="text-white-50 mb-3"
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  <i className="bi bi-paperclip me-2"></i>Anexo do Chamado
                </h6>

                <div className="d-flex flex-column flex-md-row align-items-start gap-3">
                  {/* PREVIEW DA IMAGEM (Se for jpg, png, etc) */}
                  {["jpg", "jpeg", "png", "webp"].some((ext) =>
                    order.attachment_path.toLowerCase().endsWith(ext),
                  ) ? (
                    <div
                      className="rounded-3 overflow-hidden border border-secondary"
                      style={{
                        width: "120px",
                        height: "120px",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        window.open(
                          `${import.meta.env.VITE_API_URL}/storage/${order.attachment_path}`,
                          "_blank",
                        )
                      }
                    >
                      <img
                        src={`${import.meta.env.VITE_API_URL}/storage/${order.attachment_path}`}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ) : (
                    /* ÍCONE PARA ARQUIVOS QUE NÃO SÃO IMAGEM (PDF, ETC) */
                    <div
                      className="d-flex align-items-center justify-content-center bg-dark rounded-3 border border-secondary"
                      style={{ width: "120px", height: "120px" }}
                    >
                      <i
                        className="bi bi-file-earmark-pdf text-primary"
                        style={{ fontSize: "2rem" }}
                      ></i>
                    </div>
                  )}

                  <div className="d-flex flex-column justify-content-between h-100 py-1">
                    <div>
                      <span className="text-white d-block fw-bold mb-1">
                        Documentação/Evidência
                      </span>
                      <small className="text-white-50 d-block mb-3">
                        {order.attachment_path.split("/").pop()}
                      </small>
                    </div>

                    <a
                      href={`${import.meta.env.VITE_API_URL}/storage/${order.attachment_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bw-btn-table-action btn-sm text-decoration-none text-center"
                      style={{ width: "fit-content" }}
                    >
                      <i className="bi bi-box-arrow-up-right me-2"></i>Abrir em
                      tela cheia
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Col>

        {/* COLUNA DA DIREITA: STATUS E RESPONSÁVEIS */}
        <Col md={4}>
          <div className="info-card p-4 mb-4">
            <h5 className="text-white mb-4 fw-bold">Gestão da Ordem</h5>

            <div className="mb-4">
              <label className="text-dim small text-uppercase fw-bold mb-2 d-block">
                Solicitante
              </label>
              <div className="d-flex align-items-center p-2 rounded bg-dark border border-secondary">
                <div
                  className="avatar-circle me-2"
                  style={{
                    width: "32px",
                    height: "32px",
                    background: "#343a40",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                  }}
                >
                  {order.user?.name?.charAt(0)}
                </div>
                <div>
                  <div className="text-white small fw-bold">
                    {order.user?.name}
                  </div>
                  <div className="text-dim" style={{ fontSize: "0.7rem" }}>
                    {order.user?.email}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-dim small text-uppercase fw-bold mb-2 d-block">
                Grupo Responsável
              </label>
              <div className="text-white">
                <i className="bi bi-people me-2"></i>
                {order.group?.name || "Sem grupo vinculado"}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-dim small text-uppercase fw-bold mb-2 d-block">
                Técnico Designado
              </label>
              <div className="text-primary">
                <i className="bi bi-person-badge me-2"></i>
                {order.technician?.name || "Aguardando Técnico..."}
              </div>
            </div>

            <hr className="border-secondary opacity-25" />
            {/* Ações Rápidas (Selects de Mudança) */}
            <div className="mt-4">
              <label className="text-dim small text-uppercase fw-bold mb-2 d-block">
                Alterar Status
              </label>
              <select
                className="custom-input-dark w-100 py-2 mb-3"
                value={order.status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                 const actualId = order?.id;


                  console.log("Status da OS para envio:", {
                    id: actualId,
                    status: newStatus,
                  });

                  // Chamamos a função do pai
                  onUpdateStatus(actualId, newStatus);
                }}
                disabled={actionLoading}
              >
                <option value="pending">Pendente</option>
                <option value="open">Abrir OS</option>
                <option value="in_progress">Iniciar Atendimento</option>
                <option value="completed">Marcar como Resolvido</option>
<option value="canceled">Encerrar Definitivamente</option>

              </select>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}
