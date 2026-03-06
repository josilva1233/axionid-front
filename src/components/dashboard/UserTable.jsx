// UserTable.js
export default function UserTable({ users }) {
  const navigate = useNavigate();
  if (!users || users.length === 0) return <p className="p-4 text-center">Nenhum usuário encontrado.</p>;

  return (
    <div className="table-card">
      <table className="axion-table">
        <thead>
          <tr><th>ID</th><th>Nome</th><th>Acesso</th><th>Status</th><th>Ações</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td className="mono-text">#{u.id}</td>
              <td>{u.name}</td>
              <td>{u.is_admin ? 'Admin' : 'User'}</td>
              <td><span className={`badge ${u.is_active ? 'success' : 'danger'}`}>{u.is_active ? 'Ativo' : 'Bloqueado'}</span></td>
              <td><button onClick={() => navigate(`/dashboard/user/${u.id}`)}>Detalhes</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}