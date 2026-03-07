import { useNavigate } from 'react-router-dom';

export default function UserTable({ users }) {
  const navigate = useNavigate();
  return (
    <div className="table-card animate-in">
      <table className="axion-table">
        <thead><tr><th>Nome</th><th>Papel</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td><span className="badge">{u.is_admin ? 'Admin' : 'User'}</span></td>
              <td><span className={`badge ${u.is_active ? 'success' : 'danger'}`}>{u.is_active ? 'Ativo' : 'Bloqueado'}</span></td>
              <td><button className="btn-primary" style={{padding: '5px 10px'}} onClick={() => navigate(`/dashboard/user/${u.id}`)}>Ver</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}