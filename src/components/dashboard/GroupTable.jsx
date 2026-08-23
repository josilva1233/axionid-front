// components/dashboard/GroupTable.jsx
import React, { useState, useRef, useEffect } from "react";
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
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  const AxionAlert = Swal.mixin({
    background: "#111214",
    color: "#ffffff",
    confirmButtonColor: "#6366f1",
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutside = Object.values(dropdownRefs.current).every(
        (ref) => ref && !ref.contains(event.target)
      );
      if (isOutside) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEdit = (group) => {
    setEditingGroup(group);
    setEditForm({
      name: group.name,
      description: group.description || "",
    });
    setShowEditModal(true);
    setOpenDropdown(null);
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
    setOpenDropdown(null);
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

  const toggleDropdown = (groupId) => {
    setOpenDropdown(openDropdown === groupId ? null : groupId);
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
                const isDropdownOpen = openDropdown === g.id;

                return (
                  <tr key={g.id}>
                    <td>#{g.id}</td>
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
                    <td className="text-end">
                      {canManage ? (
                        <div 
                          className="actions-dropdown-container" 
                          ref={(el) => (dropdownRefs.current[g.id] = el)}
                        >
                          <button
                            className={`actions-dropdown-trigger ${isDropdownOpen ? 'active' : ''}`}
                            onClick={() => toggleDropdown(g.id)}
                            type="button"
                            title="Abrir ações do grupo"
                          >
                            <i className="bi bi-three-dots-vertical"></i>
                          </button>

                          {isDropdownOpen && (
                            <div className="actions-dropdown-menu-floating" role="menu">
                              <header className="dropdown-menu-header">
                                <span className="dropdown-header-label">Ações</span>
                                <strong className="dropdown-header-name text-truncate">
                                  {g.name}
                                </strong>
                              </header>
                              
                              <div className="dropdown-menu-divider"></div>
                              
                              <nav className="dropdown-menu-body">
                                <button
                                  type="button"
                                  className="dropdown-menu-item"
                                  role="menuitem"
                                  onClick={() => {
                                    onViewDetail(g.id);
                                    setOpenDropdown(null);
                                  }}
                                >
                                  <span className="dropdown-menu-icon" aria-hidden="true">
                                    <i className="bi bi-people-fill"></i>
                                  </span>
                                  Gerenciar Membros
                                </button>

                                {isSystemAdmin && (
                                  <>
                                    <button
                                      type="button"
                                      className="dropdown-menu-item"
                                      role="menuitem"
                                      onClick={() => handleEdit(g)}
                                    >
                                      <span className="dropdown-menu-icon" aria-hidden="true">
                                        <i className="bi bi-pencil-square"></i>
                                      </span>
                                      Editar Grupo
                                    </button>

                                    <div className="dropdown-menu-divider"></div>

                                    <button
                                      type="button"
                                      className="dropdown-menu-item dropdown-menu-item-danger"
                                      role="menuitem"
                                      onClick={() => handleDelete(g)}
                                    >
                                      <span className="dropdown-menu-icon" aria-hidden="true">
                                        <i className="bi bi-trash3-fill"></i>
                                      </span>
                                      Deletar Grupo
                                    </button>
                                  </>
                                )}
                              </nav>
                            </div>
                          )}
                        </div>
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

      {/* Modal de Edição */}
      <Modal 
        show={showEditModal} 
        onHide={() => setShowEditModal(false)} 
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
            className="btn-secondary" 
            onClick={() => setShowEditModal(false)} 
            disabled={editLoading}
          >
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