// components/dashboard/PermissionDetail.jsx
import { useState } from "react";

export default function PermissionDetail({
  permission,
  onBack,
  onDeletePermission,
  actionLoading,
  onUpdatePermission,
  groupsWithThisPermission = [],
  allAvailableGroups = [],
  onAssignToGroup,
  onRemoveFromGroup,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    label: "",
    description: "",
  });

  const handleDelete = () => {
    if (!permission?.id) return;
    if (window.confirm(`ATENÇÃO: Deseja realmente excluir a permissão "${permission.label}"?`)) {
      onDeletePermission(permission.id);
    }
  };

  const handleEdit = () => {
    setEditFormData({
      label: permission.label || "",
      description: permission.description || "",
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({ label: "", description: "" });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.label.trim()) {
      alert("O label da permissão é obrigatório.");
      return;
    }
    await onUpdatePermission(permission.id, editFormData);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!permission) {
    return (
      <div className="text-center py-5">
        <p className="text-dim">Carregando dados da permissão...</p>
        <button className="btn-secondary" onClick={onBack}>Voltar</button>
      </div>
    );
  }

  return (
    <div className="group-detail-container">
      <div className="user-detail-header">
        <div className="header-left">
          <button className="btn-back" onClick={onBack}>
            <i className="bi bi-arrow-left me-2"></i>
            Voltar
          </button>
          <div className="vertical-divider"></div>
          <div className="user-title-block">
            <span className="user-name-text">
              Gerenciar Permissão: <span className="text-primary">{permission.label?.toUpperCase()}</span>
            </span>
            <span className="user-id-text">ID: {permission.id}</span>
          </div>
        </div>
        <div className="header-actions">
          {!isEditing && (
            <button className="btn-primary-sm" onClick={handleEdit} disabled={actionLoading}>
              <i className="bi bi-pencil me-2"></i>
              Editar
            </button>
          )}
          <button className="btn-delete-permanent" onClick={handleDelete} disabled={actionLoading}>
            <i className="bi bi-trash3 me-2"></i>
            {actionLoading ? "..." : "Excluir Permissão"}
          </button>
        </div>
      </div>

      <div className="detail-grid">
        {/* Coluna de Informações da Permissão */}
        <div className="col-md-6">
          <div className="info-card">
            <h5 className="card-title">
              {isEditing ? "Editar Permissão" : "Informações da Permissão"}
            </h5>
            
            {isEditing ? (
              // Formulário de edição - VISÍVEL quando isEditing = true
              <form onSubmit={handleSaveEdit}>
                <div className="input-group mb-3">
                  <label className="input-label">Nome (Slug) - Não editável</label>
                  <input
                    type="text"
                    className="custom-input-dark"
                    value={permission.name}
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                  <small className="form-text-custom">O nome/slug é único e não pode ser alterado</small>
                </div>

                <div className="input-group mb-3">
                  <label className="input-label">Label (Nome Exibido) *</label>
                  <input
                    type="text"
                    name="label"
                    className="custom-input-dark"
                    value={editFormData.label}
                    onChange={handleChange}
                    placeholder="Ex: Criar Usuários"
                    required
                    autoFocus
                  />
                </div>

                <div className="input-group mb-3">
                  <label className="input-label">Descrição</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="custom-input-dark"
                    value={editFormData.description}
                    onChange={handleChange}
                    placeholder="Descreva o que esta permissão concede..."
                  />
                </div>

                <div className="d-flex gap-2 mt-3">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCancelEdit}
                    disabled={actionLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>
                        Salvar Alterações
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              // Modo de visualização - VISÍVEL quando isEditing = false
              <>
                <div className="info-row mb-3">
                  <span className="info-label text-dim" style={{ display: 'block', marginBottom: '5px' }}>Nome (Slug):</span>
                  <span className="info-value">
                    <code className="permission-code" style={{ background: '#1e1e2e', padding: '4px 8px', borderRadius: '6px' }}>
                      {permission.name}
                    </code>
                  </span>
                </div>
                <div className="info-row mb-3">
                  <span className="info-label text-dim" style={{ display: 'block', marginBottom: '5px' }}>Label:</span>
                  <span className="info-value" style={{ fontSize: '16px', fontWeight: '500' }}>{permission.label}</span>
                </div>
                {permission.description && (
                  <div className="info-row mb-3">
                    <span className="info-label text-dim" style={{ display: 'block', marginBottom: '5px' }}>Descrição:</span>
                    <span className="info-value text-dim">{permission.description}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Coluna de Grupos Vinculados */}
        <div className="col-md-6">
          <div className="info-card">
            <h5 className="card-title">Grupos com esta Permissão</h5>
            <div className="table-responsive">
              <table className="axion-table">
                <thead>
                  <tr>
                    <th>GRUPO</th>
                    <th className="text-end">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {groupsWithThisPermission?.length > 0 ? (
                    groupsWithThisPermission.map((group) => (
                      <tr key={group.id}>
                        <td>
                          <strong className="text-white">{group.name}</strong>
                          {group.description && (
                            <>
                              <br />
                              <small className="text-dim">{group.description}</small>
                            </>
                          )}
                        </td>
                        <td className="text-end">
                          <button
                            className="btn-delete-permanent btn-sm"
                            onClick={() => onRemoveFromGroup && onRemoveFromGroup(group.id, permission.id)}
                            disabled={actionLoading}
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="text-center py-5 text-dim">
                        <i className="bi bi-info-circle me-2"></i>
                        Nenhum grupo possui esta permissão.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Seção para Atribuir a Grupos */}
      <div className="info-card mt-4">
        <h5 className="card-title">Atribuir Permissão a um Grupo</h5>
        <div className="row align-items-end">
          <div className="col-md-8">
            <label className="input-label">Selecione um grupo</label>
            <select 
              className="custom-input-dark"
              onChange={(e) => {
                const groupId = e.target.value;
                if (groupId && onAssignToGroup) {
                  onAssignToGroup(groupId, permission.id);
                  e.target.value = "";
                }
              }}
              value=""
            >
              <option value="" disabled>Selecione um grupo...</option>
              {allAvailableGroups
                .filter(group => !groupsWithThisPermission.some(g => g.id === group.id))
                .map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Zona de Perigo */}
      <div className="danger-zone mt-4">
        <div className="info-card danger-card">
          <div className="danger-zone-content">
            <div>
              <h5 className="text-danger fw-bold mb-1">Zona de Perigo</h5>
              <p className="text-dim small mb-0">
                Uma vez excluída, a permissão será removida de todos os grupos e não poderá ser recuperada.
              </p>
            </div>
            <button
              className="btn-delete-permanent"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              <i className="bi bi-trash3 me-2"></i>
              {actionLoading ? "..." : "Excluir Permissão"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}