export default function GroupTable({ groups, onViewDetail, currentUser }) {
  return (
    <div className="table-responsive animate-in">
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
              // 1. Verifica se é Admin Global do Sistema (is_admin no banco)
              const isSystemAdmin =
                currentUser?.is_admin === 1 || currentUser?.is_admin === true;

              // 2. Verifica se tem permissão de gerência (Criador OU Admin do Grupo OU Admin Global)
              const canManage =
                isSystemAdmin ||
                g.creator_id === currentUser?.id ||
                g.users?.some(
                  (u) => u.id === currentUser?.id && u.pivot?.role === "admin",
                );

              return (
                <tr key={g.id}>
                  {/* ID técnico com estilo Monos */}
                  <td
                    className="mono-text"
                    style={{ fontSize: "0.8rem", opacity: 0.7 }}
                  >
                    #{g.id}
                  </td>

                  {/* Nome do Grupo em destaque */}
                  <td>
                    <strong
                      style={{
                        color: "var(--primary)",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {g.name.toUpperCase()}
                    </strong>
                  </td>

                  {/* Criador do Grupo */}
                  <td className="text-dim" style={{ fontSize: "0.9rem" }}>
                    {g.creator?.name || "Sistema"}
                  </td>

                  {/* Contagem de Membros com Badge Operacional */}
                  <td className="text-center">
                    <span
                      className="badge badge-operacional"
                      style={{ fontSize: "0.75rem", minWidth: "40px" }}
                    >
                      {g.users_count || g.users?.length || 0}
                    </span>
                  </td>

                  {/* Status de Vínculo (Lógica baseada em permissão) */}
                  <td className="text-center">
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <span
                        className="status-indicator"
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: canManage
                            ? "var(--primary)"
                            : "#6c757d",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-main)",
                        }}
                      >
                        {isSystemAdmin
                          ? "Admin Global"
                          : canManage
                            ? "Administrador"
                            : "Membro"}
                      </span>
                    </div>
                  </td>

                  {/* Ações: Gerenciar para Admins, Cadeado para Membros */}
                  <td className="text-end">
                    {canManage ? (
                      <button
                        className="btn-table-action"
                        onClick={() => onViewDetail(g.id)}
                        title="Gerenciar Membros e Configurações"
                      >
                        <i className="bi bi-gear-fill me-1"></i>
                        Gerenciar
                      </button>
                    ) : (
                      <span
                        className="text-dim small"
                        style={{ fontStyle: "italic", opacity: 0.8 }}
                      >
                        <i className="bi bi-lock-fill me-1"></i> Somente Leitura
                      </span>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-5 text-dim">
                <div className="d-flex flex-column align-items-center">
                  <span style={{ fontSize: "1.5rem" }}>📁</span>
                  <p className="mt-2 mb-0">
                    Nenhum grupo identificado nesta conta.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
