// components/dashboard/GroupTable.jsx
import React, { useState } from "react";
import { Modal, Form, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

export default function GroupTable({ groups, loading, onViewDetail, onEdit, onDelete, currentUser }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editForm, setEditForm] = useState({ 
    name: "", 
    description: "" 
  });
  const [editLoading, setEditLoading] = useState(false);

  const AxionAlert = Swal.mixin({
    background: "#111214",
    color: "#ffffff",
    confirmButtonColor: "#6366f1",
  });

  const handleEdit = (group) => {
    setEditingGroup(group);
    setEditForm({
      name: group.name,
      description: group.description || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      AxionAlert.fire("Erro", "Nome do grupo é obrigatório.", "error");
      return;
    }

    setEditLoading(true);
    try {
      if (onEdit) await onEdit(editingGroup.id, editForm);
      AxionAlert.fire({
        icon: "success",
        title: "Grupo atualizado!",
        timer: 1500,
        showConfirmButton: false,
      });
      setShowEditModal(false);
    } catch (err) {
      AxionAlert.fire("Erro", "Falha ao atualizar grupo.", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (group) => {
    const result = await AxionAlert.fire({
      title: "Excluir Grupo?",
      text: `Deseja remover permanentemente o grupo "${group.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      if (onDelete) await onDelete(group.id);
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
              <th>NOME DO GRUPO</th>
              <th>CRIADOR</th>
              <th className="text-center">MEMBROS</th>
              <th className="text-center">MEU STATUS</th>
              <th className="text-end">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {groups.length > 0 ? (
              groups.map((g) => {
                const canManage = isSystemAdmin ||
                  g.creator_id === currentUser?.id ||
                  g.users?.some((u) => u.id === currentUser?.id && u.pivot?.role === "admin");

                return (
                  <tr key={g.id}>
                    <td>
                      <code className="permission-code">#{g.id}</code>
                    </td>
                    <td>
                      <strong className="text-primary">
                        {g.name.toUpperCase()}
                      </strong>
                      {g.description && (
                        <>
                          <br />
                          <small className="text-dim">{g.description}</small>
                        </>
                      )}
                    </td>
                    <td className="text-dim">
                      <i className="bi bi-person-badge me-1"></i>
                      {g.creator?.name || "Sistema"}
                    </td>
                    <td className="text-center">
                      <div className="status-badge">
                        <span className="status-dot" style={{ backgroundColor: "#6366f1" }}></span>
                        <span>{g.users_count || g.users?.length || 0} membros</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="status-badge">
                        <span
                          className="status-dot"
                          style={{
                            backgroundColor: canManage ? "#6366f1" : "#6c757d",
                          }}
                        />
                        <span>
                          {isSystemAdmin ? "Admin Global" : canManage ? "Administrador" : "Membro"}
                        </span>
                      </div>
                    </td>
                    <td className="text-end">
                      {canManage ? (
                        <>
                          <button
                            className="btn-action"
                            onClick={() => onViewDetail(g.id)}
                            title="Gerenciar Membros e Configurações"
                          >
                            <i className="bi bi-gear-fill me-1"></i>
                            Gerenciar
                          </button>
                          {isSystemAdmin && (
                            <>
                              <button
                                className="btn-action"
                                onClick={() => handleEdit(g)}
                                title="Editar Grupo"
                              >
                                <i className="bi bi-pencil-square me-1"></i>
                                Editar
                              </button>
                              <button
                                className="btn-action btn-action-danger"
                                onClick={() => handleDelete(g)}
                                title="Excluir Grupo"
                              >
                                <i className="bi bi-trash3-fill me-1"></i>
                                Deletar
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <span className="readonly-badge">
                          <i className="bi bi-lock-fill me-1"></i> Somente Leitura
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
                  <div className="empty-state">
                    <div className="empty-icon">{loading ? "⏳" : "📁"}</div>
                    <p>
                      {loading ? "Carregando grupos..." : "Nenhum grupo identificado nesta conta."}
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
          <Modal.Title>Editar Grupo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Nome do Grupo</Form.Label>
              <Form.Control
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="custom-input-dark"
                placeholder="ex: Administradores, TI, RH"
              />
              <Form.Text className="form-text-custom">
                Nome único para identificar o grupo
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="custom-input-dark"
                placeholder="Descreva a finalidade deste grupo..."
              />
              <Form.Text className="form-text-custom">
                Opcional: descreva as responsabilidades do grupo
              </Form.Text>
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