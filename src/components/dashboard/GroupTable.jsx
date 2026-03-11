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
              // --- LÓGICA DE PERMISSÃO ACRESCENTADA AQUI ---
              const isGroupAdmin = 
                g.creator_id === currentUser?.id || 
                g.users?.some(u => u.id === currentUser?.id && u.pivot?.role === 'admin');

              return (
                <tr key={g.id}>
                  <td className="mono-text" style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                    #{g.id}
                  </td>

                  <td>
                    <strong style={{ color: "var(--primary)", letterSpacing: "0.5px" }}>
                      {g.name.toUpperCase()}
                    </strong>
                  </td>

                  <td className="text-dim" style={{ fontSize: "0.9rem" }}>
                    {g.creator?.name || "Sistema"}
                  </td>

                  <td className="text-center">
                    <span className="badge badge-operacional" style={{ fontSize: "0.75rem", minWidth: "40px" }}>
                      {g.users_count || g.users?.length || 0}
                    </span>
                  </td>

                  <td className="text-center">
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <span
                        className="status-indicator"
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: isGroupAdmin ? "var(--primary)" : "#6c757d",
                        }}
                      />
                      <span style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
                        {isGroupAdmin ? "Administrador" : "Membro"}
                      </span>
                    </div>
                  </td>

                  <td className="text-end">
                    {/* --- BOTÃO CONDICIONAL ACRESCENTADO AQUI --- */}
                    {isGroupAdmin ? (
                      <button
                        className="btn-table-action"
                        onClick={() => onViewDetail(g.id)}
                        title="Gerenciar Membros e Configurações"
                      >
                        <i className="bi bi-gear-fill me-1"></i>
                        Gerenciar
                      </button>
                    ) : (
                      <span className="text-dim small" style={{ fontStyle: 'italic' }}>
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