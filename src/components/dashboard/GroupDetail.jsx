import { useState } from "react";
import GroupPermissionManager from "./GroupPermissionManager";


export default function GroupDetail({
  group,
  onBack,
  onAddUser,
  onRemoveUser,
  onPromoteUser,
  onDemoteUser,
  onDeleteGroup,
  actionLoading,
  onAddPermission,
  onRemovePermission,
  allAvailablePermissions = [],
  currentUserId,
  isSystemAdmin,
}) {
  const [emailToAdd, setEmailToAdd] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!emailToAdd) return;
    onAddUser(emailToAdd);
    setEmailToAdd("");
  };

  const handleDelete = () => {
    if (!group?.id) return;
    if (window.confirm(`ATENÇÃO: Deseja realmente excluir o grupo "${group.name}"?`)) {
      onDeleteGroup(group.id);
    }
  };

  if (!group) {
    return (
      <div className="group-detail-container">
        <div className="loading-state">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="text-dim mt-3">Carregando dados do grupo...</p>
          <button className="btn-back mt-3" onClick={onBack}>
            <i className="bi bi-arrow-left me-2"></i>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const isGroupAdmin = group.users?.some(
    (u) => u.id === currentUserId && u.pivot?.role === "admin"
  );
  const canManage = isSystemAdmin || isGroupAdmin;

  return (
    <div className="group-detail-container">
      {/* HEADER */}
      <div className="group-detail-header">
        <div className="header-left">
          <button className="btn-back" onClick={onBack}>
            <i className="bi bi-arrow-left"></i>
            Voltar
          </button>

          <div className="vertical-divider"></div>

          <div className="group-title-block">
            <div className="group-avatar-lg">
              {group.name?.charAt(0).toUpperCase()}
            </div>
            <div className="group-title-info">
              <span className="group-name-text">
                Gerenciar Grupo: <span className="text-primary">{group.name?.toUpperCase()}</span>
              </span>
              <div className="group-meta">
                <span className="user-id-text">ID: {group.id}</span>
                <span className="group-members-count">
                  <i className="bi bi-people-fill me-1"></i>
                  {group.users?.length || 0} membros
                </span>
                {group.description && (
                  <span className="group-description-text">{group.description}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="header-actions">
          {canManage && (
            <button 
              className="btn-delete-permanent" 
              onClick={handleDelete} 
              disabled={actionLoading}
            >
              <i className="bi bi-trash3"></i>
              {actionLoading ? "..." : "Excluir Grupo"}
            </button>
          )}
        </div>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="detail-grid">
        {/* COLUNA ESQUERDA - MEMBROS */}
        <div className="detail-col-main">
          <div className="info-card">
            <div className="card-header-custom">
              <h5 className="card-title">
                <i className="bi bi-people-fill"></i>
                Membros Atuais
              </h5>
              <span className="member-count-badge">
                {group.users?.length || 0} membros
              </span>
            </div>

            <div className="table-responsive-custom">
              <table className="group-member-table">
                <thead>
                  <tr>
                    <th>NOME</th>
                    <th>FUNÇÃO</th>
                    <th>E-MAIL</th>
                    <th className="text-end">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {group.users?.length > 0 ? (
                    group.users.map((user) => {
                      const isCurrentUser = user.id === currentUserId;
                      const canManageUser = canManage && !isCurrentUser;

                      return (
                        <tr key={user.id}>
                          <td>
                            <div className="user-info-cell">
                              <div className="user-avatar-sm">
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                              <strong className="text-white">{user.name}</strong>
                              {isCurrentUser && (
                                <span className="badge-current-user">Você</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span 
                              className={`role-badge ${user.pivot?.role === "admin" ? "role-admin" : "role-user"}`}
                            >
                              {user.pivot?.role === "admin" ? "Administrador" : "Membro"}
                            </span>
                          </td>
                          <td className="text-dim">{user.email}</td>
                          <td className="text-end">
                            <div className="actions-wrapper">
                              {canManageUser && (
                                <>
                                  {user.pivot?.role === "admin" ? (
                                    <button
                                      className="btn-action-demote"
                                      onClick={() => onDemoteUser && onDemoteUser(user.id)}
                                      disabled={actionLoading}
                                      title="Remover privilégios de administrador"
                                    >
                                      <i className="bi bi-shield-minus"></i>
                                      Revogar Admin
                                    </button>
                                  ) : (
                                    <button
                                      className="btn-action-promote"
                                      onClick={() => onPromoteUser && onPromoteUser(user.id)}
                                      disabled={actionLoading}
                                      title="Promover a administrador"
                                    >
                                      <i className="bi bi-shield-check"></i>
                                      Tornar Admin
                                    </button>
                                  )}
                                  <button
                                    className="btn-action-remove"
                                    onClick={() => onRemoveUser(user.id, user.name)}
                                    disabled={actionLoading}
                                    title="Remover do grupo"
                                  >
                                    <i className="bi bi-person-x"></i>
                                    Remover
                                  </button>
                                </>
                              )}
                              {!canManageUser && isCurrentUser && (
                                <span className="readonly-indicator">
                                  <i className="bi bi-lock-fill"></i>
                                  Você
                                </span>
                              )}
                              {!canManageUser && !isCurrentUser && (
                                <span className="readonly-indicator">
                                  <i className="bi bi-lock-fill"></i>
                                  Restrito
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4">
                        <div className="empty-state-table">
                          <i className="bi bi-people"></i>
                          <p>Nenhum membro vinculado a este grupo.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA - ADICIONAR MEMBRO */}
        <div className="detail-col-side">
          <div className="info-card">
            <h5 className="card-title">
              <i className="bi bi-person-plus-fill"></i>
              Adicionar Membro
            </h5>

            <form onSubmit={handleSubmit}>
              <div className="form-group-custom">
                <label className="input-label">
                  <i className="bi bi-envelope-fill me-1"></i>
                  E-mail do Usuário
                </label>
                <input
                  type="email"
                  className="custom-input-dark"
                  value={emailToAdd}
                  onChange={(e) => setEmailToAdd(e.target.value)}
                  placeholder="usuario@email.com"
                  required
                  disabled={!canManage || actionLoading}
                />
                <small className="form-hint">
                  Digite o e-mail corporativo do usuário para adicioná-lo ao grupo
                </small>
              </div>

              <button
                type="submit"
                className="btn-add-member"
                disabled={!canManage || actionLoading || !emailToAdd}
              >
                {actionLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Processando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus-fill me-2"></i>
                    Inserir no Grupo
                  </>
                )}
              </button>
            </form>

            {!canManage && (
              <div className="permission-warning">
                <i className="bi bi-shield-exclamation"></i>
                Você não tem permissão para gerenciar este grupo
              </div>
            )}
          </div>

          {/* Informações adicionais do grupo */}
          <div className="info-card mt-3">
            <h5 className="card-title">
              <i className="bi bi-info-circle-fill"></i>
              Informações do Grupo
            </h5>
            <div className="group-info-list">
              <div className="group-info-item">
                <span className="info-label">Criado por</span>
                <span className="info-value">
                  {group.creator?.name || "Sistema"}
                </span>
              </div>
              <div className="group-info-item">
                <span className="info-label">Data de criação</span>
                <span className="info-value">
                  {new Date(group.created_at).toLocaleDateString("pt-BR", {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </span>
              </div>
              {group.description && (
                <div className="group-info-item">
                  <span className="info-label">Descrição</span>
                  <span className="info-value description">
                    {group.description}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GERENCIADOR DE PERMISSÕES DO GRUPO */}
      <div className="permission-manager-wrapper">
        <GroupPermissionManager
          group={group}
          permissions={allAvailablePermissions}
          onAddPermission={onAddPermission}
          onRemovePermission={onRemovePermission}
          actionLoading={actionLoading}
          canManage={canManage}
        />
      </div>

      {/* ZONA DE PERIGO */}
      {canManage && (
        <div className="danger-zone">
          <div className="info-card danger-card">
            <div className="danger-zone-content">
              <div className="danger-zone-text">
                <h5 className="text-danger fw-bold">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Zona de Perigo
                </h5>
                <p className="text-dim small mb-0">
                  Uma vez excluído, o grupo e todos os seus vínculos não podem ser recuperados.
                  Esta ação é irreversível.
                </p>
              </div>
              <button
                className="btn-delete-permanent"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                <i className="bi bi-trash3"></i>
                {actionLoading ? "..." : "Excluir Grupo Permanentemente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}