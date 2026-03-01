import { useNavigate, useSearchParams } from 'react-router-dom'; // Adicionado useSearchParams
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Hook para ler a URL
  
  // Pegamos a role inicial, mas vamos atualizar ela assim que o usuário carregar
  const [role, setRole] = useState(localStorage.getItem('@AxionID:role'));
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      // 1. CAPTURA O TOKEN DO GOOGLE (Se houver na URL)
      const tokenFromUrl = searchParams.get('token');
      if (tokenFromUrl) {
        localStorage.setItem('@AxionID:token', tokenFromUrl);
        // Limpa a URL para o token não ficar exposto
        window.history.replaceState({}, document.title, "/dashboard");
      }

      // 2. VERIFICA SE ESTÁ LOGADO
      const token = localStorage.getItem('@AxionID:token');
      if (!token) {
        navigate('/');
        return;
      }

      // 3. CARREGA DADOS DO USUÁRIO ATUAL (Rota /me ou similar)
      try {
        // Sugestão: Use uma rota específica para o perfil logado em vez de filtrar a lista de users
        const response = await api.get('/api/v1/users'); 
        if (response.data && response.data.data) {
          const user = response.data.data[0];
          setCurrentUser(user);
          
          // Atualiza a role dinamicamente com base no banco
          const userRole = user.is_admin ? 'admin' : 'user';
          setRole(userRole);
          localStorage.setItem('@AxionID:role', userRole);

          // 4. Se for Admin, carrega a lista
          if (userRole === 'admin') {
            fetchUsers();
          }
        }
      } catch (error) {
        console.error("Erro ao validar sessão");
        // Se o token for inválido, o interceptor da API já deve deslogar, 
        // mas por segurança podemos limpar aqui se falhar:
        if(error.response?.status === 401) navigate('/');
      }
    };

    checkAuthAndLoad();
  }, [searchParams]); // Executa sempre que a URL mudar (ao chegar do Google)

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/users');
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
    } finally {
      localStorage.clear();
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="dashboard-container">
      {/* O resto do seu JSX permanece igual... */}
      {currentUser && (currentUser.profile_completed === false || !currentUser.cpf_cnpj) && (
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
              {/* Conteúdo Admin */}
              <div className="card-header-flex">
                <h3>Gestão de Identidades</h3>
                <span className="count-badge">{users.length} usuários</span>
              </div>
              {loading ? <p>Carregando...</p> : (
                <div className="table-container">
                    <table className="users-table">
                        {/* Tabela igual a sua */}
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
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.cpf_cnpj || '---'}</td>
                                    <td>{user.profile_completed ? 'Validado' : 'Pendente'}</td>
                                    <td><button className="btn-action-view">Ver</button></td>
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