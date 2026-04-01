export default function UserTable({ 
  users, 
  onViewDetail, 
  onDeleteUser, 
  onToggleAdmin, 
  isGlobalAdmin,
  onManagePermissions // Nova prop para gerenciar permissões
}) {
  if (!isGlobalAdmin) {
    return null;
  }

  return (
    <div className="table-responsive">
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
                <td className="mono-text">
                  #{u.id}
                </td>
                <td>
                  <strong className="text-white">
                    {u.name}
                  </strong>
                </td>
                <td className="text-dim">
                  {u.email}
                </td>
                <td className="text-center">
                  <span
                    className={`badge ${u.is_admin ? "badge-success" : "badge-operacional"} clickable`}
                    onClick={() => onToggleAdmin && onToggleAdmin(u.id, u.is_admin)}
                    title="Clique para alterar nível"
                  >
                    {u.is_admin ? "ADMIN" : "USER"}
                  </span>
                </td>
                <td className="text-center">
                  <div className="status-indicator-wrapper">
                    <span
                      className="status-indicator"
                      style={{
                        backgroundColor: u.is_active ? "var(--success)" : "var(--error)",
                      }}
                    />
                    <span className="status-text" style={{ color: u.is_active ? "var(--success)" : "var(--error)" }}>
                      {u.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </td>
                <td className="text-end">
                  <div className="actions-wrapper">
                    <button
                      className="btn-table-action"
                      onClick={() => onViewDetail(u.id)}
                      title="Visualizar Detalhes"
                    >
                      <i className="bi bi-eye"></i> Detalhes
                    </button>
                    {onManagePermissions && (
                      <button
                        className="btn-table-action"
                        onClick={() => onManagePermissions(u.id)}
                        title="Gerenciar Permissões"
                        style={{ marginLeft: '8px' }}
                      >
                        <i className="bi bi-shield-lock"></i> Permissões
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-5 text-dim">
                <div className="empty-state">
                  <span className="empty-icon">🔍</span>
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