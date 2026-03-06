import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

// Importando os novos componentes
import Sidebar from '../components/dashboard/Sidebar';
import UserTable from '../components/dashboard/UserTable';
import AuditTable from '../components/dashboard/AuditTable'; // Crie seguindo a lógica da UserTable

export default function Dashboard() {
  const navigate = useNavigate();
  const [role] = useState(localStorage.getItem('@AxionID:role'));
  const [activeTab, setActiveTab] = useState('users'); 
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const profileRes = await api.get('/api/v1/me');
        setCurrentUser(profileRes.data);
        if (role === 'admin') loadUsers();
      } catch (err) { navigate('/login'); }
      finally { setLoading(false); }
    };
    loadInitialData();
  }, [role, navigate]);

// ETAPA: Carregar Usuários (Apenas para Admins)
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/users');
      // Tratamos se a resposta vem direto ou dentro de um objeto 'data' (comum em paginação Laravel)
      setUsers(res.data.data || res.data);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      // Opcional: setErrors("Falha ao carregar lista de usuários");
    } finally {
      setLoading(false);
    }
  };

  // ETAPA: Carregar Histórico de Auditoria
  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/audit-logs');
      setAuditLogs(res.data.data || res.data);
    } catch (err) {
      console.error("Erro ao carregar logs:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (role !== 'admin') return;
    activeTab === 'users' ? loadUsers() : loadAuditLogs();
  }, [activeTab, role]);

  const handleLogout = async () => {
    try { await api.post('/api/v1/logout'); } 
    finally { localStorage.clear(); navigate('/login'); }
  };

  return (
    <div className="dashboard-layout animate-in">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        role={role} 
        onLogout={handleLogout} 
      />

      <div className="main-wrapper">
        <header className="main-header">
           <h2>{activeTab === 'users' ? 'Gestão de Usuários' : 'Auditoria'}</h2>
           <div className="header-user">
             <strong>{currentUser?.name}</strong>
             <div className="nav-avatar">{currentUser?.name?.charAt(0)}</div>
           </div>
        </header>

<main className="content-area">
  {/* Banner de Perfil permanece igual */}
  {currentUser && !currentUser.profile_completed && (
    <div className="profile-sidebar-alert">
      ⚠️ Finalize seu cadastro: <button onClick={() => navigate('/complete-profile')}>Completar</button>
    </div>
  )}

  {/* Container com altura mínima para evitar o "pulo" */}
  <div className={`tab-wrapper ${loading ? 'is-loading' : ''}`}>
    {activeTab === 'users' && (
      role === 'admin' ? <UserTable users={users} /> : <WelcomeOperacional user={currentUser} />
    )}
    {activeTab === 'audit' && <AuditTable logs={auditLogs} />}
    
    {/* Overlay de carregamento sutil em vez de trocar a tela toda */}
    {loading && (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <span>Atualizando dados...</span>
      </div>
    )}
  </div>
</main>
      </div>
    </div>
  );
}

// Subcomponente simples interno
function WelcomeOperacional({ user }) {
  return (
    <div className="table-card" style={{padding: '40px', textAlign: 'center'}}>
      <h3>Área do Cliente</h3>
      <p>ID: {user?.email}</p>
    </div>
  );
}