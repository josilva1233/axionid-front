import { useState } from "react";
import { Badge, Row, Col, OverlayTrigger, Tooltip, Spinner } from "react-bootstrap";

export default function ServiceOrderDetail({
  order,
  onBack,
  onUpdateStatus,
  onAssignTechnician,
  onDeleteOrder,
  actionLoading,
  isSystemAdmin,
}) {
  const getStatusBadge = (status) => {
    const config = {
      pending: { color: "bg-warning text-dark", label: "PENDENTE" },
      open: { color: "bg-info text-white", label: "EM ABERTO" },
      in_progress: { color: "bg-primary", label: "EM ATENDIMENTO" },
      resolved: { color: "bg-success", label: "RESOLVIDO" },
      closed: { color: "bg-secondary", label: "FECHADO" },
    };
    const item = config[status] || config.pending;
    return <Badge pill bg={item.color.split(' ')[0]} className={item.color}>{item.label}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const config = {
      low: { color: "bg-success-subtle text-success border-success", label: "Baixa" },
      medium: { color: "bg-info-subtle text-info border-info", label: "Média" },
      high: { color: "bg-warning-subtle text-warning border-warning", label: "Alta" },
      urgent: { color: "bg-danger-subtle text-danger border-danger", label: "URGENTE!" },
    };
    const item = config[priority] || config.low;
    return (
      <Badge pill bg="" className={`border fw-bold ${item.color}`} style={{ fontSize: "0.75rem" }}>
        {item.label}
      </Badge>
    );
  };

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
    <div className="group-detail-container animate-in w-100 min-vh-100">
      {/* HEADER MODERNO COM SHADOW E HOVER */}
      <div className="user-detail-header bg-dark border-bottom border-primary border-opacity-25 mb-4 shadow-lg">
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
                <div className="protocol-badge bg-gradient-primary text-white px-4 py-2 rounded-pill shadow me-3">
                  <strong>#{order.protocol}</strong>
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
                      className="btn btn-danger btn-lg px-4 py-2 rounded-pill shadow-sm hover-shake"
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
          {/* COLUNA PRINCIPAL - 70% */}
          <Col lg={8}>
            <div className="info-card bg-dark border border-secondary-subtle rounded-4 shadow-lg overflow-hidden h-100">
              <div className="p-5 position-relative">
                {/* STATUS E PRIORIDADE NO TOPO */}
                <div className="position-absolute top-0 end-0 p-4">
                  <div className="d-flex flex-column gap-2">
                    <div>{getStatusBadge(order.status)}</div>
                    <div>{getPriorityBadge(order.priority)}</div>
                  </div>
                </div>

                {/* DESCRIÇÃO PRINCIPAL */}
                <div className="mb-5">
                  <h6 className="text-primary text-uppercase fw-bold mb-3 fs-5">
                    <i className="bi bi-chat-square-text-fill me-2"></i>
                    Descrição da Solicitação
                  </h6>
                  <div className="description-card bg-black bg-opacity-25 border border-primary-subtle rounded-3 p-4 shadow-sm">
                    <p className="text-white-75 mb-0 lh-lg" style={{ whiteSpace: "pre-line" }}>
                      {order.description}
                    </p>
                  </div>
                </div>

                {/* ANEXO - SUPER MELHORADO */}
                {order.attachment_path && (
                  <div className="attachment-section">
                    <h6 className="text-white-50 mb-4 fs-5 fw-bold text-uppercase">
                      <i className="bi bi-paperclip text-warning me-2"></i>
                      Evidência Anexada
                    </h6>
                    
                    <div className="row g-4 align-items-center">
                      <Col md={4}>
                        <div 
                          className="attachment-preview rounded-4 shadow-lg overflow-hidden border border-light border-opacity-25 bg-gradient position-relative cursor-pointer hover-scale"
                          style={{ 
                            width: "100%", 
                            height: "200px", 
                            background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)"
                          }}
                          onClick={() => window.open(`http://163.176.168.224/storage/${order.attachment_path}`, "_blank")}
                        >
                          {/* Loading Overlay */}
                          <div className="position-absolute inset-0 d-flex align-items-center justify-content-center bg-dark bg-opacity-75 rounded-4" 
                               style={{ zIndex: 2, display: "none" }} 
                               id={`img-loading-${order.id}`}>
                            <Spinner animation="grow" variant="primary" className="me-2" />
                            <span className="text-white fw-bold">Carregando...</span>
                          </div>

                          <img 
                            id={`preview-img-${order.id}`}
                            src={`http://163.176.168.224/storage/${order.attachment_path}`}
                            alt="Preview da evidência"
                            className="w-100 h-100 object-fit-cover"
                            style={{ 
                              opacity: 0,
                              transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                            }}
                            onLoad={() => {
                              const loading = document.getElementById(`img-loading-${order.id}`);
                              const img = document.getElementById(`preview-img-${order.id}`);
                              if (loading) loading.style.display = "none";
                              if (img) img.style.opacity = "1";
                            }}
                            onError={(e) => {
                              const container = e.target.parentElement;
                              container.innerHTML = `
                                <div class="d-flex flex-column align-items-center justify-content-center h-100 text-center p-4">
                                  <i class="bi bi-file-earmark-image-fill text-white-50 mb-3" style="font-size: 4rem; opacity: 0.5;"></i>
                                  <div class="text-white-75">
                                    <div class="fw-bold fs-5 mb-1">${order.attachment_path.split("/").pop()}</div>
                                    <small className="text-white-50">Clique para visualizar</small>
                                  </div>
                                </div>
                              `;
                            }}
                          />
                          
                          {/* Overlay de clique */}
                          <div className="position-absolute inset-0 bg-black bg-opacity-0 hover-bg-opacity-50 d-flex align-items-center justify-content-center rounded-4 transition-all">
                            <i className="bi bi-zoom-in text-white fs-1"></i>
                          </div>
                        </div>
                      </Col>
                      
                      <Col md={8}>
                        <div className="d-flex flex-column h-100 justify-content-center">
                          <div className="mb-4">
                            <h5 className="text-white fw-bold mb-2">📎 {order.attachment_path.split("/").pop()}</h5>
                            <span className="badge bg-light text-dark fs-6 px-3 py-2">Evidência do chamado</span>
                          </div>
                          
                          <div className="d-flex gap-3 flex-wrap">
                            <OverlayTrigger placement="bottom" overlay={<Tooltip>Abrir em nova aba</Tooltip>}>
                              <a
                                href={`http://163.176.168.224/storage/${order.attachment_path}`}
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
                                href={`http://163.176.168.224/storage/${order.attachment_path}`}
                                download={order.attachment_path.split("/").pop()}
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
                )}
              </div>
            </div>
          </Col>

          {/* COLUNA LATERAL - GESTÃO */}
          <Col lg={4}>
            <div className="info-card bg-dark border border-secondary-subtle rounded-4 shadow-lg p-5 h-100">
              <h3 className="text-white mb-5 fw-bold text-center position-relative pb-3">
                <i className="bi bi-gear-fill text-primary me-2"></i>
                Gestão da Ordem
                <div className="position-absolute bottom-0 left-50 transform-50 w-20 h-1 bg-gradient-primary rounded-pill mx-auto"></div>
              </h3>

              {/* SOLICITANTE */}
              <div className="user-card mb-5 p-4 rounded-3 bg-black bg-opacity-25 border border-primary-subtle shadow-sm hover-lift">
                <div className="d-flex align-items-start gap-3">
                  <div className="avatar-circle-lg flex-shrink-0 mt-1" 
                       style={{
                         width: "50px", height: "50px", 
                         background: "linear-gradient(135deg, #3b82f6, #1e40af)",
                         border: "3px solid rgba(255,255,255,0.2)"
                       }}>
                    {order.user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <h6 className="text-white fw-bold mb-1 truncate">{order.user?.name}</h6>
                    <small className="text-white-50 d-block truncate">{order.user?.email}</small>
                  </div>
                </div>
              </div>

              {/* GRUPO */}
              <div className="group-card mb-5 p-4 rounded-3 bg-black bg-opacity-25 border border-info-subtle shadow-sm hover-lift">
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
                  <div className="technician-card p-4 rounded-3 bg-gradient-primary text-white shadow-lg hover-lift">
                    <div className="d-flex align-items-center gap-3">
                      <div className="avatar-circle-lg" 
                           style={{
                             width: "45px", height: "45px", 
                             background: "linear-gradient(135deg, #10b981, #059669)"
                           }}>
                        {order.technician.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{order.technician.name}</h6>
                        <small className="opacity-75">Responsável pelo atendimento</small>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="no-technician-card p-5 rounded-3 border border-secondary-subtle border-dashed text-center bg-black bg-opacity-10 hover-lift">
                    <i className="bi bi-person-plus-fill text-muted fs-1 mb-3 d-block"></i>
                    <h6 className="text-muted mb-3">Aguardando Técnico</h6>
                    <button
                      className="btn btn-outline-primary btn-lg w-100 rounded-pill py-2 fw-bold"
                      onClick={() => onUpdateStatus(order?.id || order?._id, "in_progress")}
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
                <div className="status-select-wrapper">
                  <select
                    className="form-select form-select-lg bg-black bg-opacity-50 border-primary text-white fw-bold py-3 status-select"
                    value={order.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      const actualId = typeof order === "object" ? order.id || order._id : order;
                      console.log("Status da OS para envio:", { id: actualId, status: newStatus });
                      onUpdateStatus(actualId, newStatus);
                    }}
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
          </Col>
        </Row>
      </div>

      <style jsx>{`
        :global(.hover-lift:hover) { transform: translateY(-4px) !important; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        :global(.hover-scale:hover) { transform: scale(1.02); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        :global(.hover-shake:hover) { animation: shake 0.5s ease-in-out; }
        :global(.bg-gradient-primary) { background: linear-gradient(135deg, #1e40af, #3b82f6) !important; }
        :global(.status-select:focus) { box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.5) !important; border-color: #3b82f6 !important; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
        :global(.truncate) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        :global(.protocol-badge) { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4); }
        :global(.avatar-circle-lg) { border-radius: 50% !important; display: flex !important; align-items: center !important; justify-content: center !important; font-weight: bold !important; color: white !important; font-size: 1.1rem !important; }
      `}</style>
    </div>
  );
}
