import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [role] = useState(localStorage.getItem('@AxionID:role'));
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pega os dados do usuário logado direto do storage (salvo no login/register)
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('user_data');
    return savedUser ? JSON.parse(savedUser) : null;
  });

// Dentro do seu Dashboard.jsx

useEffect(() => {
  const verificarStatusSempre = async () => {
    try {
      // Buscamos a lista de usuários
      const response = await api.get('/api/v1/users');
      
      // Pegamos o e-mail do usuário logado (que foi salvo no login)
      const emailLogado = localStorage.getItem('@AxionID:email'); 
      
      if (response.data && response.data.data) {
        // Encontra o registro exato de quem está logado agora
        const euMesmo = response.data.data.find(u => u.email === emailLogado);
        
        if (euMesmo) {
          setCurrentUser(euMesmo);
          // Atualiza o storage para garantir
          localStorage.setItem('user_data', JSON.stringify(euMesmo));
          
          // FORÇAR EXIBIÇÃO: Se completed for 0 ou não tiver CPF/CEP, o alerta DEVE aparecer
          // Independente de ser novo ou antigo
          if (euMesmo.completed === 0 || !euMesmo.cpf_cnpj) {
            console.log("Usuário incompleto detectado, exibindo alerta...");
          }
        }
      }
    } catch (error) {
      console.error("Erro ao validar status do usuário");
    }
  };

  verificarStatusSempre();
}, []);
  const refreshUserData = async () => {
    try {
      // Tente usar um endpoint específico para "mim" ou filtre pelo email no storage
      const response = await api.get('/api/v1/users');
      if (response.data && response.data.data) {
        const me = response.data.data.find(u => u.email === currentUser?.email);
        if (me) {
          setCurrentUser(me);
          localStorage.setItem('user_data', JSON.stringify(me));
        }
      }
    } catch (error) {
      console.error("Erro ao sincronizar perfil");
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
      console.error("Erro ao carregar usuários");
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
      
      {/* ALERTA: Agora checa o campo 'completed' ou se o endereço existe */}
      {currentUser && (currentUser.completed === 0 || !currentUser.zip_code) && (
        <div className="profile-sidebar-alert animate-in">
          <div className="alert-header">
            <span className="alert-icon">⚠️</span>
            <strong>Ação Requerida</strong>
          </div>
          <p>Olá {currentUser.name}, seu cadastro está incompleto. Por favor, informe seu endereço.</p>
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
                  {users.map((user) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="content-card">
            <h3>Área Operacional</h3>
            <p>Bem-vindo, <strong>{currentUser?.name}</strong>.</p>
            <p>Seu acesso é de visualização comum.</p>
          </div>
        )}
      </main>
    </div>
  );
}