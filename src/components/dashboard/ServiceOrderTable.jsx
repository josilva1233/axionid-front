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
      open: { bg: "rgba(0, 255, 255, 0.1)", color: "#00ffff", label: "Aberto" },
      in_progress: { bg: "rgba(255, 193, 7, 0.1)", color: "#ffc107", label: "Em Atendimento" },
      resolved: { bg: "rgba(40, 167, 69, 0.1)", color: "#28a745", label: "Resolvido" },
      closed: { bg: "rgba(108, 117, 125, 0.1)", color: "#6c757d", label: "Fechado" },
    };
    const current = styles[status] || styles.open;
    return (
      <div className="status-badge">
        <span className="status-dot" style={{ backgroundColor: current.color }}></span>
        <span>{current.label}</span>
      </div>
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ffc107';
      case 'urgent': return '#dc3545';
      default: return '#6366f1';
    }
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
                  <td>
                    <code className="permission-code">{os.protocol}</code>
                  </td>
                  <td>
                    <strong className="text-primary">{os.title.toUpperCase()}</strong>
                    <br />
                    <small className="text-dim">
                      Criado em: {new Date(os.created_at).toLocaleDateString('pt-BR')}
                    </small>
                  </td>
                  <td>
                    <i className="bi bi-person me-1"></i>
                    {os.user?.name || "Usuário Externo"}
                  </td>
                  <td className="text-center">
                    <div className="priority-indicator">
                      <span
                        className="status-dot"
                        style={{ backgroundColor: getPriorityColor(os.priority) }}
                      />
                      <span className="text-dim">
                        {os.priority.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="text-center">
                    {getStatusBadge(os.status)}
                  </td>
                  <td className="text-end">
                    <button
                      className="btn-action"
                      onClick={() => onViewDetail(os.id)}
                      title="Ver Detalhes"
                    >
                      <i className="bi bi-eye-fill me-1"></i>
                      Detalhes
                    </button>
                    {isSystemAdmin && (
                      <>
                        <button
                          className="btn-action"
                          onClick={() => handleEdit(os)}
                          title="Editar OS"
                        >
                          <i className="bi bi-pencil-square me-1"></i>
                          Editar
                        </button>
                        <button
                          className="btn-action btn-action-danger"
                          onClick={() => handleDelete(os)}
                          title="Excluir OS"
                        >
                          <i className="bi bi-trash3-fill me-1"></i>
                          Deletar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
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
          <Modal.Title>Editar Ordem de Serviço</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Título</Form.Label>
              <Form.Control
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="custom-input-dark"
                placeholder="Título da OS"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Status</Form.Label>
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
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Prioridade</Form.Label>
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
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="custom-input-dark"
                placeholder="Descrição detalhada da OS..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-secondary" onClick={() => setShowEditModal(false)} disabled={editLoading}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSaveEdit} disabled={editLoading}>
            {editLoading ? <Spinner animation="border" size="sm" /> : "Salvar Alterações"}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}