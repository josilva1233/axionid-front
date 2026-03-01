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
  const initialize = async () => {
    // 1. Pega o token da URL (Google Login)
    const tokenFromUrl = searchParams.get('token');
    
    if (tokenFromUrl) {
      // SALVA COM A CHAVE NOVA
      localStorage.setItem('@AxionID:token', tokenFromUrl);
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenFromUrl}`;
      window.history.replaceState({}, document.title, "/dashboard");
    }

    // 2. Tenta recuperar o token (seja da URL que acabou de salvar ou do login normal)
    const token = localStorage.getItem('@AxionID:token');

    if (!token) {
      navigate('/'); // Se não tem token nenhum, volta pro login
      return;
    }

    // 3. Agora que garantimos o token, buscamos os dados
    try {
      const response = await api.get('/api/v1/me');
      setCurrentUser(response.data);
      setRole(response.data.is_admin ? 'admin' : 'user');
    } catch (error) {
      // Se der erro 401 aqui, o INTERCEPTOR já vai te jogar para o '/'
      console.error("Erro na autenticação");
    }
  };

  initialize();
}, [searchParams, navigate]);

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