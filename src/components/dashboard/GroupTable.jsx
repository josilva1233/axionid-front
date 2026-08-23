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
  const dropdownRef = useRef(null);

  const AxionAlert = Swal.mixin({
    background: "#111214",
    color: "#ffffff",
    confirmButtonColor: "#6366f1",
  });

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
                    <td>
                      <strong className="text-white">
                        {g.name.toUpperCase()}
                      </strong>
                      {g.description && (
                        <>
                          <br />
                          <span className="text-dim" style={{ fontSize: '12px' }}>
                            {g.description}
                          </span>
                        </>
                      )}
                    </td>
                    <td className="text-dim">
                      <i className="bi bi-person-badge me-1"></i>
                      {g.creator?.name || "Sistema"}
                      {g.creator?.id === currentUser?.id && (
                        <span className="badge-current-user" style={{ marginLeft: '6px' }}>
                          Você
                        </span>
                      )}
                    </td>
                    <td className="text-center">
                      <div className="status-indicator-wrapper">
                        <span
                          className="status-indicator"
                          style={{
                            backgroundColor: "var(--primary)",
                          }}
                        />
                        <span className="status-text">
                          {memberCount} membro{memberCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span
                        className={`badge ${canManage ? "badge-success" : "badge-operacional"}`}
                      >
                        {isSystemAdmin ? "Admin Global" : canManage ? "Administrador" : "Membro"}
                      </span>
                    </td>
                    <td className="text-end">
                      {canManage ? (
                        <div className="actions-dropdown-wrapper" ref={dropdownRef}>
                          <button
                            className="btn-dropdown-toggle"
                            onClick={() => toggleDropdown(g.id)}
                            title="Abrir ações"
                          >
                            <i className="bi bi-three-dots-vertical"></i>
                          </button>

                          {isDropdownOpen && (
                            <div className="actions-dropdown-menu">
                              <button
                                className="dropdown-item"
                                onClick={() => {
                                  onViewDetail(g.id);
                                  setOpenDropdown(null);
                                }}
                              >
                                <i className="bi bi-gear-fill"></i> Gerenciar Membros
                              </button>
                              {isSystemAdmin && (
                                <>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleEdit(g)}
                                  >
                                    <i className="bi bi-pencil-square"></i> Editar
                                  </button>
                                  <button
                                    className="dropdown-item dropdown-item-danger"
                                    onClick={() => handleDelete(g)}
                                  >
                                    <i className="bi bi-trash3-fill"></i> Deletar
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="readonly-indicator">
                          <i className="bi bi-lock-fill"></i> Somente Leitura
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-5 text-dim">
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