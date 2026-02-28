import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [role] = useState(localStorage.getItem('@AxionID:role'));
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estado para o usuário logado
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // 1. Carregar perfil do usuário logado (para o Alerta de CPF)
    const fetchMyProfile = async () => {
      try {
        // Buscamos na lista de usuários o nosso próprio registro
        const response = await api.get('/api/v1/users'); 
        // Se a API retornar uma lista, o primeiro costuma ser o logado ou filtramos
        if (response.data && response.data.data) {
          setCurrentUser(response.data.data[0]); 
        }
      } catch (error) {
        console.error("Erro ao carregar perfil atual");
      }
    };

    fetchMyProfile();

    // 2. Se for Admin, carrega a lista completa
    if (role === 'admin') {
      fetchUsers();
    }
  }, [role]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/users');
      // O seu Swagger indica que o Laravel retorna um objeto com "data"
      if (response.data && response.data.data) {
        setUsers(response.data.data);
      } else if (Array.isArray(response.data)) {
        setUsers(response.data);
      }
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
      
      {/* ALERTA DE PERFIL INCOMPLETO (Aparece no canto) */}
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
                            <div className="avatar-small">{user.name.charAt(0)}</div>
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