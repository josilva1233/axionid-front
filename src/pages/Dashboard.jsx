import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('@AxionID:token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Busca perfil logado
        const profileRes = await api.get('/api/v1/me');
        const user = profileRes.data;
        setCurrentUser(user);

        // Se for admin REAL (vindo do backend)
        if (user.is_admin) {
          const usersRes = await api.get('/api/v1/users');
          const data = usersRes.data.data || usersRes.data;
          setUsers(Array.isArray(data) ? data : []);
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post('/api/v1/logout');
    } finally {
      localStorage.clear();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="dashboard-container">

      {currentUser && (!currentUser.profile_completed || !currentUser.cpf_cnpj) && (
        <div className="profile-sidebar-alert animate-in">
          <div className="alert-header">
            <span className="alert-icon">⚠️</span>
            <strong>Ação Requerida</strong>
          </div>
          <p>Olá <strong>{currentUser.name}</strong>, finalize seu cadastro.</p>
          <button onClick={() => navigate('/complete-profile')} className="btn-alert-link">
            Completar agora →
          </button>
        </div>
      )}

      <header className="dashboard-header">
        <div className="brand">
          <h1>Axion<span>ID</span></h1>
        </div>

        <div className="user-nav">
          <div className="user-info">
            <span className="user-status">Online</span>
            <span className="user-role">
              {currentUser?.is_admin ? 'Administrador' : 'Operacional'}
            </span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Sair
          </button>
        </div>
      </header>

      <main className="dashboard-content animate-in">
        {currentUser?.is_admin ? (
          <div className="content-card">
            <div className="card-header-flex">
              <h3>Gestão de Identidades</h3>
              <span className="count-badge">{users.length} usuários</span>
            </div>

            {loading ? (
              <div className="loading-spinner">Carregando identidades...</div>
            ) : (
              <div className="table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>E-mail</th>
                      <th>CPF/CNPJ</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.cpf_cnpj || 'Pendente'}</td>
                        <td>
                          {user.profile_completed ? 'Validado' : 'Pendente'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="content-card">
            <h3>Área Operacional</h3>
            <p>Bem-vindo, <strong>{currentUser?.name}</strong>.</p>
          </div>
        )}
      </main>
    </div>
  );
}c