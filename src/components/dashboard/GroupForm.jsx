// components/dashboard/GroupTable.jsx
import React, { useState } from "react";
import { Modal, Form, Spinner, Dropdown } from "react-bootstrap";
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
    cancelButtonColor: "#343a40",
    customClass: {
      popup: "border border-secondary rounded-4",
      confirmButton: "px-4 py-2 rounded-3 fw-bold mx-2",
      cancelButton: "px-4 py-2 rounded-3 fw-bold mx-2",
    },
  });

  // ============ ABRIR MODAL DE EDIÇÃO ============
  const handleOpenEditModal = (group) => {
    setEditingGroup(group);
    setEditForm({
      name: group.name || "",
      description: group.description || "",
    });
    setShowEditModal(true);
  };

  // ============ FECHAR MODAL ============
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingGroup(null);
    setEditForm({ name: "", description: "" });
  };

  // ============ SALVAR EDIÇÃO ============
  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      AxionAlert.fire({
        icon: "warning",
        title: "Campo Obrigatório",
        text: "O nome do grupo é obrigatório.",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    setEditLoading(true);
    try {
      if (onEdit) {
        await onEdit(editingGroup.id, editForm);
      }
      
      AxionAlert.fire({
        icon: "success",
        title: "Grupo Atualizado!",
        text: `O grupo "${editForm.name}" foi atualizado com sucesso.`,
        timer: 2000,
        showConfirmButton: false,
      });
      
      handleCloseEditModal();
    } catch (err) {
      AxionAlert.fire({
        icon: "error",
        title: "Erro!",
        text: err.response?.data?.message || "Falha ao atualizar grupo.",
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setEditLoading(false);
    }
  };

  // ============ EXCLUIR GRUPO ============
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
      if (onDelete) {
        await onDelete(group.id);
      }
    }
  };

  const isSystemAdmin = currentUser?.is_admin === 1 || currentUser?.is_admin === true;

  return (
    <>
      <div className="table-responsive">
        <table className="axion-table">
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

                const memberCount = g.users_count || g.users?.length || 0;

                return (
                  <tr key={g.id}>
                    <td className="mono-text">#{g.id}</td>
                    <td>
                      <div className="group-name-cell">
                        <strong className="text-primary group-name-text">
                          {g.name.toUpperCase()}
                        </strong>
                        {g.description && (
                          <span className="group-description text-dim">
                            {g.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="creator-cell">
                        <i className="bi bi-person-badge me-1"></i>
                        <span className="creator-name">{g.creator?.name || "Sistema"}</span>
                        {g.creator?.id === currentUser?.id && (
                          <span className="badge-current-user">Você</span>
                        )}
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="members-cell">
                        <span className="members-count">{memberCount}</span>
                        <span className="members-label">
                          membro{memberCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span
                        className={`badge ${canManage ? "badge-success" : "badge-operacional"} status-badge-responsive`}
                      >
                        {isSystemAdmin ? "Admin Global" : canManage ? "Administrador" : "Membro"}
                      </span>
                    </td>
                    <td className="text-end actions-cell">
                      {canManage ? (
                        <Dropdown align="end" className="actions-dropdown">
                          <Dropdown.Toggle 
                            variant="link" 
                            className="actions-dropdown-toggle"
                            id={`dropdown-actions-${g.id}`}
                            aria-label="Ações do grupo"
                          >
                            <i className="bi bi-three-dots-vertical"></i>
                          </Dropdown.Toggle>

                          <Dropdown.Menu className="actions-dropdown-menu">
                            <Dropdown.Item 
                              onClick={() => onViewDetail(g.id)}
                              className="dropdown-action-item"
                            >
                              <i className="bi bi-people-fill me-2 text-primary"></i>
                              Gerenciar Membros
                            </Dropdown.Item>

                            {isSystemAdmin && (
                              <>
                                <Dropdown.Divider />
                                <Dropdown.Item 
                                  onClick={() => handleOpenEditModal(g)}
                                  className="dropdown-action-item"
                                >
                                  <i className="bi bi-pencil-square me-2 text-success"></i>
                                  Editar Grupo
                                </Dropdown.Item>
                                <Dropdown.Item 
                                  onClick={() => handleDelete(g)}
                                  className="dropdown-action-item text-danger"
                                >
                                  <i className="bi bi-trash3-fill me-2 text-danger"></i>
                                  Excluir Grupo
                                </Dropdown.Item>
                              </>
                            )}
                          </Dropdown.Menu>
                        </Dropdown>
                      ) : (
                        <span className="readonly-badge">
                          <i className="bi bi-lock-fill me-1"></i> Read-only
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-5 text-dim">
                  <div className="empty-state">
                    <span className="empty-icon">{loading ? "⏳" : "📁"}</span>
                    <p className="mt-2 mb-0">
                      {loading ? "Carregando grupos..." : "Nenhum grupo encontrado."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ============================================
          MODAL DE EDIÇÃO - PADRONIZADO
          ============================================ */}
      <Modal 
        show={showEditModal} 
        onHide={handleCloseEditModal} 
        centered 
        className="permission-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-pencil-square me-2"></i>
            Editar Grupo
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Form>
            {/* Nome do Grupo */}
            <Form.Group className="mb-4">
              <Form.Label className="form-label-custom">
                <i className="bi bi-tag me-1"></i>
                Nome do Grupo <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="custom-input-dark"
                placeholder="Ex: Administradores, TI, RH"
                disabled={editLoading}
              />
              <Form.Text className="form-text-custom">
                Nome único para identificar o grupo
              </Form.Text>
            </Form.Group>

            {/* Descrição */}
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
                disabled={editLoading}
              />
              <Form.Text className="form-text-custom">
                Opcional: descreva as responsabilidades do grupo
              </Form.Text>
            </Form.Group>

            {/* Informações adicionais (somente leitura) */}
            <div className="info-card-readonly mt-3">
              <div className="info-row">
                <span className="info-label-readonly">
                  <i className="bi bi-hash"></i> ID do Grupo
                </span>
                <span className="info-value-readonly mono-text">
                  #{editingGroup?.id || "---"}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label-readonly">
                  <i className="bi bi-person"></i> Criado por
                </span>
                <span className="info-value-readonly">
                  {editingGroup?.creator?.name || "Sistema"}
                </span>
              </div>
            </div>
          </Form>
        </Modal.Body>
        
        <Modal.Footer>
          <button 
            className="btn-secondary" 
            onClick={handleCloseEditModal} 
            disabled={editLoading}
          >
            <i className="bi bi-x-circle me-1"></i>
            Cancelar
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSaveEdit} 
            disabled={editLoading || !editForm.name.trim()}
          >
            {editLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Salvando...
              </>
            ) : (
              <>
                <i className="bi bi-check2-circle me-2"></i>
                Salvar Alterações
              </>
            )}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}