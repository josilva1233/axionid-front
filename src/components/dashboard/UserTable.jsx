// UserTable.js

export default function UserTable({ users, onViewDetail, onDeleteUser, onToggleAdmin, isGlobalAdmin }) {
  
  // TRAVA DE SEGURANÇA: Se não for admin, não renderiza a tabela de jeito nenhum
  if (!isGlobalAdmin) {
    return null; 
  }

  return (
    <div className="table-responsive animate-in">
      <table className="axion-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>NOME DO USUÁRIO</th>
            <th>E-MAIL CORPORATIVO</th>
            <th className="text-center">NÍVEL</th>
            <th className="text-center">STATUS</th>
            <th className="text-end">AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => (
              <tr key={u.id}>
                <td className="mono-text" style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                  #{u.id}
                </td>

                <td>
                  <strong style={{ color: "var(--text-main)" }}>
                    {u.name}
                  </strong>
                </td>

                <td className="text-dim" style={{ fontSize: "0.9rem" }}>
                  {u.email}
                </td>

                <td className="text-center">
                  <span
                    className={`badge ${u.is_admin ? "badge-success" : "badge-operacional"}`}
                    style={{ 
                      fontSize: "0.7rem", 
                      cursor: "pointer" 
                    }}
                    onClick={() => onToggleAdmin && onToggleAdmin(u.id, u.is_admin)}
                    title="Clique para alterar nível"
                  >
                    {u.is_admin ? "ADMIN" : "USER"}
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
                        backgroundColor: u.is_active ? "var(--success)" : "var(--danger)",
                      }}
                    />
                    <span style={{ fontSize: "0.85rem", color: u.is_active ? "var(--success)" : "var(--danger)" }}>
                      {u.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </td>

                <td className="text-end">
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      className="btn-table-action"
                      onClick={() => onViewDetail(u.id)}
                      title="Visualizar Detalhes"
                    >
                      <i className="bi bi-eye"> Gerenciar</i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-5 text-dim">
                <div className="d-flex flex-column align-items-center">
                  <span style={{ fontSize: "1.5rem" }}>🔍</span>
                  <p className="mt-2 mb-0">Nenhum usuário encontrado.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}