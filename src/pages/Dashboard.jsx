import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();

  // Inicializamos os estados
  const [role, setRole] = useState(localStorage.getItem('@AxionID:role'));
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Memoizamos as funções de busca para evitar avisos de dependência
  const fetchMyProfile = useCallback(async () => {
    try {
      const response = await api.get('/api/v1/users');
      // No seu Laravel, se retornar uma lista, pegamos o primeiro (você mesmo)
      if (response.data && response.data.data) {
        setCurrentUser(response.data.data[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil atual:", error.response?.status);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/users');
      if (response.data && response.data.data) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Erro ao buscar lista de usuários:", error.response?.status);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initDashboard = async () => {
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get('token');
      const isAdminFromUrl = params.get('is_admin');

      let activeToken = localStorage.getItem('@AxionID:token');

      // 1. Prioridade: Se houver token na URL (Vindo do Google agora)
      if (tokenFromUrl) {
        activeToken = tokenFromUrl;
        const newRole = isAdminFromUrl === '1' ? 'admin' : 'operacional';
        
        localStorage.setItem('@AxionID:token', tokenFromUrl);
        localStorage.setItem('@AxionID:role', newRole);
        setRole(newRole);

        api.defaults.headers.common['Authorization'] = `Bearer ${tokenFromUrl}`;
        window.history.replaceState({}, document.title, "/dashboard");
      } 
      // 2. Se não tem na URL, tenta o salvo
      else if (activeToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${activeToken}`;
      } 
      // 3. Se não tem nada, tchau
      else {
        navigate('/login', { replace: true });
        return;
      }

      // Agora que o TOKEN está garantido no Header, buscamos os dados
      await fetchMyProfile();
    };

    initDashboard();
  }, [navigate, fetchMyProfile]);

  // Busca lista completa apenas se for admin
  useEffect(() => {
    if (role === 'admin') {
      fetchUsers();
    }
  }, [role, fetchUsers]);

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
      {/* ALERTA DE PERFIL INCOMPLETO */}
      {currentUser && (currentUser.profile_completed === false || !currentUser.cpf_cnpj) && (
        <div className="profile-sidebar-alert animate-in">
          <div className="alert-header">
            <span className="alert-icon">⚠️</span>
            <strong>Ação Requerida</strong>
          </div>
          <p>
            Olá <strong>{currentUser.name}</strong>, finalize seu cadastro para validar sua identidade.
          </p>
          <button
            onClick={() => navigate('/register?token=' + localStorage.getItem('@AxionID:token') + '&needs_cpf=true')}
            className="btn-alert-link"
          >
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
              {role === 'admin' ? 'Administrador' : 'Operacional'}
            </span>
          </div>
          <button onClick={handleLogout} className="btn-logout">Sair</button>
        </div>
      </header>

      <main className="dashboard-content animate-in">
        {role === 'admin' ? (
          <div className="content-card">
            <div className="card-header-flex">
              <h3>Gestão de Identidades</h3>
              <span className="count-badge">{users.length} usuários</span>
            </div>
            {loading ? (
              <div className="loading-spinner">Carregando dados...</div>
            ) : (
              <div className="table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>E-mail</th>
                      <th>CPF/CNPJ</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.cpf_cnpj || 'Não vinculado'}</td>
                        <td>
                          <span className={`status-badge ${user.profile_completed ? 'complete' : 'pending'}`}>
                            {user.profile_completed ? 'Validado' : 'Pendente'}
                          </span>
                        </td>
                        <td><button className="btn-action-view">Ver Detalhes</button></td>
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
            <div className="welcome-box">
              <p>Bem-vindo, <strong>{currentUser?.name || 'Usuário'}</strong>.</p>
              <p>Seu acesso é operacional.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}