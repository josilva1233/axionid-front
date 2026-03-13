import { useState } from "react";

export default function GroupDetail({
  group,
  onBack,
  onAddUser,
  onRemoveUser,
  onPromoteUser,
  onDemoteUser,
  onDeleteGroup,
  actionLoading,
  currentUserId, // Adicione esta prop para identificar o usuário logado
  isSystemAdmin, // Adicione esta prop para saber se é admin total
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
    if (window.confirm(`PERIGO: Deseja realmente EXCLUIR PERMANENTEMENTE o grupo "${group.name}"? Esta ação não pode ser desfeita.`)) {
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
    <div className="group-detail-container animate-in w-100">
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom-theme">
        <div className="d-flex align-items-center gap-3">
          <button className="btn-filter-clear d-flex align-items-center px-3 py-2" onClick={onBack}>
            <i className="bi bi-arrow-left me-2"></i>
            <span>Voltar</span>
          </button>
          <h2 className="mb-0 text-white fs-4 fw-bold">
            Gerenciar Grupo: <span className="text-primary">{group.name?.toUpperCase()}</span>
          </h2>
        </div>

        {/* BOTÃO EXCLUIR GRUPO - Visível apenas para o Dono ou Super Admin */}
        {(isSystemAdmin || Number(currentUserId) === Number(group.creator_id)) && (
          <button 
            className="btn btn-outline-danger d-flex align-items-center px-3" 
            onClick={handleDelete}
            disabled={actionLoading}
          >
            <i className="bi bi-trash3 me-2"></i>
            Excluir Grupo
          </button>
        )}
      </div>

      <div className="row g-4">
        <div className="col-md-8">
          <div className="info-card p-4">
            <h5 className="text-white mb-4 fw-bold">Membros Atuais</h5>
            <div className="table-responsive">
              <table className="axion-table w-100">
                <thead>
                  <tr>
                    <th>NOME</th>
                    <th>E-MAIL</th>
                    <th className="text-end">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {group.users?.length > 0 ? (
                    group.users.map((user) => {
                      const isOwner = Number(user.id) === Number(group.creator_id);
                      const isMe = Number(user.id) === Number(currentUserId);
                      // Travas: Admin total ignora bloqueios, outros não podem mexer no dono ou em si mesmos
                      const canManage = isSystemAdmin || (!isOwner && !isMe);

                      return (
                        <tr key={user.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <strong className={isMe ? "text-primary" : "text-white"}>
                                {user.name} {isMe && "(Você)"}
                              </strong>
                              {isOwner && (
                                <span className="badge bg-warning text-dark ms-2" style={{ fontSize: "0.6rem" }}>DONO</span>
                              )}
                              {user.pivot?.role === "admin" && !isOwner && (
                                <span className="badge bg-primary ms-2" style={{ fontSize: "0.6rem" }}>ADMIN</span>
                              )}
                            </div>
                          </td>
                          <td className="text-dim">{user.email}</td>
                          <td className="text-end">
                            <div className="d-flex gap-2 justify-content-end align-items-center">
                              
                              {user.pivot?.role === "admin" ? (
                                <button
                                  className="btn btn-outline-warning btn-sm px-3"
                                  style={{ fontSize: "0.75rem", height: "32px", minWidth: "120px" }}
                                  onClick={() => onDemoteUser && onDemoteUser(user.id)}
                                  disabled={actionLoading || !canManage}
                                  title={!canManage ? "Proteção de cargo" : "Remover admin"}
                                >
                                  <i className={`bi ${canManage ? 'bi-shield-minus' : 'bi-shield-lock'} me-1`}></i>
                                  Remover Admin
                                </button>
                              ) : (
                                <button
                                  className="btn btn-outline-success btn-sm px-3"
                                  style={{ fontSize: "0.75rem", height: "32px", minWidth: "120px" }}
                                  onClick={() => onPromoteUser && onPromoteUser(user.id)}
                                  disabled={actionLoading}
                                >
                                  <i className="bi bi-shield-check me-1"></i>
                                  Tornar Admin
                                </button>
                              )}

                              <button
                                className="btn-critical-secondary btn-sm px-3"
                                style={{ fontSize: "0.75rem", height: "32px" }}
                                onClick={() => onRemoveUser(user.id, user.name)}
                                disabled={actionLoading || !canManage}
                              >
                                Remover
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="3" className="text-center py-5 text-dim italic">Nenhum membro vinculado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="info-card p-4">
            <h5 className="text-white mb-3 fw-bold">Adicionar Membro</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="text-dim small text-uppercase fw-bold mb-2 d-block">E-mail do Usuário</label>
                <input
                  type="email"
                  className="custom-input-dark w-100"
                  value={emailToAdd}
                  onChange={(e) => setEmailToAdd(e.target.value)}
                  placeholder="usuario@email.com"
                  required
                />
              </div>
              <button type="submit" className="btn-primary-axion w-100 py-2 fw-bold" disabled={actionLoading || !emailToAdd}>
                {actionLoading ? "Processando..." : "Inserir no Grupo"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}