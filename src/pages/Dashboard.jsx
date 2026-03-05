import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // MUDANÇA: Inicie o role direto do localStorage para evitar atrasos na primeira renderização
  const [role, setRole] = useState(localStorage.getItem('@AxionID:role'));

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('@AxionID:token');
    const storedRole = localStorage.getItem('@AxionID:role');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    // Garante que o estado do componente está sincronizado com o storage
    setRole(storedRole);

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // 1. SEMPRE busca o perfil do usuário logado (Funciona para Admin e User)
        // Rota /me que você definiu no api.php
        const profileRes = await api.get('/api/v1/me');
        setCurrentUser(profileRes.data);

        // 2. SÓ busca a lista completa se for de fato ADMIN
        if (storedRole === 'admin') {
          const usersRes = await api.get('/api/v1/users');
          const data = usersRes.data.data || usersRes.data;
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        // Se der 401 aqui, o seu interceptor já vai cuidar do logout
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
      
      {/* ALERTA DE PERFIL INCOMPLETO */}
      {currentUser && (!currentUser.profile_completed || !currentUser.cpf_cnpj) && (
        <div className="profile-sidebar-alert animate-in">
          <div className="alert-header">
            <span className="alert-icon">⚠️</span>
            <strong>Ação Requerida</strong>
          </div>
          <p>Olá <strong>{currentUser.name}</strong>, finalize seu cadastro para validar sua identidade.</p>
          <button onClick={() => navigate('/complete-profile')} className="btn-alert-link">
            Completar agora →
          </button>
        </div>
      )}

      <header className="dashboard-header">
  <div className="brand" onClick={() => navigate('/dashboard')} style={{cursor: 'pointer'}}>
    <h1>Axion<span>ID</span></h1>
  </div>
  
  <div className="user-nav">
    <div className="user-profile-box">
      <div className="user-avatar-container">
         {/* Mostra a inicial do usuário logado */}
         <div className="nav-avatar">{currentUser?.name?.charAt(0)}</div>
         <span className="status-indicator"></span>
      </div>
      
      <div className="user-details-nav">
        <span className="nav-user-name">{currentUser?.name}</span>
        <div className="nav-meta">
          <span className="user-role-badge">
            {role === 'admin' ? 'Administrador' : 'Operacional'}
          </span>
        </div>
      </div>
    </div>

    <div className="nav-divider"></div>

    <button onClick={handleLogout} className="btn-logout-minimal" title="Sair do sistema">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
      <span>Sair</span>
    </button>
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
              <div className="loading-spinner">Carregando identidades...</div>
            ) : (
              <div className="table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>Nome</th>
                      <th>E-mail</th>
                      <th>Grupo</th>
                      <th>Status</th>
                      <th>Situação</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.is_admin ? 'Administrador' : 'Operacional'}</td>
                        <td>
                          <span className={`status-badge ${user.profile_completed ? 'complete' : 'pending'}`}>
                            {user.profile_completed ? 'Validado' : 'Pendente'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.is_active ? 'complete' : 'pending'}`}>
                            {user.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td>
                          <button className="btn-action-view" onClick={() => navigate(`/dashboard/user/${user.id}`)}>Ver Detalhes</button>
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
            <div className="card-header-flex">
              <h3>Área Operacional</h3>
            </div>
            <div className="welcome-box">
               <p>Bem-vindo, <strong>{currentUser?.name || 'Carregando...'}</strong>.</p>
               <p>Seu nível de acesso é <strong>Operacional</strong>. Você pode visualizar seus protocolos e validar sua identidade digital.</p>
               
               {/* Exemplo de info para o usuário comum */}
               <div className="user-stats-grid">
                  <div className="stat-item">
                    <span>E-mail</span>
                    <strong>{currentUser?.email}</strong>
                  </div>
                  <div className="stat-item">
                    <span>CPF/CNPJ</span>
                    <strong>{currentUser?.cpf_cnpj || 'Não informado'}</strong>
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}