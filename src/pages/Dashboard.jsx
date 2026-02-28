import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [role] = useState(localStorage.getItem('@AxionID:role'));
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // PEGA O USUÁRIO DIRETO DO STORAGE PARA O ALERTA APARECER IMEDIATAMENTE
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user_data');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    // 1. Se for Admin, tenta carregar a lista de usuários
    if (role === 'admin') {
      fetchUsers();
    }
    
    // 2. Tenta atualizar os dados do usuário atual (sem derrubar o app se der 403)
    refreshProfile();
  }, [role]);

  const refreshProfile = async () => {
    try {
      // Se você tiver um endpoint /api/v1/me use-o aqui. 
      // Se não, os dados do localStorage (setados no login/register) já bastam para o alerta.
    } catch (e) {
      // Ignora erro de permissão
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
      // Se cair aqui (403), o usuário logado apenas não é admin
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
      
      {/* ALERTA: Agora ele usa o currentUser que veio do localStorage no momento do login */}
      {currentUser && (Number(currentUser.completed) === 0 || !currentUser.cpf_cnpj) && (
        <div className="profile-sidebar-alert animate-in">
          <div className="alert-header">
            <span className="alert-icon">⚠️</span>
            <strong>Ação Requerida</strong>
          </div>
          <p>Olá <strong>{currentUser.name}</strong>, seu cadastro está incompleto. Por favor, finalize seu perfil.</p>
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
            <h3>Gestão de Identidades</h3>
            {/* Tabela de usuários aqui... */}
          </div>
        ) : (
          <div className="content-card">
            <h3>Área Operacional</h3>
            <p>Bem-vindo, <strong>{currentUser?.name || 'Usuário'}</strong>.</p>
            <p>Seu acesso é de visualização comum.</p>
          </div>
        )}
      </main>
    </div>
  );
}