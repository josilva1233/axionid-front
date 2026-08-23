// components/dashboard/ServiceOrderTable.jsx
import React, { useState } from "react";
import { Modal, Form, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

export default function ServiceOrderTable({ orders, loading, onViewDetail, onEdit, onDelete, currentUser }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({ 
    title: "", 
    status: "", 
    priority: "", 
    description: "" 
  });
  const [editLoading, setEditLoading] = useState(false);

  const AxionAlert = Swal.mixin({
    background: "#111214",
    color: "#ffffff",
    confirmButtonColor: "#6366f1",
  });

  const getStatusBadge = (status) => {
    const styles = {
      open: { bg: "rgba(99, 102, 241, 0.12)", color: "#6366f1", label: "Aberto" },
      in_progress: { bg: "rgba(251, 146, 60, 0.12)", color: "#fb923c", label: "Em Atendimento" },
      resolved: { bg: "rgba(34, 197, 94, 0.12)", color: "#22c55e", label: "Resolvido" },
      closed: { bg: "rgba(148, 163, 184, 0.08)", color: "#94a3b8", label: "Fechado" },
    };
    const current = styles[status] || styles.open;
    return (
      <span className="status-badge-service" style={{ backgroundColor: current.bg, color: current.color }}>
        <span className="status-dot" style={{ backgroundColor: current.color }}></span>
        {current.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      low: { bg: "rgba(34, 197, 94, 0.12)", color: "#22c55e", label: "Baixa" },
      medium: { bg: "rgba(234, 179, 8, 0.12)", color: "#eab308", label: "Média" },
      high: { bg: "rgba(251, 146, 60, 0.12)", color: "#fb923c", label: "Alta" },
      urgent: { bg: "rgba(239, 68, 68, 0.12)", color: "#ef4444", label: "Urgente" },
    };
    const current = styles[priority] || styles.medium;
    return (
      <span className="priority-badge" style={{ backgroundColor: current.bg, color: current.color }}>
        <span className="status-dot" style={{ backgroundColor: current.color }}></span>
        {current.label}
      </span>
    );
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setEditForm({
      title: order.title,
      status: order.status,
      priority: order.priority,
      description: order.description || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.title.trim()) {
      AxionAlert.fire("Erro", "Título é obrigatório.", "error");
      return;
    }

    setEditLoading(true);
    try {
      if (onEdit) await onEdit(editingOrder.id, editForm);
      AxionAlert.fire({
        icon: "success",
        title: "OS atualizada!",
        timer: 1500,
        showConfirmButton: false,
      });
      setShowEditModal(false);
    } catch (err) {
      AxionAlert.fire("Erro", "Falha ao atualizar OS.", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (order) => {
    const result = await AxionAlert.fire({
      title: "Excluir OS?",
      text: `Deseja remover permanentemente a OS "${order.protocol}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      background: "#111214",
      color: "#ffffff",
      confirmButtonColor: "#6366f1",
    });

    if (result.isConfirmed) {
      if (onDelete) await onDelete(order.id);
    }
  };

  const isSystemAdmin = currentUser?.is_admin === 1 || currentUser?.is_admin === true;

  return (
    <>
      <div className="permission-table-container">
        <table className="permission-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>PROTOCOLO</th>
              <th>TÍTULO / ASSUNTO</th>
              <th>SOLICITANTE</th>
              <th className="text-center">PRIORIDADE</th>
              <th className="text-center">STATUS</th>
              <th className="text-end">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((os) => (
                <tr key={os.id}>
                  <td className="mono-text">#{os.id}</td>
                  <td>
                    <code className="permission-code">{os.protocol}</code>
                  </td>
                  <td>
                    <strong className="text-primary">{os.title.toUpperCase()}</strong>
                    <br />
                    <small className="text-dim">
                      {new Date(os.created_at).toLocaleDateString('pt-BR')}
                    </small>
                  </td>
                  <td>
                    <div className="user-info-min">
                      <i className="bi bi-person me-1 text-dim"></i>
                      <span className="creator-name">{os.user?.name || "Usuário Externo"}</span>
                    </div>
                  </td>
                  <td className="text-center">
                    {getPriorityBadge(os.priority)}
                  </td>
                  <td className="text-center">
                    {getStatusBadge(os.status)}
                  </td>
                  <td className="text-end">
                    <div className="actions-wrapper">
                      <button
                        className="btn-table-action"
                        onClick={() => onViewDetail(os.id)}
                        title="Ver Detalhes"
                      >
                        <i className="bi bi-eye"></i> Detalhes
                      </button>
                      {isSystemAdmin && (
                        <>
                          <button
                            className="btn-table-action btn-table-action-edit"
                            onClick={() => handleEdit(os)}
                            title="Editar OS"
                          >
                            <i className="bi bi-pencil-square"></i> Editar
                          </button>
                          <button
                            className="btn-table-action btn-table-action-danger"
                            onClick={() => handleDelete(os)}
                            title="Excluir OS"
                          >
                            <i className="bi bi-trash3-fill"></i> Excluir
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-state">
                  <div className="empty-state">
                    <div className="empty-icon">{loading ? "⏳" : "📋"}</div>
                    <p>
                      {loading ? "Carregando chamados..." : "Nenhuma Ordem de Serviço encontrada."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Edição */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered className="permission-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-pencil-square me-2"></i>
            Editar Ordem de Serviço
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">
                <i className="bi bi-tag me-1"></i>
                Título
              </Form.Label>
              <Form.Control
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="custom-input-dark"
                placeholder="Título da OS"
              />
              <Form.Text className="form-text-custom">
                Título descritivo da Ordem de Serviço
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">
                <i className="bi bi-circle me-1"></i>
                Status
              </Form.Label>
              <Form.Select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="custom-input-dark"
              >
                <option value="open">Aberto</option>
                <option value="in_progress">Em Atendimento</option>
                <option value="resolved">Resolvido</option>
                <option value="closed">Fechado</option>
              </Form.Select>
              <Form.Text className="form-text-custom">
                Status atual da Ordem de Serviço
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">
                <i className="bi bi-flag me-1"></i>
                Prioridade
              </Form.Label>
              <Form.Select
                value={editForm.priority}
                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                className="custom-input-dark"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </Form.Select>
              <Form.Text className="form-text-custom">
                Nível de prioridade da Ordem de Serviço
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">
                <i className="bi bi-file-text me-1"></i>
                Descrição
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="custom-input-dark"
                placeholder="Descrição detalhada da OS..."
              />
              <Form.Text className="form-text-custom">
                Detalhes adicionais sobre a Ordem de Serviço
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-secondary" onClick={() => setShowEditModal(false)} disabled={editLoading}>
            <i className="bi bi-x-circle me-1"></i>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSaveEdit} disabled={editLoading}>
            {editLoading ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <i className="bi bi-check2-circle me-2"></i>
            )}
            Salvar Alterações
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}