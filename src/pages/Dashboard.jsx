import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [role] = useState(localStorage.getItem('@AxionID:role'));
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Busca inicial automática para Admins
  useEffect(() => {
    if (role === 'admin') {
      fetchUsers();
    }
  }, [role]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/users');
      // Acessa a estrutura de paginação do Laravel: data.data
      if (response.data && response.data.data) {
        setUsers(response.data.data);
      }
    } catch (error) {
      // Falha silenciosa em caso de erro de rede ou 401
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/api/v1/logout');
    } finally {
      localStorage.clear();
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="brand">
          <h1>Axion<span>ID</span></h1>
        </div>
        
        <div className="user-nav">
          <div className="user-info">
            <span className="user-status">Online</span>
            <span className="user-role">
              {role === 'admin' ? 'Administrador' : 'Operacional'}
            </span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Sair
          </button>
        </div>
      </header>

      <main className="dashboard-content animate-in">
        {role === 'admin' ? (
          <div className="content-card">
            <div className="card-top-actions">
              <h3>Gestão de Identidades</h3>
              <button onClick={fetchUsers} className="btn-primary" disabled={loading}>
                {loading ? 'Sincronizando...' : 'Atualizar'}
              </button>
            </div>

            <div className="table-responsive">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>CPF/CNPJ</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td className="txt-bold">{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.cpf_cnpj || '---'}</td>
                        <td>
                          <span className={user.is_active ? 'tag-active' : 'tag-blocked'}>
                            {user.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="txt-center">Nenhum usuário encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="content-card">
            <h3>Área Operacional</h3>
            <p>Bem-vindo ao AxionID. Você tem acesso de visualização comum.</p>
          </div>
        )}
      </main>
    </div>
  );
}