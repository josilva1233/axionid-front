import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [role] = useState(localStorage.getItem('@AxionID:role'));
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // Para o alerta de perfil
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Busca dados do usuário logado para verificar o 'completed'
    fetchCurrentUser();

    // 2. Busca lista de usuários se for Admin
    if (role === 'admin') {
      fetchUsers();
    }
  }, [role]);

  const fetchCurrentUser = async () => {
    try {
      // Usualmente buscamos o primeiro da lista ou um endpoint /me
      const response = await api.get('/api/v1/users'); 
      if (response.data && response.data.data) {
        // Assume-se que o primeiro registro (ou um filtro) seja o usuário logado
        // Se tiver um endpoint /api/v1/me, é melhor usá-lo.
        setCurrentUser(response.data.data[0]); 
      }
    } catch (error) {
      console.error("Erro ao carregar perfil logado");
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/users');
      if (response.data && response.data.data) {
        setUsers(response.data.data);
      }
    } catch (error) {
      // Falha silenciosa
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
      
      {/* ALERTA LATERAL: Aparece apenas se o perfil estiver incompleto */}
      {currentUser && currentUser.completed === 0 && (
        <div className="profile-sidebar-alert animate-in">
          <div className="alert-header">
            <span className="alert-icon">⚠️</span>
            <strong>Ação Requerida</strong>
          </div>
          <p>Seu perfil de endereço está incompleto. Por favor, finalize seu cadastro.</p>
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