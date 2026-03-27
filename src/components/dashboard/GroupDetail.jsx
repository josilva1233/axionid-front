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
      <div className="text-center py-5">
        <p className="text-dim">Carregando dados do grupo...</p>
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
              Gerenciar Grupo: <span className="text-primary">{group.name?.toUpperCase()}</span>
            </span>
            <span className="user-id-text">ID: {group.id}</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-delete-permanent" onClick={handleDelete} disabled={actionLoading}>
            <i className="bi bi-trash3 me-2"></i>
            {actionLoading ? "..." : "Excluir Grupo"}
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="col-md-8">
          <div className="info-card">
            <h5 className="card-title">Membros Atuais</h5>
            <div className="table-responsive">
              <table className="axion-table">
                <thead>
                  <tr>
                    <th>NOME</th>
                    <th>Função</th>
                    <th>E-MAIL</th>
                    <th className="text-end">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {group.users?.length > 0 ? (
                    group.users.map((user) => (
                      <tr key={user.id}>
                        <td><strong className="text-white">{user.name}</strong></td>
                        <td>
                          <span className={`badge ${user.pivot?.role === "admin" ? "badge-success" : "badge-operacional"}`}>
                            {user.pivot?.role === "admin" ? "ADMIN" : "COMUM"}
                          </span>
                        </td>
                        <td className="text-dim">{user.email}</td>
                        <td className="text-end">
                          <div className="actions-wrapper">
                            {user.pivot?.role === "admin" ? (
                              <button
                                className="btn-critical-secondary btn-sm"
                                onClick={() => onDemoteUser && onDemoteUser(user.id)}
                                disabled={actionLoading}
                              >
                                <i className="bi bi-shield-minus me-1"></i>
                                Remover Admin
                              </button>
                            ) : (
                              <button
                                className="btn-primary-sm"
                                onClick={() => onPromoteUser && onPromoteUser(user.id)}
                                disabled={actionLoading}
                              >
                                <i className="bi bi-shield-check me-1"></i>
                                Tornar Admin
                              </button>
                            )}
                            <button
                              className="btn-delete-permanent btn-sm"
                              onClick={() => onRemoveUser(user.id, user.name)}
                              disabled={actionLoading}
                            >
                              Remover
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-5 text-dim">
                        Nenhum membro vinculado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="info-card">
            <h5 className="card-title">Adicionar Membro</h5>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">E-mail do Usuário</label>
                <input
                  type="email"
                  className="custom-input-dark"
                  value={emailToAdd}
                  onChange={(e) => setEmailToAdd(e.target.value)}
                  placeholder="usuario@email.com"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-100 mt-3"
                disabled={actionLoading || !emailToAdd}
              >
                {actionLoading ? "Processando..." : "Inserir no Grupo"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Gerenciador de Permissões do Grupo - Substitui a seção antiga */}
      <GroupPermissionManager
        group={group}
        permissions={allAvailablePermissions}
        onAddPermission={onAddPermission}
        onRemovePermission={onRemovePermission}
        actionLoading={actionLoading}
      />

      <div className="danger-zone">
        <div className="info-card danger-card">
          <div className="danger-zone-content">
            <div>
              <h5 className="text-danger fw-bold mb-1">Zona de Perigo</h5>
              <p className="text-dim small mb-0">
                Uma vez excluído, o grupo e seus vínculos não podem ser recuperados.
              </p>
            </div>
            <button
              className="btn-delete-permanent"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              <i className="bi bi-trash3 me-2"></i>
              {actionLoading ? "..." : "Excluir Grupo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}