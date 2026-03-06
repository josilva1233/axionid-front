import { useNavigate } from "react-router-dom";
import { memo } from "react";

const UserTable = memo(({ users }) => {
  const navigate = useNavigate();

  if (!users || users.length === 0) {
    return (
      <div className="empty-state-table">
        <p>Nenhum usuário encontrado na base de dados.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="axion-table">
        <thead>
          <tr>
            <th>Identidade</th>
            <th>E-mail Corporativo</th>
            <th>Nível de Acesso</th>
            <th>Status</th>
            <th className="text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="table-row-hover">
              <td className="user-cell">
                <div className="user-info-combined">
                  <div className="avatar-small">{u.name?.charAt(0).toUpperCase()}</div>
                  <div className="name-stack">
                    <strong>{u.name}</strong>
                    <span className="mono-text small">ID: #{u.id}</span>
                  </div>
                </div>
              </td>
              
              <td className="email-cell">{u.email}</td>
              
              <td>
                <span className={`role-tag ${u.is_admin ? "admin" : "user"}`}>
                  {u.is_admin ? "Administrador" : "Operacional"}
                </span>
              </td>
              
              <td>
                <span className={`status-pill ${u.is_active ? "active" : "blocked"}`}>
                  {u.is_active ? "Ativo" : "Bloqueado"}
                </span>
              </td>
              
              <td className="text-right">
                <button
                  className="btn-action-icon"
                  onClick={() => navigate(`/dashboard/user/${u.id}`)}
                  title="Gerenciar Identidade"
                >
                  <span className="icon">⚙️</span> Gerenciar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default UserTable;