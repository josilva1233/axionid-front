export default function GroupTable({ groups, onViewDetail, currentUser }) {
  return (
    <div className="table-responsive">
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
              const isSystemAdmin = currentUser?.is_admin === 1 || currentUser?.is_admin === true;
              const canManage = isSystemAdmin ||
                g.creator_id === currentUser?.id ||
                g.users?.some((u) => u.id === currentUser?.id && u.pivot?.role === "admin");

              return (
                <tr key={g.id}>
                  <td className="mono-text">
                    #{g.id}
                  </td>
                  <td>
                    <strong className="text-primary">
                      {g.name.toUpperCase()}
                    </strong>
                  </td>
                  <td className="text-dim">
                    {g.creator?.name || "Sistema"}
                  </td>
                  <td className="text-center">
                    <span className="badge-operacional">
                      {g.users_count || g.users?.length || 0}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="status-indicator-wrapper">
                      <span
                        className="status-indicator"
                        style={{
                          backgroundColor: canManage ? "var(--primary)" : "#6c757d",
                        }}
                      />
                      <span className="status-text">
                        {isSystemAdmin ? "Admin Global" : canManage ? "Administrador" : "Membro"}
                      </span>
                    </div>
                  </td>
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
                      <span className="readonly-badge">
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
                <div className="empty-state">
                  <span className="empty-icon">📁</span>
                  <p className="mt-2 mb-0">Nenhum grupo identificado nesta conta.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}