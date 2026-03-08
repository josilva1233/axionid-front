// Remova o import do useNavigate, você não precisará mais dele aqui
export default function UserTable({ users, onViewDetail }) { // <-- Receba onViewDetail aqui
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
                  {/* ALTERAÇÃO AQUI: Troque o navigate pela prop onViewDetail */}
                  <button 
                    className="btn-small" 
                    onClick={() => onViewDetail(u.id)}
                  >
                    Detalhes
                  </button>
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