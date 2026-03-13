import { useState } from "react";

export default function GroupDetail({
  group,
  onBack,
  onAddUser,
  onRemoveUser,
  onPromoteUser,
  onDemoteUser, // Nova prop necessária para remover a função admin
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
    if (
      window.confirm(
        `ATENÇÃO: Deseja realmente excluir o grupo "${group.name}"?`,
      )
    ) {
      onDeleteGroup(group.id);
    }
  };

  if (!group) {
    return (
      <div className="text-center py-5">
        <p className="text-dim">Carregando dados do grupo...</p>
        <button className="btn-secondary" onClick={onBack}>
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="group-detail-container animate-in w-100">
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom-theme">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn-filter-clear d-flex align-items-center px-3 py-2"
            onClick={onBack}
          >
            <i className="bi bi-arrow-left me-2"></i>
            <span>Voltar</span>
          </button>
          <h2 className="mb-0 text-white fs-4 fw-bold">
            Gerenciar Grupo:{" "}
            <span className="text-primary">{group.name?.toUpperCase()}</span>
          </h2>
        </div>
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
                    group.users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <strong className="text-white">{user.name}</strong>
                            {user.pivot?.role === "admin" && (
                              <span
                                className="badge bg-primary ms-2"
                                style={{ fontSize: "0.6rem" }}
                              >
                                ADMIN
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-dim">{user.email}</td>
                        <td className="text-end">
                          <div className="d-flex gap-2 justify-content-end align-items-center">
                            {/* BOTÃO ALTERNÁVEL: PROMOVER OU REMOVER ADMIN */}
                            {user.pivot?.role === "admin" ? (
                              <button
                                className="btn btn-outline-warning btn-sm px-3"
                                style={{
                                  fontSize: "0.75rem",
                                  height: "32px",
                                  minWidth: "120px",
                                }}
                                onClick={() =>
                                  onDemoteUser && onDemoteUser(user.id)
                                }
                                disabled={actionLoading}
                                title="Remover cargo de administrador"
                              >
                                <i className="bi bi-shield-minus me-1"></i>
                                Remover Admin
                              </button>
                            ) : (
                              <button
                                className="btn btn-outline-success btn-sm px-3"
                                style={{
                                  fontSize: "0.75rem",
                                  height: "32px",
                                  minWidth: "120px",
                                }}
                                onClick={() =>
                                  onPromoteUser && onPromoteUser(user.id)
                                }
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
                      <td
                        colSpan="3"
                        className="text-center py-5 text-dim italic"
                      >
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
          <div className="info-card p-4">
            <h5 className="text-white mb-3 fw-bold">Adicionar Membro</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="text-dim small text-uppercase fw-bold mb-2 d-block">
                  E-mail do Usuário
                </label>
                <input
                  type="email"
                  className="custom-input-dark w-100"
                  value={emailToAdd}
                  onChange={(e) => setEmailToAdd(e.target.value)}
                  placeholder="usuario@email.com"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary-axion w-100 py-2 fw-bold"
                disabled={actionLoading || !emailToAdd}
              >
                {actionLoading ? "Processando..." : "Inserir no Grupo"}
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* SEÇÃO DE AÇÕES CRÍTICAS - PADRÃO IDENTIDADE VISUAL */}
      {(isSystemAdmin ||
        Number(currentUserId) === Number(group.creator_id)) && (
        <section
          className="actions-section mt-5 p-4"
          style={{
            background: "rgba(220, 53, 69, 0.05)",
            borderRadius: "16px",
            border: "1px solid rgba(220, 53, 69, 0.2)",
          }}
        >
          <h4
            className="text-danger mb-4"
            style={{
              fontSize: "0.75rem",
              fontWeight: "800",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
            }}
          >
            Gestão de Acesso e Privilégios do Grupo
          </h4>

          <div className="critical-actions-grid">
            <div className="main-actions">
              {/* Mantendo o padrão de grid, mas focado na exclusão do grupo */}
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="btn-delete-permanent"
              >
                {actionLoading
                  ? "Processando..."
                  : "Excluir Grupo Permanentemente"}
              </button>
            </div>
          </div>

          <p className="text-dim small mt-3 mb-0">
            <i className="bi bi-info-circle me-2"></i>
            Atenção: A exclusão do grupo{" "}
            <strong>{group.name?.toUpperCase()}</strong> removerá todos os
            vínculos de membros imediatamente.
          </p>
        </section>
      )}
    </div>
  );
}
