import { useState } from "react";

export default function GroupDetail({
  group,
  onBack,
  onAddUser,
  onRemoveUser,
  onPromoteUser,
  onDemoteUser, // Prop para remover a função admin
  onDeleteGroup,
  actionLoading,
  // --- NOVAS PROPS ---
  onAddPermission,
  onRemovePermission,
  allAvailablePermissions = [],
  // -------------------
  currentUserId, // Identificar o usuário logado
  isSystemAdmin, // Saber se é admin total
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
      {/* BARRA DE TOPO PADRONIZADA */}
      <div className="user-detail-header mb-4 p-3 d-flex align-items-center justify-content-between">
        <div className="header-left d-flex align-items-center">
          <button className="btn-filter-clear btn-back" onClick={onBack}>
            <i className="bi bi-arrow-left me-2"></i>
            Voltar
          </button>

          <div className="vertical-divider mx-3"></div>

          <div className="user-title-block">
            <span className="user-name-text">
              Gerenciar Grupo:{" "}
              <span className="text-primary">{group.name?.toUpperCase()}</span>
            </span>
            <span className="user-id-text">ID: {group.id}</span>
          </div>
        </div>

        <div className="header-actions">
          {/* Botão de Excluir no Topo para consistência com UserDetail */}
          <button
            className="btn-critical-primary btn-edit"
            onClick={handleDelete}
            disabled={actionLoading}
            style={{ background: "var(--bs-danger)", border: "none" }}
          >
            <i className="bi bi-trash3 me-2"></i>
            {actionLoading ? "..." : "Excluir Grupo"}
          </button>
        </div>
      </div>

      <br />

      <div className="row g-4">
        {/* TABELA DE MEMBROS */}
        <div className="col-md-8">
          <div className="info-card p-4">
            <h5 className="text-white mb-4 fw-bold">Membros Atuais</h5>
            <div className="table-responsive">
              <table className="axion-table w-100">
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
                        <td>
                          <div className="d-flex align-items-center">
                            <strong className="text-white">{user.name}</strong>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span
                              className={`badge ms-2 ${
                                user.pivot?.role === "admin"
                                  ? "bg-primary"
                                  : "bg-secondary"
                              }`}
                              style={{ fontSize: "0.6rem" }}
                            >
                              {user.pivot?.role === "admin" ? "ADMIN" : "COMUM"}
                            </span>
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

        {/* CARD ADICIONAR MEMBRO */}
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

      {/* SEÇÃO DE PERMISSÕES (ACL) */}
      <div className="row mt-4">
        <div className="col-12">
          <section className="info-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="card-title mb-0">Chaves de Permissão (ACL)</h4>
              <div className="d-flex gap-2">
                <select
                  className="custom-input-dark py-1 px-2"
                  style={{ fontSize: "0.8rem", minWidth: "200px" }}
                  onChange={(e) => {
                    if (e.target.value) onAddPermission(e.target.value);
                    e.target.value = ""; // Resetar o select após escolher
                  }}
                  value=""
                >
                  <option value="">+ Atribuir Nova Chave</option>
                  {allAvailablePermissions.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.label} ({p.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="axion-table w-100">
                <thead>
                  <tr>
                    <th style={{ width: "80px" }}>ID</th>
                    <th>NOME DA PERMISSÃO</th>
                    <th>CHAVE (SLUG)</th>
                    <th>TIPO</th>
                    <th>CRIADO EM</th>
                    <th className="text-end">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {group.permissions?.length > 0 ? (
                    group.permissions.map((perm) => (
                      <tr key={perm.id}>
                        <td className="text-dim mono-text">#{perm.id}</td>
                        <td>
                          <strong className="text-white text-uppercase">
                            {perm.label}
                          </strong>
                        </td>
                        <td>
                          <code className="text-primary-light bg-dark px-2 py-1 rounded">
                            {perm.name}
                          </code>
                        </td>
                        <td>
                          <span className="badge border border-secondary text-dim">
                            IAM
                          </span>
                        </td>
                        <td className="text-dim small">
                          {new Date(perm.created_at).toLocaleDateString(
                            "pt-BR",
                          )}
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-link text-danger p-0"
                            onClick={() => onRemovePermission(perm.id)}
                            disabled={actionLoading}
                          >
                            <i className="bi bi-trash">Deletar</i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-5 text-dim italic"
                      >
                        Nenhuma permissão especial atribuída a este grupo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      <br />

      {/* ZONA DE PERIGO */}
      <div className="row mt-4">
        <div className="col-12">
          <div
            className="info-card p-4 border-danger-subtle"
            style={{ border: "1px solid rgba(255, 0, 0, 0.2)" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="text-danger fw-bold mb-1">Zona de Perigo</h5>
                <p className="text-dim small mb-0">
                  Uma vez excluído, o grupo e seus vínculos não podem ser
                  recuperados.
                </p>
              </div>
              <button
                className="btn-critical-primary btn-edit"
                onClick={handleDelete}
                disabled={actionLoading}
                style={{ background: "var(--bs-danger)", border: "none" }}
              >
                <i className="bi bi-trash3 me-2"></i>
                {actionLoading ? "..." : "Excluir Grupo"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}