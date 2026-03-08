import { useNavigate } from 'react-router-dom';

export default function UserTable({ users }) {
  const navigate = useNavigate();
  return (
    <div className="table-card">
      <table className="axion-table">
        <thead>
          <tr>
            <th>ID</th><th>Nome</th><th>E-mail</th><th>Acesso</th><th>Status</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map(u => (
              <tr key={u.id}>
                <td className="mono-text">#{u.id}</td>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>{u.is_admin ? 'Admin' : 'User'}</td>
                <td>
                  <span className={`badge ${u.is_active ? 'success' : 'danger'}`}>
                    {u.is_active ? 'Ativo' : 'Bloqueado'}
                  </span>
                </td>
                <td>
                  <button className="btn-small" onClick={() => navigate(`/dashboard/user/${u.id}`)}>Detalhes</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="6" className="text-center py-4">Nenhum usuário encontrado.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}