import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Estados
  const [role, setRole] = useState(localStorage.getItem('@AxionID:role'));
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const initializeDashboard = async () => {
      // 1. Captura o token da URL (Caso venha do redirecionamento do Google)
      const tokenFromUrl = searchParams.get('token');
      
      if (tokenFromUrl) {
        localStorage.setItem('axion_token', tokenFromUrl);
        api.defaults.headers.common['Authorization'] = `Bearer ${tokenFromUrl}`;
        // Limpa a URL para não expor o token e para não reprocessar
        window.history.replaceState({}, document.title, "/dashboard");
      }

      // 2. Verifica se existe um token (na URL ou no LocalStorage)
      const token = localStorage.getItem('axion_token');
      if (!token) {
        navigate('/'); // Se não tem nada, volta pro login
        return;
      }

      // 3. Carregar perfil do usuário logado (usando a rota /me)
      try {
        const response = await api.get('/api/v1/me');
        const userData = response.data;
        setCurrentUser(userData);
        
        // Atualiza a Role no storage caso tenha mudado
        const userRole = userData.is_admin ? 'admin' : 'user';
        setRole(userRole);
        localStorage.setItem('@AxionID:role', userRole);

        // 4. Se for Admin, carrega a lista completa de usuários
        if (userData.is_admin) {
          fetchUsers();
        }
      } catch (error) {
        console.error("Erro ao carregar perfil atual ou token inválido");
        handleLogout(); // Se o token falhar, desloga
      }
    };

    initializeDashboard();
  }, [searchParams]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/users');
      // Ajuste conforme o retorno da sua API (objeto com data ou array)
      const data = response.data.data || response.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar lista de usuários");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/api/v1/logout');
    } catch (e) {
      console.warn("Sessão já expirada no servidor");
    } finally {
      localStorage.clear();
      delete api.defaults.headers.common['Authorization'];
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="dashboard-container">
      
      {/* ALERTA DE PERFIL INCOMPLETO */}
      {currentUser && (currentUser.profile_completed === 0 || !currentUser.cpf_cnpj) && (
        <div className="profile-sidebar-alert animate-in">
          <div className="alert-header">
            <span className="alert-icon">⚠️</span>
            <strong>Ação Requerida</strong>
          </div>
          <p>Olá <strong>{currentUser.name}</strong>, finalize seu cadastro para validar sua identidade.</p>
          <button onClick={() => navigate('/register?step=2&from_google=true')} className="btn-alert-link">
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
          <button onClick={handleLogout} className="btn-logout">
            Sair
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
                        <td>
                          <div className="user-td-name">
                            <div className="avatar-small">{(user.name || 'U').charAt(0)}</div>
                            {user.name}
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.cpf_cnpj || <small style={{color:'#666'}}>Não vinculado</small>}</td>
                        <td>
                          <span className={`status-badge ${user.profile_completed ? 'complete' : 'pending'}`}>
                            {user.profile_completed ? 'Validado' : 'Pendente'}
                          </span>
                        </td>
                        <td>
                          <button className="btn-action-view">Ver Detalhes</button>
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
            <div className="welcome-box">
               <p>Bem-vindo, <strong>{currentUser?.name || 'Usuário'}</strong>.</p>
               <p>Seu nível de acesso permite a visualização de seus dados e protocolos.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}