import { useNavigate } from 'react-router-dom';

export default function UserTable({ users, onViewDetails }) {
  return (
    <div className="table-card">
      <table className="axion-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Acesso</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => (
              <tr key={u.id} className="animate-in">
                <td className="mono-text">#{u.id}</td>
                <td>
                  <strong>{u.name}</strong>
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`text-dim small`}>
                    {u.is_admin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.is_active ? 'success' : 'danger'}`}>
                    {u.is_active ? 'Ativo' : 'Bloqueado'}
                  </span>
                </td>
                <td>
                  {/* Agora usamos a função vinda do Dashboard pai */}
                  <button 
                    className="btn-small" 
                    onClick={() => onViewDetails(u.id)}
                  >
                    Detalhes
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-4 text-dim">
                Nenhum usuário encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}