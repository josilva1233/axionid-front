import { Badge, Row, Col } from "react-bootstrap";

export default function ServiceOrderDetail({
  order,
  onBack,
  onUpdateStatus,
  onDeleteOrder,
  actionLoading,
  isSystemAdmin,
}) {
  console.log("ORDER COMPLETO:", order);

  const API_URL = import.meta.env.VITE_API_URL;

  // =========================
  // STATUS
  // =========================
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

  // =========================
  // PRIORIDADE
  // =========================
  const getPriorityBadge = (priority) => {
    if (!priority) return null;

    const config = {
      low: { color: "border-secondary text-dim", label: "Baixa" },
      medium: { color: "border-info text-info", label: "Média" },
      high: { color: "border-warning text-warning", label: "Alta" },
      urgent: { color: "border-danger text-danger", label: "Urgente" },
    };

    const item = config[priority] || config.low;

    return (
      <span className={`badge border ${item.color}`}>
        {item.label.toUpperCase()}
      </span>
    );
  };

  // =========================
  // DATA SEGURA
  // =========================
  const formatDate = (date) => {
    if (!date) return "Data inválida";

    const d = new Date(date);
    if (isNaN(d)) return "Data inválida";

    return d.toLocaleString("pt-BR");
  };

  // =========================
  // ANEXO URL
  // =========================
  const getAttachmentUrl = () => {
    if (!order?.attachment_path) return null;

    // Corrige duplicação de "storage/"
    const cleanPath = order.attachment_path.replace("storage/", "");

    return `${API_URL}/storage/${cleanPath}`;
  };

  const attachmentUrl = getAttachmentUrl();

  const isImage = (path) => {
    if (!path) return false;
    return ["jpg", "jpeg", "png", "webp"].some((ext) =>
      path.toLowerCase().endsWith(ext)
    );
  };

  // =========================
  // LOADING
  // =========================
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
      {/* HEADER */}
      <div className="user-detail-header mb-4 p-3 d-flex justify-content-between">
        <div>
          <button className="btn-filter-clear" onClick={onBack}>
            ← Voltar
          </button>

          <div className="mt-2">
            <strong>Protocolo:</strong> {order.protocol || "—"}
            <br />
            <small>OS ID: {order.id}</small>
          </div>
        </div>

        {isSystemAdmin && (
          <button
            className="btn btn-danger"
            onClick={() => onDeleteOrder(order.id)}
            disabled={actionLoading}
          >
            Excluir OS
          </button>
        )}
      </div>

      <Row>
        {/* ESQUERDA */}
        <Col md={8}>
          <div className="info-card p-4">
            <h3>{order.title || "Sem título"}</h3>

            <p className="text-dim">
              Aberto em: {formatDate(order.created_at)}
            </p>

            <div className="mb-2">
              {getStatusBadge(order.status)}
            </div>

            <div className="mb-3">
              {getPriorityBadge(order.priority)}
            </div>

            <h6>Descrição</h6>
            <p>{order.description || "Sem descrição"}</p>

            {/* =========================
                ANEXO
            ========================= */}
            {attachmentUrl ? (
              <div className="mt-4">
                <h6>Anexo</h6>

                {isImage(order.attachment_path) ? (
                  <img
                    src={attachmentUrl}
                    alt="Anexo"
                    style={{ width: "150px", cursor: "pointer" }}
                    onClick={() => window.open(attachmentUrl, "_blank")}
                  />
                ) : (
                  <a href={attachmentUrl} target="_blank">
                    📄 Abrir documento
                  </a>
                )}

                <p style={{ fontSize: "12px" }}>
                  {order.attachment_path}
                </p>
              </div>
            ) : (
              <p className="text-danger mt-3">Sem anexo</p>
            )}
          </div>
        </Col>

        {/* DIREITA */}
        <Col md={4}>
          <div className="info-card p-4">
            <h5>Gestão da Ordem</h5>

            <p>
              <strong>Solicitante:</strong><br />
              {order.user?.name || "—"}
            </p>

            <p>
              <strong>Grupo:</strong><br />
              {order.group?.name || "Sem grupo"}
            </p>

            <p>
              <strong>Técnico:</strong><br />
              {order.technician?.name || "Aguardando..."}
            </p>

            <hr />

            <label>Alterar Status</label>
            <select
              value={order.status}
              onChange={(e) =>
                onUpdateStatus(order.id, e.target.value)
              }
              className="form-control"
            >
              <option value="pending">Pendente</option>
              <option value="open">Abrir OS</option>
              <option value="in_progress">Em Atendimento</option>
              <option value="completed">Resolvido</option>
              <option value="canceled">Cancelado</option>
            </select>
          </div>
        </Col>
      </Row>
    </div>
  );
}
