// components/dashboard/PermissionDetail.jsx
import React, { useState } from "react";
import { Modal, Form, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

export default function PermissionDetail({ 
  permission, 
  onBack, 
  onEdit, 
  onDelete, 
  isSystemAdmin,
  actionLoading 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: permission?.name || "",
    label: permission?.label || "",
    description: permission?.description || "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const AxionAlert = Swal.mixin({
    background: "#111214",
    color: "#ffffff",
    confirmButtonColor: "#6366f1",
  });

  if (!permission) {
    return (
      <div className="permission-detail-container">
        <div className="permission-detail-header">
          <button className="btn-back" onClick={onBack}>
            <i className="bi bi-arrow-left me-2"></i> Voltar
          </button>
          <span className="text-dim">Permissão não encontrada</span>
        </div>
      </div>
    );
  }

  const handleSaveEdit = async () => {
    if (!editForm.name.trim() || !editForm.label.trim()) {
      AxionAlert.fire("Erro", "Nome e label são obrigatórios.", "error");
      return;
    }

    setEditLoading(true);
    try {
      if (onEdit) await onEdit(permission.id, editForm);
      AxionAlert.fire({
        icon: "success",
        title: "Permissão atualizada!",
        timer: 1500,
        showConfirmButton: false,
      });
      setIsEditing(false);
    } catch (err) {
      AxionAlert.fire("Erro", "Falha ao atualizar permissão.", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteModal(false);
    const result = await AxionAlert.fire({
      title: "Excluir Permissão?",
      text: `Deseja remover permanentemente a permissão "${permission.label}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      background: "#111214",
      color: "#ffffff",
      confirmButtonColor: "#6366f1",
    });

    if (result.isConfirmed) {
      if (onDelete) await onDelete(permission.id);
    }
  };

  return (
    <div className="permission-detail-container">
      {/* =========================================================
          HEADER
          ========================================================= */}
      <div className="permission-detail-header">
        <div className="header-left">
          <button className="btn-back" onClick={onBack}>
            <i className="bi bi-arrow-left me-2"></i> Voltar
          </button>

          <div className="permission-title-block">
            <div className="permission-icon-wrapper">
              <i className="bi bi-shield-lock"></i>
            </div>
            <div className="permission-title-info">
              <h4 className="permission-name-text">
                {permission.label?.toUpperCase() || "SEM NOME"}
              </h4>
              <span className="permission-id-text">
                #{permission.id} • {permission.name}
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          {isSystemAdmin && !isEditing && (
            <>
              <button
                className="btn-edit"
                onClick={() => setIsEditing(true)}
                title="Editar Permissão"
              >
                <i className="bi bi-pencil me-2"></i> Editar
              </button>
              <button
                className="btn-delete-permanent"
                onClick={() => setShowDeleteModal(true)}
                title="Excluir Permissão"
              >
                <i className="bi bi-trash3-fill me-2"></i> Excluir
              </button>
            </>
          )}
          {isEditing && (
            <div className="action-buttons">
              <button
                className="btn-secondary"
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    name: permission.name,
                    label: permission.label,
                    description: permission.description || "",
                  });
                }}
                disabled={editLoading}
              >
                <i className="bi bi-x-circle me-1"></i> Cancelar
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
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          BODY - DETALHES
          ========================================================= */}
      <div className="permission-detail-body">
        <div className="detail-grid">
          {/* COLUNA PRINCIPAL */}
          <div className="detail-col-main">
            <div className={`info-card ${isEditing ? "editing" : ""}`}>
              <div className="card-title">
                <i className="bi bi-info-circle"></i>
                Informações da Permissão
              </div>

              <div className="info-list">
                {/* Chave do Sistema */}
                <div className="info-item">
                  <label className="info-label">
                    <i className="bi bi-tag me-1"></i>
                    Chave do Sistema (Slug)
                  </label>
                  {isEditing ? (
                    <Form.Control
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="custom-input-dark"
                      placeholder="ex: users.create"
                    />
                  ) : (
                    <div className="info-value mono-text">
                      <code className="permission-code">{permission.name}</code>
                    </div>
                  )}
                  <span className="info-hint">
                    Identificador único usado no código
                  </span>
                </div>

                {/* Label */}
                <div className="info-item">
                  <label className="info-label">
                    <i className="bi bi-fonts me-1"></i>
                    Label (Nome Exibido)
                  </label>
                  {isEditing ? (
                    <Form.Control
                      type="text"
                      value={editForm.label}
                      onChange={(e) =>
                        setEditForm({ ...editForm, label: e.target.value })
                      }
                      className="custom-input-dark"
                      placeholder="ex: Criar Usuários"
                    />
                  ) : (
                    <div className="info-value">
                      <strong className="text-primary">
                        {permission.label?.toUpperCase() || "SEM NOME"}
                      </strong>
                    </div>
                  )}
                  <span className="info-hint">
                    Nome exibido para os usuários
                  </span>
                </div>

                {/* Descrição */}
                <div className="info-item">
                  <label className="info-label">
                    <i className="bi bi-file-text me-1"></i>
                    Descrição
                  </label>
                  {isEditing ? (
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({ ...editForm, description: e.target.value })
                      }
                      className="custom-input-dark"
                      placeholder="Descreva o que esta permissão concede..."
                    />
                  ) : (
                    <div className="info-value">
                      {permission.description || (
                        <span className="text-dim italic">
                          Nenhuma descrição fornecida
                        </span>
                      )}
                    </div>
                  )}
                  <span className="info-hint">
                    Opcional: detalhes sobre a permissão
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA LATERAL */}
          <div className="detail-col-side">
            <div className="info-card">
              <div className="card-title">
                <i className="bi bi-shield-check"></i>
                Status e Metadados
              </div>

              <div className="info-list">
                {/* ID */}
                <div className="info-item">
                  <label className="info-label">
                    <i className="bi bi-hash me-1"></i>
                    ID da Permissão
                  </label>
                  <div className="info-value mono-text">
                    #{permission.id}
                  </div>
                </div>

                {/* Tipo */}
                <div className="info-item">
                  <label className="info-label">
                    <i className="bi bi-tag me-1"></i>
                    Tipo
                  </label>
                  <div className="info-value">
                    <span className="badge-iam">IAM</span>
                  </div>
                </div>

                {/* Status */}
                <div className="info-item">
                  <label className="info-label">
                    <i className="bi bi-circle me-1"></i>
                    Status
                  </label>
                  <div className="info-value">
                    <div className="status-badge">
                      <span className="status-dot" style={{ backgroundColor: "var(--success)" }}></span>
                      <span>Ativo</span>
                    </div>
                  </div>
                </div>

                {/* Data de Criação */}
                <div className="info-item">
                  <label className="info-label">
                    <i className="bi bi-calendar-plus me-1"></i>
                    Criado em
                  </label>
                  <div className="info-value mono-text">
                    {permission.created_at
                      ? new Date(permission.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'n/a'}
                  </div>
                </div>

                {/* Última Atualização */}
                <div className="info-item">
                  <label className="info-label">
                    <i className="bi bi-clock-history me-1"></i>
                    Última atualização
                  </label>
                  <div className="info-value mono-text">
                    {permission.updated_at
                      ? new Date(permission.updated_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'n/a'}
                  </div>
                </div>
              </div>
            </div>

            {/* ZONA DE PERIGO */}
            {isSystemAdmin && (
              <div className="danger-zone">
                <div className="danger-card info-card">
                  <div className="card-title text-error">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    Zona de Perigo
                  </div>
                  <div className="danger-zone-content">
                    <div className="danger-zone-text">
                      <h5>
                        <i className="bi bi-trash3-fill"></i>
                        Excluir Permissão
                      </h5>
                      <p className="text-dim">
                        Esta ação é irreversível. Todos os grupos que usam esta
                        permissão perderão o acesso.
                      </p>
                    </div>
                    <button
                      className="btn-delete-permanent"
                      onClick={() => setShowDeleteModal(true)}
                      title="Excluir Permissão"
                    >
                      <i className="bi bi-trash3-fill me-2"></i>
                      Excluir Permanentemente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          MODAL DE CONFIRMAÇÃO DE EXCLUSÃO
          ========================================================= */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        className="permission-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-exclamation-triangle-fill me-2 text-error"></i>
            Confirmar Exclusão
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-white">
            Tem certeza que deseja excluir a permissão
            <strong className="text-primary d-block mt-2">
              "{permission.label}"
            </strong>
            ?
          </p>
          <div className="permission-warning mt-3">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>
              Esta ação é <strong>irreversível</strong>. Todos os grupos que
              utilizam esta permissão perderão o acesso.
            </span>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn-secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={actionLoading}
          >
            <i className="bi bi-x-circle me-1"></i>
            Cancelar
          </button>
          <button
            className="btn-delete-permanent"
            onClick={handleDelete}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <i className="bi bi-trash3-fill me-2"></i>
            )}
            Sim, Excluir Permanentemente
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}