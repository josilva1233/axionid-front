import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react'; // Adicionado useCallback
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [role, setRole] = useState(localStorage.getItem('@AxionID:role'));
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // 1. Função de busca de usuários separada para evitar loops
  const fetchUsers = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    
    // 2. PRIORIDADE MÁXIMA: Se tem token na URL, salva AGORA
    if (tokenFromUrl) {
      localStorage.setItem('@AxionID:token', tokenFromUrl);
      // Atualiza o header do axios imediatamente para a próxima chamada não dar 401
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenFromUrl}`;
      
      // Limpa a URL e força o estado limpo
      window.history.replaceState({}, document.title, "/dashboard");
    }

    const validateAndLoad = async () => {
      const token = localStorage.getItem('@AxionID:token');

      if (!token) {
        navigate('/');
        return;
      }

      try {
        // 3. Pegamos os dados do usuário logado
        // Importante: se sua API retornar o usuário logado em response.data.data[0]
        const response = await api.get('/api/v1/users'); 
        if (response.data && response.data.data) {
          const user = response.data.data[0];
          setCurrentUser(user);
          
          const userRole = user.is_admin ? 'admin' : 'user';
          setRole(userRole);
          localStorage.setItem('@AxionID:role', userRole);

          if (userRole === 'admin') {
            fetchUsers();
          }
        }
      } catch (error) {
        // Se der erro 401, o interceptor do api.js vai cuidar do logout
        console.error("Sessão inválida");
      }
    };

    validateAndLoad();
  }, [searchParams, navigate, fetchUsers]);

  const handleLogout = async () => {
    try {
      await api.post('/api/v1/logout');
    } catch (e) {
      console.log("Sessão já encerrada");
    } finally {
      localStorage.clear();
      delete api.defaults.headers.common['Authorization'];
      navigate('/', { replace: true });
    }
  };

  // 4. Enquanto carrega o currentUser, evita renderizar o resto para não "piscar"
  if (!currentUser && localStorage.getItem('@AxionID:token')) {
    return <div className="loading-screen">Carregando painel...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* ALERTA DE PERFIL INCOMPLETO */}
      {currentUser && (currentUser.profile_completed === 0 || !currentUser.cpf_cnpj) && (
        <div className="profile-sidebar-alert animate-in">
          <div className="alert-header">
            <strong>⚠️ Ação Requerida</strong>
          </div>
          <p>Olá {currentUser.name}, complete seu cadastro.</p>
          <button onClick={() => navigate('/register?step=2&from_google=true')}>
            Completar agora
          </button>
        </div>
      )}

      <header className="dashboard-header">
        <h1>Axion<span>ID</span></h1>
        <div className="user-nav">
          <span>{role === 'admin' ? 'Admin' : 'Operacional'}</span>
          <button onClick={handleLogout} className="btn-logout">Sair</button>
        </div>
      </header>

      <main className="dashboard-content">
        {role === 'admin' ? (
          <div className="content-card">
            <h3>Gestão de Usuários ({users.length})</h3>
            {/* ... tabela de usuários ... */}
          </div>
        ) : (
          <div className="content-card">
            <h3>Bem-vindo, {currentUser?.name}</h3>
          </div>
        )}
      </main>
    </div>
  );
}