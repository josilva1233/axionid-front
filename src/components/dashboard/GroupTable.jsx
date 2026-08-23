// components/dashboard/GroupTable.jsx
import React, { useState } from "react";
import { Modal, Form, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";


export default function GroupTable({ 
  groups, 
  loading, 
  onViewDetail, 
  onEdit, 
  onDelete, 
  currentUser 
}) {
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
      background: "#111214",
      color: "#ffffff",
      confirmButtonColor: "#6366f1",
    });

    if (result.isConfirmed) {
      if (onDelete) await onDelete(group.id);
    }
  };

  const isSystemAdmin = currentUser?.is_admin === 1 || currentUser?.is_admin === true;

  return (
    <>
      <div className="group-table-wrapper">
        <div className="group-table-header">
          <div className="header-left">
            <h4 className="table-title">
              <i className="bi bi-people-fill"></i>
              Grupos de Usuários
            </h4>
            <span className="group-count">
              {groups.length} {groups.length === 1 ? "grupo" : "grupos"}
            </span>
          </div>
          <div className="header-right">
            <span className="table-badge">
              <i className="bi bi-shield-check"></i>
              {isSystemAdmin ? "Admin Global" : "Visualização"}
            </span>
          </div>
        </div>

        <div className="permission-table-container">
          <table className="permission-table">
            <thead>
              <tr>
                <th>
                  <span className="th-icon">🏷️</span>
                  NOME DO GRUPO
                </th>
                <th>
                  <span className="th-icon">👤</span>
                  CRIADOR
                </th>
                <th className="text-center">
                  <span className="th-icon">👥</span>
                  MEMBROS
                </th>
                <th className="text-center">
                  <span className="th-icon">⚡</span>
                  MEU STATUS
                </th>
                <th className="text-end">
                  <span className="th-icon">⚙️</span>
                  AÇÕES
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.length > 0 ? (
                groups.map((g) => {
                  const canManage = isSystemAdmin ||
                    g.creator_id === currentUser?.id ||
                    g.users?.some((u) => u.id === currentUser?.id && u.pivot?.role === "admin");

                  const memberCount = g.users_count || g.users?.length || 0;

                  return (
                    <tr key={g.id} className="group-row">
                      <td>
                        <div className="group-info">
                          <div className="group-avatar">
                            {g.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="group-details">
                            <strong className="group-name">
                              {g.name.toUpperCase()}
                            </strong>
                            {g.description && (
                              <span className="group-description">
                                {g.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="creator-info">
                          <span className="creator-name">
                            {g.creator?.name || "Sistema"}
                          </span>
                          {g.creator?.id === currentUser?.id && (
                            <span className="creator-badge">Você</span>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="member-count">
                          <span className="member-number">{memberCount}</span>
                          <span className="member-label">
                            membro{memberCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className={`status-role ${canManage ? 'can-manage' : 'readonly'}`}>
                          <span className="status-dot"></span>
                          <span className="status-label">
                            {isSystemAdmin ? "Admin Global" : canManage ? "Administrador" : "Membro"}
                          </span>
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="actions-group">
                          {canManage ? (
                            <>
                              <button
                                className="action-btn action-manage"
                                onClick={() => onViewDetail(g.id)}
                                title="Gerenciar Membros"
                              >
                                <i className="bi bi-gear-fill"></i>
                                Gerenciar
                              </button>
                              {isSystemAdmin && (
                                <>
                                  <button
                                    className="action-btn action-edit"
                                    onClick={() => handleEdit(g)}
                                    title="Editar Grupo"
                                  >
                                    <i className="bi bi-pencil-square"></i>
                                    Editar
                                  </button>
                                  <button
                                    className="action-btn action-delete"
                                    onClick={() => handleDelete(g)}
                                    title="Excluir Grupo"
                                  >
                                    <i className="bi bi-trash3-fill"></i>
                                    Deletar
                                  </button>
                                </>
                              )}
                            </>
                          ) : (
                            <span className="readonly-indicator">
                              <i className="bi bi-lock-fill"></i>
                              Somente Leitura
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <div className="empty-icon">{loading ? "⏳" : "📁"}</div>
                      <h5 className="empty-title">
                        {loading ? "Carregando grupos..." : "Nenhum grupo encontrado"}
                      </h5>
                      <p className="empty-subtitle">
                        {loading ? "Aguarde um momento..." : "Crie seu primeiro grupo para começar a gerenciar permissões."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edição */}
      <Modal 
        show={showEditModal} 
        onHide={() => setShowEditModal(false)} 
        centered 
        className="group-edit-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-pencil-square me-2"></i>
            Editar Grupo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">
                <i className="bi bi-tag me-1"></i>
                Nome do Grupo
              </Form.Label>
              <Form.Control
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="custom-input-dark"
                placeholder="Ex: Administradores, TI, RH"
              />
              <Form.Text className="form-text-custom">
                Nome único para identificar o grupo
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
                placeholder="Descreva a finalidade deste grupo..."
              />
              <Form.Text className="form-text-custom">
                Opcional: descreva as responsabilidades do grupo
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <button 
            className="btn-cancel" 
            onClick={() => setShowEditModal(false)} 
            disabled={editLoading}
          >
            Cancelar
          </button>
          <button 
            className="btn-save" 
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