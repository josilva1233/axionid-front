// components/dashboard/PermissionTable.jsx
import React, { useState } from "react";
import { Modal, Form, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";


export default function PermissionTable({ permissions, loading, currentUser, onEdit, onDelete }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", label: "", description: "" });
  const [editLoading, setEditLoading] = useState(false);

  const AxionAlert = Swal.mixin({
    background: "#111214",
    color: "#ffffff",
    confirmButtonColor: "#6366f1",
  });

  const handleEdit = (perm) => {
    setEditingPermission(perm);
    setEditForm({
      name: perm.name,
      label: perm.label,
      description: perm.description || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim() || !editForm.label.trim()) {
      AxionAlert.fire("Erro", "Nome e label são obrigatórios.", "error");
      return;
    }

    setEditLoading(true);
    try {
      if (onEdit) await onEdit(editingPermission.id, editForm);
      AxionAlert.fire({
        icon: "success",
        title: "Permissão atualizada!",
        timer: 1500,
        showConfirmButton: false,
      });
      setShowEditModal(false);
    } catch (err) {
      AxionAlert.fire("Erro", "Falha ao atualizar permissão.", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (perm) => {
    const result = await AxionAlert.fire({
      title: "Excluir Permissão?",
      text: `Deseja remover permanentemente a permissão "${perm.label}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      background: "#111214",
      color: "#ffffff",
      confirmButtonColor: "#6366f1",
    });

    if (result.isConfirmed) {
      if (onDelete) await onDelete(perm.id);
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
              <th>PERMISSÃO (LABEL)</th>
              <th>CHAVE DO SISTEMA (SLUG)</th>
              <th className="text-center">TIPO</th>
              <th className="text-center">STATUS</th>
              <th className="text-end">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {permissions.length > 0 ? (
              permissions.map((perm) => (
                <tr key={perm.id}>
                  <td className="mono-text">#{perm.id}</td>
                  <td>
                    <strong className="text-primary">{perm.label?.toUpperCase() || "SEM NOME"}</strong>
                  </td>
                  <td>
                    <code className="permission-code">{perm.name}</code>
                  </td>
                  <td className="text-center">
                    <span className="badge-iam">IAM</span>
                  </td>
                  <td className="text-center">
                    <div className="status-badge">
                      <span className="status-dot" style={{ backgroundColor: "var(--success)" }}></span>
                      <span>Ativo</span>
                    </div>
                  </td>
                  <td className="text-end">
                    {isSystemAdmin ? (
                      <div className="actions-wrapper">
                        <button
                          className="btn-table-action"
                          onClick={() => handleEdit(perm)}
                          title="Editar Permissão"
                        >
                          <i className="bi bi-pencil-square"></i> Editar
                        </button>
                        <button
                          className="btn-table-action btn-table-action-danger"
                          onClick={() => handleDelete(perm)}
                          title="Excluir Permissão"
                        >
                          <i className="bi bi-trash3-fill"></i> Excluir
                        </button>
                      </div>
                    ) : (
                      <span className="readonly-badge">
                        <i className="bi bi-lock-fill me-1"></i> Read-only
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
                  <div className="empty-state">
                    <div className="empty-icon">{loading ? "⏳" : "🛡️"}</div>
                    <p>
                      {loading ? "Carregando permissões..." : "Nenhuma permissão identificada no sistema."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Edição - PADRONIZADO */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered className="permission-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-pencil-square me-2"></i>
            Editar Permissão
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">
                <i className="bi bi-tag me-1"></i>
                Chave do Sistema (Slug)
              </Form.Label>
              <Form.Control
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="custom-input-dark"
                placeholder="ex: users.create"
              />
              <Form.Text className="form-text-custom">
                Identificador único da permissão (usado no código)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">
                <i className="bi bi-fonts me-1"></i>
                Label (Nome Exibido)
              </Form.Label>
              <Form.Control
                type="text"
                value={editForm.label}
                onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                className="custom-input-dark"
                placeholder="ex: Criar Usuários"
              />
              <Form.Text className="form-text-custom">
                Nome que será exibido para esta permissão
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
                placeholder="Descreva o que esta permissão concede..."
              />
              <Form.Text className="form-text-custom">
                Opcional: detalhes sobre o que a permissão permite
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <button 
            className="btn-secondary" 
            onClick={() => setShowEditModal(false)} 
            disabled={editLoading}
          >
            <i className="bi bi-x-circle me-1"></i>
            Cancelar
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSaveEdit} 
            disabled={editLoading}
          >
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