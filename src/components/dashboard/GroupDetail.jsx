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
      {/* BARRA DE TOPO PADRONIZADA */}
      <div className="user-detail-header mb-4 p-3">
        <div className="header-left d-flex align-items-center gap-3">
          {/* Botão de Voltar mais discreto e elegante */}
          <button
            className="btn-filter-clear btn-back d-flex align-items-center"
            onClick={onBack}
          >
            <i className="bi bi-arrow-left me-2"></i>
            <span className="fw-medium">Voltar</span>
          </button>

          <div className="vertical-divider"></div>

          <div className="user-title-block d-flex flex-column">
            {/* Label pequeno em cima para contexto */}
            <span
              className="user-id-text text-uppercase tracking-wider mb-1"
              style={{ fontSize: "0.65rem", opacity: 0.6 }}
            >
              Painel de Controle / Grupos
            </span>

            {/* Título principal com destaque no nome do grupo */}
            <h1
              className="user-name-text m-0 d-flex align-items-center"
              style={{ fontSize: "1.2rem", fontWeight: 500 }}
            >
              <span className="text-dim me-2">Gerenciar Grupo:</span>
              <span className="text-primary fw-bold">
                {group.name?.toUpperCase()}
              </span>
            </h1>
          </div>
        </div>
        <div className="header-actions">
          <span className="badge badge-operacional">Informativo</span>
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
                    <th>FUNÇÃO</th>
                    <th>E-MAIL</th>
                    <th className="text-end">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {group.users?.length > 0 ? (
                    group.users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <strong className="text-white">{user.name}</strong>
                        </td>
                        <td>
                          <span
                            className={`badge ${user.pivot?.role === "admin" ? "bg-primary" : "bg-secondary"}`}
                            style={{ fontSize: "0.6rem" }}
                          >
                            {user.pivot?.role === "admin" ? "ADMIN" : "COMUM"}
                          </span>
                        </td>
                        <td className="text-dim">{user.email}</td>
                        <td className="text-end">
                          <div className="d-flex gap-2 justify-content-end align-items-center">
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
                        colSpan="4"
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
                <label className="input-label">E-mail do Usuário</label>
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

      {/* ZONA DE PERIGO */}
      <div className="row mt-4">
        <div className="col-12">
          <section className="critical-actions-section p-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="text-danger fw-bold mb-1">Zona de Perigo</h5>
                <p className="text-dim small mb-0">
                  Uma vez excluído, o grupo e seus vínculos não podem ser
                  recuperados.
                </p>
              </div>
              <button
                className="btn btn-outline-danger fw-bold"
                onClick={handleDelete}
                disabled={actionLoading}
                style={{ height: "42px" }}
              >
                <i className="bi bi-trash3 me-2"></i>
                Excluir Grupo Permanente
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
